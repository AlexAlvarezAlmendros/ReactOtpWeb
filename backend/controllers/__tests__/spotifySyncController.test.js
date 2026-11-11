jest.mock('../../utils/dbConnection', () => jest.fn().mockResolvedValue());
jest.mock('../../services/indexNowService', () => ({
    ...jest.requireActual('../../services/indexNowService'),
    submit: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../services/discographySyncService', () => ({
    syncArtistDiscography: jest.fn()
}));

const Artist = require('../../models/Artist');
const Release = require('../../models/Release');
const indexNow = require('../../services/indexNowService');
const { syncArtistDiscography } = require('../../services/discographySyncService');
const {
    listSyncArtists,
    updateSyncArtist,
    syncArtistNow,
    listReviewReleases,
    reviewReleases
} = require('../spotifySyncController');
const { getReleases, getRelease, getReleasesByArtist } = require('../releaseController');
const { syncModeOf, syncModeToFields, publicReleaseFilter } = require('../../utils/releaseStatus');

const ARTIST_ID = '64b000000000000000000001';
const RELEASE_A = '64b0000000000000000000a1';
const RELEASE_B = '64b0000000000000000000b2';

function mockRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

/** Imita la cadena de Mongoose: find().sort().skip()... resuelve con `result`. */
function chain(result) {
    const query = {};
    for (const method of ['sort', 'skip', 'limit', 'select', 'populate', 'lean']) {
        query[method] = jest.fn(() => query);
    }
    query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    return query;
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('modos de sincronización', () => {
    test('los artistas sin configurar quedan en revisión', () => {
        expect(syncModeOf({})).toBe('review');
        expect(syncModeOf({ spotifySyncEnabled: true })).toBe('review');
        expect(syncModeOf({ spotifySyncEnabled: true, spotifyAutoPublish: true })).toBe('auto');
        expect(syncModeOf({ spotifySyncEnabled: false, spotifyAutoPublish: true })).toBe('off');
    });

    test('cada modo se guarda en los dos booleanos de la ficha', () => {
        expect(syncModeToFields('auto')).toEqual({ spotifySyncEnabled: true, spotifyAutoPublish: true });
        expect(syncModeToFields('review')).toEqual({ spotifySyncEnabled: true, spotifyAutoPublish: false });
        expect(syncModeToFields('off')).toEqual({ spotifySyncEnabled: false, spotifyAutoPublish: false });
    });

    test('el modelo pone publicado por defecto y en revisión al artista', () => {
        expect(new Release({}).status).toBe('published');
        expect(new Artist({}).spotifyAutoPublish).toBe(false);
    });
});

describe('IndexNow', () => {
    test('un borrador o un rechazado no avisan; uno publicado (o sin estado) sí', () => {
        const { urlsFor } = jest.requireActual('../../services/indexNowService');
        expect(urlsFor('Release', { _id: 'x', slug: 's', status: 'draft' })).toEqual([]);
        expect(urlsFor('Release', { _id: 'x', slug: 's', status: 'rejected' })).toEqual([]);
        expect(urlsFor('Release', { _id: 'x', slug: 's', status: 'published' })).toContain('https://www.otherpeople.es/discografia/s');
        expect(urlsFor('Release', { _id: 'x', slug: 's' })).toContain('https://www.otherpeople.es/discografia/s');
    });

    test('cambiar el modo de sincronización de un artista no es un cambio público', () => {
        const { touchesPublicFields } = jest.requireActual('../../services/indexNowService');
        expect(touchesPublicFields({ $set: { spotifySyncEnabled: true, spotifyAutoPublish: true } })).toBe(false);
    });
});

describe('API pública de releases', () => {
    test('el listado excluye borradores y rechazados', async () => {
        Release.find = jest.fn(() => chain([]));
        Release.countDocuments = jest.fn().mockResolvedValue(0);
        const res = mockRes();

        await getReleases({ query: {} }, res);

        expect(Release.find).toHaveBeenCalledWith(expect.objectContaining(publicReleaseFilter()));
        expect(Release.countDocuments).toHaveBeenCalledWith(expect.objectContaining(publicReleaseFilter()));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('no se puede pedir ?status=draft para ver los borradores', async () => {
        Release.find = jest.fn(() => chain([]));
        Release.countDocuments = jest.fn().mockResolvedValue(0);

        await getReleases({ query: { status: 'draft' } }, mockRes());

        expect(Release.find.mock.calls[0][0].status).toEqual({ $nin: ['draft', 'rejected'] });
    });

    test('la ficha de un borrador da 404', async () => {
        Release.findById = jest.fn().mockResolvedValue({ _id: RELEASE_A, status: 'draft', slug: 'x' });
        const res = mockRes();

        await getRelease({ params: { id: RELEASE_A } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('los releases por artista excluyen borradores', async () => {
        Release.find = jest.fn(() => chain([]));
        Release.countDocuments = jest.fn().mockResolvedValue(0);

        await getReleasesByArtist({ params: { artist: 'Uno' }, query: {} }, mockRes());

        expect(Release.find).toHaveBeenCalledWith(expect.objectContaining(publicReleaseFilter()));
    });
});

describe('GET /api/spotify-sync/artists', () => {
    test('devuelve el modo y los borradores pendientes de cada artista', async () => {
        Artist.find = jest.fn(() => chain([
            { _id: ARTIST_ID, name: 'Uno', spotifyLink: 'https://open.spotify.com/artist/x', spotifyAutoPublish: true },
            { _id: '64b000000000000000000002', name: 'Dos', spotifyLink: 'https://open.spotify.com/artist/y', spotifySyncEnabled: false }
        ]));
        Release.aggregate = jest.fn().mockResolvedValue([{ _id: ARTIST_ID, count: 3 }]);
        Release.countDocuments = jest.fn().mockResolvedValue(3);
        const res = mockRes();

        await listSyncArtists({}, res);

        const body = res.json.mock.calls[0][0];
        expect(body.totals).toEqual({ drafts: 3 });
        expect(body.data).toEqual([
            expect.objectContaining({ name: 'Uno', mode: 'auto', pendingDrafts: 3 }),
            expect.objectContaining({ name: 'Dos', mode: 'off', pendingDrafts: 0 })
        ]);
    });
});

describe('PATCH /api/spotify-sync/artists/:id', () => {
    test('guarda el modo sin pasar por los hooks de la ficha', async () => {
        Artist.updateOne = jest.fn().mockResolvedValue({ matchedCount: 1 });
        Artist.findById = jest.fn(() => chain({ _id: ARTIST_ID, name: 'Uno', spotifyAutoPublish: true }));
        Release.aggregate = jest.fn().mockResolvedValue([]);
        const res = mockRes();

        await updateSyncArtist({ params: { id: ARTIST_ID }, body: { mode: 'auto' } }, res);

        expect(Artist.updateOne).toHaveBeenCalledWith(
            { _id: ARTIST_ID },
            { $set: { spotifySyncEnabled: true, spotifyAutoPublish: true } }
        );
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mode: 'auto' }));
    });

    test('rechaza un modo desconocido', async () => {
        Artist.updateOne = jest.fn();
        const res = mockRes();

        await updateSyncArtist({ params: { id: ARTIST_ID }, body: { mode: 'siempre' } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Artist.updateOne).not.toHaveBeenCalled();
    });

    test('404 si el artista no existe', async () => {
        Artist.updateOne = jest.fn().mockResolvedValue({ matchedCount: 0 });
        const res = mockRes();

        await updateSyncArtist({ params: { id: ARTIST_ID }, body: { mode: 'off' } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe('POST /api/spotify-sync/artists/:id/sync', () => {
    test('sincroniza al artista y devuelve el resumen', async () => {
        Artist.findById = jest.fn()
            .mockResolvedValueOnce({ _id: ARTIST_ID, name: 'Uno' })
            .mockReturnValueOnce(chain({ _id: ARTIST_ID, name: 'Uno' }));
        Release.aggregate = jest.fn().mockResolvedValue([{ _id: ARTIST_ID, count: 2 }]);
        syncArtistDiscography.mockResolvedValue({ created: 2, drafts: 2 });
        const res = mockRes();

        await syncArtistNow({ params: { id: ARTIST_ID } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            summary: { created: 2, drafts: 2 },
            artist: expect.objectContaining({ pendingDrafts: 2 })
        }));
    });

    test('responde 429 si Spotify limita las peticiones', async () => {
        Artist.findById = jest.fn().mockResolvedValue({ _id: ARTIST_ID, name: 'Uno' });
        syncArtistDiscography.mockRejectedValue(Object.assign(new Error('rate'), { name: 'SpotifyRateLimitError', retryAfter: 30 }));
        const res = mockRes();

        await syncArtistNow({ params: { id: ARTIST_ID } }, res);

        expect(res.status).toHaveBeenCalledWith(429);
    });
});

describe('GET /api/spotify-sync/releases', () => {
    test('lista los borradores, filtrables por artista', async () => {
        Release.find = jest.fn(() => chain([{ _id: RELEASE_A }]));
        Release.countDocuments = jest.fn().mockResolvedValue(1);
        const res = mockRes();

        await listReviewReleases({ query: { artistId: ARTIST_ID } }, res);

        expect(Release.find).toHaveBeenCalledWith({ status: 'draft', artistIds: ARTIST_ID });
        expect(res.json.mock.calls[0][0].pagination).toMatchObject({ total: 1, page: 1 });
    });

    test('no deja listar los publicados por aquí', async () => {
        const res = mockRes();
        await listReviewReleases({ query: { status: 'published' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('POST /api/spotify-sync/releases/review', () => {
    beforeEach(() => {
        Release.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    });

    test('publicar un borrador lo saca a la web y avisa a IndexNow', async () => {
        Release.find = jest.fn(() => chain([{ _id: RELEASE_A, slug: 'mi-disco' }]));
        const res = mockRes();

        await reviewReleases({ body: { ids: [RELEASE_A, RELEASE_B], action: 'publish' } }, res);

        expect(Release.find).toHaveBeenCalledWith({
            _id: { $in: [RELEASE_A, RELEASE_B] },
            status: { $in: ['draft', 'rejected'] }
        });
        expect(Release.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ _id: { $in: [RELEASE_A] } }),
            { $set: { status: 'published', reviewedAt: expect.any(Date) } }
        );
        expect(indexNow.submit).toHaveBeenCalledWith(expect.arrayContaining([
            'https://www.otherpeople.es/discografia/mi-disco'
        ]));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ modified: 1, status: 'published' }));
    });

    test('rechazar solo afecta a borradores y no avisa a nadie', async () => {
        Release.find = jest.fn(() => chain([{ _id: RELEASE_A, slug: 'x' }]));

        await reviewReleases({ body: { ids: [RELEASE_A], action: 'reject' } }, mockRes());

        expect(Release.find.mock.calls[0][0].status).toEqual({ $in: ['draft'] });
        expect(Release.updateMany.mock.calls[0][1]).toEqual({ $set: { status: 'rejected', reviewedAt: expect.any(Date) } });
        expect(indexNow.submit).not.toHaveBeenCalled();
    });

    test('recuperar un rechazado lo devuelve a borradores', async () => {
        Release.find = jest.fn(() => chain([{ _id: RELEASE_A }]));

        await reviewReleases({ body: { ids: [RELEASE_A], action: 'restore' } }, mockRes());

        expect(Release.find.mock.calls[0][0].status).toEqual({ $in: ['rejected'] });
        expect(Release.updateMany.mock.calls[0][1].$set.status).toBe('draft');
    });

    test('si ya estaban revisados no toca nada', async () => {
        Release.find = jest.fn(() => chain([]));
        const res = mockRes();

        await reviewReleases({ body: { ids: [RELEASE_A], action: 'publish' } }, res);

        expect(Release.updateMany).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ modified: 0, ids: [] });
    });

    test.each([
        [{ ids: [RELEASE_A], action: 'borrar' }],
        [{ ids: [], action: 'publish' }],
        [{ ids: ['no-es-un-id'], action: 'publish' }],
        [{ action: 'publish' }]
    ])('valida la petición %#', async (body) => {
        Release.find = jest.fn();
        const res = mockRes();

        await reviewReleases({ body }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Release.find).not.toHaveBeenCalled();
    });
});
