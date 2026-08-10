const Artist = require('../models/Artist');
const Release = require('../models/Release');
const SpotifyService = require('./spotifyService');
const connectDB = require('../utils/dbConnection');

/**
 * Sincroniza la discografía de los artistas registrados desde la API de Spotify.
 *
 * Cada artista con `spotifyLink` se resuelve a un ID de Spotify, se piden todos
 * sus álbumes (/artists/{id}/albums) y se hace upsert en la colección de releases
 * usando `spotifyAlbumId` como clave de idempotencia.
 *
 * Llamado por Vercel Cron vía /api/cron/sync-discography y por el script
 * migrations/backfill-spotify-discography.js para la carga inicial.
 */

// Los releases creados por el cron no tienen un usuario de Auth0 detrás.
const SYNC_USER_ID = process.env.SPOTIFY_SYNC_USER_ID || 'system|spotify-sync';

// Álbumes, singles/EPs y recopilatorios propios. No incluimos `appears_on`
// para no arrastrar colaboraciones y recopilatorios ajenos al sello.
const INCLUDE_GROUPS = 'album,single,compilation';

// Vercel corta las funciones serverless a los 10s en el plan Hobby: cada
// invocación procesa los artistas más desactualizados hasta agotar presupuesto.
const DEFAULT_TIME_BUDGET_MS = 8000;
const DEFAULT_MAX_ARTISTS = 25;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Normaliza un título para poder comparar releases entre Spotify y la BD.
 * Quita acentos, puntuación y sufijos de plataforma ("- Single", "- EP").
 */
const normalizeTitle = (title) => {
  return String(title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+-\s+(single|ep)$/i, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convierte la fecha de Spotify (YYYY, YYYY-MM o YYYY-MM-DD) en un Date válido.
 */
const parseReleaseDate = (releaseDate) => {
  if (!releaseDate) return null;
  const iso = releaseDate.length === 4
    ? `${releaseDate}-01-01`
    : releaseDate.length === 7
      ? `${releaseDate}-01`
      : releaseDate;
  const parsed = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Traduce el tipo de Spotify al enum de Release: ['Song', 'Album', 'EP', 'Videoclip'].
 * Spotify no distingue EPs: los publica como `single` con varias pistas.
 */
const mapReleaseType = (album) => {
  const albumType = (album.albumType || '').toLowerCase();

  if (/\bep\b/i.test(album.name || '')) return 'EP';
  if (albumType === 'album' || albumType === 'compilation') return 'Album';
  if (albumType === 'single') return (album.totalTracks || 1) >= 4 ? 'EP' : 'Song';
  return 'Song';
};

/**
 * Clave de deduplicación: Spotify publica el mismo disco con varios IDs
 * (reediciones por mercado, remasters con la misma fecha).
 */
const dedupeKey = (album) => `${normalizeTitle(album.name)}|${(album.releaseDate || '').slice(0, 4)}`;

/**
 * Descarta duplicados quedándose con la versión más completa de cada disco.
 */
const dedupeAlbums = (albums) => {
  const byKey = new Map();

  for (const album of albums) {
    const key = dedupeKey(album);
    const current = byKey.get(key);
    if (!current || (album.totalTracks || 0) > (current.totalTracks || 0)) {
      byKey.set(key, album);
    }
  }

  return Array.from(byKey.values());
};

/**
 * Mapea un álbum de Spotify a los campos del modelo Release.
 */
const mapAlbumToRelease = (album, artist) => {
  const date = parseReleaseDate(album.releaseDate);
  const img = album.images?.[0]?.url || '';

  return {
    title: album.name,
    subtitle: album.artists.map(a => a.name).join(', '),
    img,
    releaseType: mapReleaseType(album),
    date,
    spotifyLink: album.spotifyUrl,
    spotifyAlbumId: album.id,
    source: 'spotify',
    artistIds: artist ? [artist._id] : [],
    spotifySyncedAt: new Date(),
    userId: SYNC_USER_ID
  };
};

/**
 * Resuelve el ID de Spotify de un artista a partir de `spotifyArtistId` o del
 * `spotifyLink` guardado en su ficha.
 */
const resolveSpotifyArtistId = (artist, spotifyService) => {
  if (artist.spotifyArtistId) return artist.spotifyArtistId;
  if (!artist.spotifyLink) return null;

  try {
    const urlInfo = spotifyService.extractIdFromUrl(artist.spotifyLink);
    return urlInfo.type === 'artist' ? urlInfo.id : null;
  } catch {
    return null;
  }
};

/**
 * Sincroniza la discografía de un único artista.
 *
 * @param {object} artist - Documento Mongoose de Artist
 * @param {object} options
 * @param {SpotifyService} options.spotifyService
 * @param {boolean} [options.dryRun=false] - No escribe en BD, solo informa
 * @returns {Promise<object>} Resumen: created / updated / linked / skipped
 */
const syncArtistDiscography = async (artist, { spotifyService, dryRun = false } = {}) => {
  const summary = {
    artistId: String(artist._id),
    artistName: artist.name,
    created: 0,
    updated: 0,
    linked: 0,
    skipped: 0,
    total: 0
  };

  const spotifyArtistId = resolveSpotifyArtistId(artist, spotifyService);
  if (!spotifyArtistId) {
    return { ...summary, skippedReason: 'NO_SPOTIFY_ARTIST_ID' };
  }

  const albums = await spotifyService.getArtistAlbums(spotifyArtistId, {
    includeGroups: INCLUDE_GROUPS
  });

  // Los recopilatorios pueden venir acreditados a "Various Artists": nos
  // quedamos solo con los discos donde el artista aparece realmente acreditado.
  const ownAlbums = albums.filter(album =>
    album.artists.some(a => a.id === spotifyArtistId)
  );

  const candidates = dedupeAlbums(ownAlbums);
  summary.total = candidates.length;

  const albumIds = candidates.map(album => album.id);

  // Dos consultas por artista en lugar de una por álbum:
  // 1) releases ya vinculados a un álbum de Spotify
  // 2) releases creados a mano que aún no tienen spotifyAlbumId y podrían ser el mismo disco
  const [existingBySpotifyId, adoptables] = await Promise.all([
    Release.find({ spotifyAlbumId: { $in: albumIds } }),
    Release.find({
      spotifyAlbumId: null,
      $or: [
        { artistIds: artist._id },
        { subtitle: { $regex: new RegExp(escapeRegex(artist.name), 'i') } }
      ]
    })
  ]);

  const bySpotifyId = new Map(existingBySpotifyId.map(r => [r.spotifyAlbumId, r]));
  const byNormalizedTitle = new Map(adoptables.map(r => [normalizeTitle(r.title), r]));

  for (const album of candidates) {
    const mapped = mapAlbumToRelease(album, artist);

    // El modelo exige img y date; sin ellos no podemos crear el release.
    if (!mapped.img || !mapped.date) {
      summary.skipped++;
      continue;
    }

    const existing = bySpotifyId.get(album.id);

    if (existing) {
      // Un release manual "adoptado" conserva sus textos e imagen editados a mano.
      const update = existing.source === 'spotify'
        ? {
            title: mapped.title,
            subtitle: mapped.subtitle,
            img: mapped.img,
            releaseType: mapped.releaseType,
            date: mapped.date,
            spotifyLink: mapped.spotifyLink,
            spotifySyncedAt: mapped.spotifySyncedAt
          }
        : { spotifySyncedAt: mapped.spotifySyncedAt };

      if (!dryRun) {
        await Release.updateOne(
          { _id: existing._id },
          { $set: update, $addToSet: { artistIds: artist._id } }
        );
      }
      summary.updated++;
      continue;
    }

    const adoptable = byNormalizedTitle.get(normalizeTitle(album.name));

    if (adoptable) {
      // Ya existía creado a mano: lo enlazamos en vez de duplicarlo.
      if (!dryRun) {
        await Release.updateOne(
          { _id: adoptable._id },
          {
            $set: {
              spotifyAlbumId: album.id,
              spotifyLink: adoptable.spotifyLink || mapped.spotifyLink,
              spotifySyncedAt: mapped.spotifySyncedAt
            },
            $addToSet: { artistIds: artist._id }
          }
        );
      }
      byNormalizedTitle.delete(normalizeTitle(album.name));
      summary.linked++;
      continue;
    }

    if (!dryRun) {
      try {
        await Release.create(mapped);
      } catch (error) {
        // Carrera con otra ejecución del cron: el índice único ya lo cubre.
        if (error.code === 11000) {
          summary.skipped++;
          continue;
        }
        throw error;
      }
    }
    summary.created++;
  }

  if (!dryRun) {
    await Artist.updateOne(
      { _id: artist._id },
      {
        $set: {
          spotifyArtistId,
          spotifySyncedAt: new Date(),
          spotifySyncError: null
        }
      }
    );
  }

  return summary;
};

/**
 * Recorre los artistas más desactualizados y sincroniza su discografía.
 *
 * Trabaja por lotes con presupuesto de tiempo para no exceder el límite de
 * ejecución de Vercel: los artistas se ordenan por `spotifySyncedAt` ascendente
 * (los nunca sincronizados primero), así ejecuciones sucesivas van rotando.
 *
 * @param {object} [options]
 * @param {number} [options.maxArtists=25]
 * @param {number} [options.timeBudgetMs=8000]
 * @param {boolean} [options.dryRun=false]
 * @param {SpotifyService} [options.spotifyService]
 */
const syncAllDiscographies = async (options = {}) => {
  const {
    maxArtists = DEFAULT_MAX_ARTISTS,
    timeBudgetMs = DEFAULT_TIME_BUDGET_MS,
    dryRun = false,
    spotifyService = new SpotifyService()
  } = options;

  const startedAt = Date.now();
  console.log('🎧 Sincronizando discografías desde Spotify...');

  await connectDB();

  const artists = await Artist.find({
    spotifyLink: { $nin: [null, ''] },
    spotifySyncEnabled: { $ne: false }
  })
    .sort({ spotifySyncedAt: 1 })
    .limit(maxArtists);

  console.log(`   📊 ${artists.length} artista(s) en el lote`);

  const results = [];
  const totals = { created: 0, updated: 0, linked: 0, skipped: 0 };
  let processed = 0;
  let rateLimited = false;

  for (const artist of artists) {
    if (Date.now() - startedAt > timeBudgetMs) {
      console.log('   ⏱️ Presupuesto de tiempo agotado, el resto va en la próxima ejecución');
      break;
    }

    try {
      const summary = await syncArtistDiscography(artist, { spotifyService, dryRun });
      results.push(summary);
      totals.created += summary.created;
      totals.updated += summary.updated;
      totals.linked += summary.linked;
      totals.skipped += summary.skipped;
      processed++;

      console.log(
        `   ✅ ${artist.name}: +${summary.created} nuevos, ${summary.updated} actualizados, ` +
        `${summary.linked} enlazados, ${summary.skipped} omitidos`
      );
    } catch (error) {
      if (error.name === 'SpotifyRateLimitError') {
        // Paramos en seco: seguir insistiendo alarga el bloqueo de Spotify.
        console.warn(`   ⚠️ Rate limit de Spotify, reintentaremos en ${error.retryAfter}s`);
        rateLimited = true;
        break;
      }

      console.error(`   ❌ Error sincronizando ${artist.name}:`, error.message);
      results.push({
        artistId: String(artist._id),
        artistName: artist.name,
        error: error.message
      });

      if (!dryRun) {
        // Marcamos el intento para que el artista no bloquee la rotación del lote.
        await Artist.updateOne(
          { _id: artist._id },
          { $set: { spotifySyncedAt: new Date(), spotifySyncError: error.message } }
        );
      }
    }
  }

  const durationMs = Date.now() - startedAt;
  console.log(`   🏁 Sincronización terminada en ${durationMs}ms`);

  return {
    artistsInBatch: artists.length,
    artistsProcessed: processed,
    rateLimited,
    durationMs,
    totals,
    results
  };
};

module.exports = {
  syncAllDiscographies,
  syncArtistDiscography,
  // Exportados para tests
  normalizeTitle,
  parseReleaseDate,
  mapReleaseType,
  dedupeAlbums,
  mapAlbumToRelease,
  resolveSpotifyArtistId,
  SYNC_USER_ID,
  INCLUDE_GROUPS
};
