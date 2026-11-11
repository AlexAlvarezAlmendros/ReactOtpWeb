const mongoose = require('mongoose');
const Artist = require('../models/Artist');
const Release = require('../models/Release');
const SpotifyService = require('../services/spotifyService');
const { syncArtistDiscography } = require('../services/discographySyncService');
const { submit: submitIndexNow, urlsFor } = require('../services/indexNowService');
const connectDB = require('../utils/dbConnection');
const { SYNC_MODES, syncModeOf, syncModeToFields } = require('../utils/releaseStatus');

/**
 * Panel → Spotify: qué artistas publican solos lo que sacan en Spotify y la
 * cola de borradores de los que no. Todo es solo para administradores.
 */

const spotifyService = new SpotifyService();

const ARTIST_FIELDS = 'name img slug spotifyLink spotifyArtistId spotifySyncEnabled spotifyAutoPublish spotifySyncedAt spotifySyncError';

const MAX_REVIEW_IDS = 200;

/**
 * Qué se puede hacer con un release desde la cola y desde qué estado.
 * Un release publicado no vuelve a borrador desde aquí: para quitarlo de la
 * web está el borrado de siempre.
 */
const REVIEW_ACTIONS = {
    publish: { from: ['draft', 'rejected'], to: 'published' },
    reject: { from: ['draft'], to: 'rejected' },
    restore: { from: ['rejected'], to: 'draft' }
};

const toArtistRow = (artist, pendingByArtist) => ({
    _id: artist._id,
    name: artist.name,
    img: artist.img,
    slug: artist.slug,
    spotifyLink: artist.spotifyLink,
    mode: syncModeOf(artist),
    spotifySyncedAt: artist.spotifySyncedAt,
    spotifySyncError: artist.spotifySyncError,
    pendingDrafts: pendingByArtist.get(String(artist._id)) || 0
});

const countDraftsByArtist = async () => {
    const rows = await Release.aggregate([
        { $match: { status: 'draft' } },
        { $unwind: '$artistIds' },
        { $group: { _id: '$artistIds', count: { $sum: 1 } } }
    ]);
    return new Map(rows.map(row => [String(row._id), row.count]));
};

// GET /api/spotify-sync/artists
const listSyncArtists = async (req, res) => {
    try {
        await connectDB();
        const [artists, pendingByArtist, totalDrafts] = await Promise.all([
            Artist.find({ spotifyLink: { $nin: [null, ''] } }).select(ARTIST_FIELDS).sort({ name: 1 }).lean(),
            countDraftsByArtist(),
            Release.countDocuments({ status: 'draft' })
        ]);
        res.status(200).json({
            data: artists.map(artist => toArtistRow(artist, pendingByArtist)),
            totals: { drafts: totalDrafts }
        });
    } catch (error) {
        console.error('❌ [spotify-sync] listSyncArtists:', error);
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/spotify-sync/artists/:id  { mode: 'auto' | 'review' | 'off' }
const updateSyncArtist = async (req, res) => {
    const { id } = req.params;
    const { mode } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Artista no encontrado' });
    }
    if (!SYNC_MODES.includes(mode)) {
        return res.status(400).json({ error: `mode debe ser uno de: ${SYNC_MODES.join(', ')}` });
    }

    try {
        await connectDB();
        // updateOne no dispara el aviso a IndexNow: la ficha pública no cambia.
        const result = await Artist.updateOne({ _id: id }, { $set: syncModeToFields(mode) });
        if (!result.matchedCount) {
            return res.status(404).json({ error: 'Artista no encontrado' });
        }
        const [artist, pendingByArtist] = await Promise.all([
            Artist.findById(id).select(ARTIST_FIELDS).lean(),
            countDraftsByArtist()
        ]);
        res.status(200).json(toArtistRow(artist, pendingByArtist));
    } catch (error) {
        console.error('❌ [spotify-sync] updateSyncArtist:', error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/spotify-sync/artists/:id/sync — sincroniza ya, sin esperar al cron.
const syncArtistNow = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Artista no encontrado' });
    }

    let artist;
    try {
        await connectDB();
        artist = await Artist.findById(id);
        if (!artist) {
            return res.status(404).json({ error: 'Artista no encontrado' });
        }

        const summary = await syncArtistDiscography(artist, { spotifyService });
        if (summary.skippedReason === 'NO_SPOTIFY_ARTIST_ID') {
            return res.status(400).json({
                error: 'NO_SPOTIFY_ARTIST_ID',
                message: 'El enlace de Spotify de la ficha no es el de un perfil de artista.'
            });
        }

        const [fresh, pendingByArtist] = await Promise.all([
            Artist.findById(id).select(ARTIST_FIELDS).lean(),
            countDraftsByArtist()
        ]);
        res.status(200).json({ summary, artist: toArtistRow(fresh, pendingByArtist) });
    } catch (error) {
        if (error.name === 'SpotifyRateLimitError') {
            return res.status(429).json({
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Spotify ha limitado las peticiones. Prueba dentro de ${error.retryAfter || 60} s.`,
                retryAfter: error.retryAfter
            });
        }
        console.error('❌ [spotify-sync] syncArtistNow:', error);
        if (artist) {
            await Artist.updateOne(
                { _id: artist._id },
                { $set: { spotifySyncedAt: new Date(), spotifySyncError: error.message } }
            ).catch(() => {});
        }
        res.status(500).json({ error: error.message });
    }
};

// GET /api/spotify-sync/releases?status=draft|rejected&artistId=&page=&count=
const listReviewReleases = async (req, res) => {
    const status = req.query.status || 'draft';
    if (!['draft', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'status debe ser draft o rejected' });
    }

    const filter = { status };
    if (req.query.artistId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.artistId)) {
            return res.status(400).json({ error: 'artistId no válido' });
        }
        filter.artistIds = req.query.artistId;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const count = Math.min(Math.max(parseInt(req.query.count, 10) || 50, 1), 100);

    try {
        await connectDB();
        const [releases, total] = await Promise.all([
            Release.find(filter)
                .sort({ date: -1, _id: -1 })
                .skip((page - 1) * count)
                .limit(count)
                .select('title subtitle img releaseType date spotifyLink spotifyAlbumId status artistIds createdAt reviewedAt slug')
                .populate('artistIds', 'name')
                .lean(),
            Release.countDocuments(filter)
        ]);
        res.status(200).json({
            data: releases,
            pagination: { page, count, total, pages: Math.ceil(total / count) }
        });
    } catch (error) {
        console.error('❌ [spotify-sync] listReviewReleases:', error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/spotify-sync/releases/review  { ids: [...], action: 'publish' | 'reject' | 'restore' }
const reviewReleases = async (req, res) => {
    const { ids, action } = req.body || {};
    const rule = REVIEW_ACTIONS[action];

    if (!rule) {
        return res.status(400).json({ error: `action debe ser uno de: ${Object.keys(REVIEW_ACTIONS).join(', ')}` });
    }
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_REVIEW_IDS) {
        return res.status(400).json({ error: `ids debe ser una lista de 1 a ${MAX_REVIEW_IDS} releases` });
    }
    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ error: 'Hay ids no válidos' });
    }

    try {
        await connectDB();
        const filter = { _id: { $in: ids }, status: { $in: rule.from } };

        // Los que de verdad cambian (puede que otro admin ya los haya revisado).
        const affected = await Release.find(filter).select('_id slug').lean();
        if (affected.length === 0) {
            return res.status(200).json({ modified: 0, ids: [] });
        }

        const affectedIds = affected.map(r => r._id);
        // updateMany no dispara los avisos a IndexNow; al publicar se avisa abajo.
        await Release.updateMany(
            { _id: { $in: affectedIds }, status: { $in: rule.from } },
            { $set: { status: rule.to, reviewedAt: new Date() } }
        );

        if (rule.to === 'published') {
            await submitIndexNow(affected.flatMap(doc => urlsFor('Release', { ...doc, status: 'published' })));
        }

        res.status(200).json({ modified: affected.length, ids: affectedIds, status: rule.to });
    } catch (error) {
        console.error('❌ [spotify-sync] reviewReleases:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listSyncArtists,
    updateSyncArtist,
    syncArtistNow,
    listReviewReleases,
    reviewReleases,
    REVIEW_ACTIONS
};
