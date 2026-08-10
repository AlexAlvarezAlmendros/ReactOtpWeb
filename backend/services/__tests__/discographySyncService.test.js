jest.mock('../../models/Release');
jest.mock('../../models/Artist');
jest.mock('../../utils/dbConnection');

const Release = require('../../models/Release');
const Artist = require('../../models/Artist');
const {
  normalizeTitle,
  parseReleaseDate,
  mapReleaseType,
  dedupeAlbums,
  mapAlbumToRelease,
  resolveSpotifyArtistId,
  syncArtistDiscography
} = require('../discographySyncService');

const buildAlbum = (overrides = {}) => ({
  id: 'album1',
  name: 'Primer Disco',
  artists: [{ id: 'spotifyArtist1', name: 'Artista Uno' }],
  releaseDate: '2024-03-15',
  releaseDatePrecision: 'day',
  totalTracks: 10,
  images: [{ url: 'https://i.scdn.co/image/big.jpg' }],
  spotifyUrl: 'https://open.spotify.com/album/album1',
  albumType: 'album',
  albumGroup: 'album',
  ...overrides
});

const buildArtist = (overrides = {}) => ({
  _id: 'artistObjectId',
  name: 'Artista Uno',
  spotifyLink: 'https://open.spotify.com/artist/spotifyArtist1',
  ...overrides
});

// Doble del servicio de Spotify: solo necesitamos las dos funciones que usa el sync
const buildSpotifyService = (albums = []) => ({
  getArtistAlbums: jest.fn().mockResolvedValue(albums),
  extractIdFromUrl: jest.requireActual('../spotifyService').prototype.extractIdFromUrl
});

describe('discographySyncService', () => {
  describe('normalizeTitle', () => {
    test('quita acentos, puntuación y sufijos de plataforma', () => {
      expect(normalizeTitle('Corazón Partío')).toBe('corazon partio');
      expect(normalizeTitle('Mi Disco - Single')).toBe('mi disco');
      expect(normalizeTitle('Mi Disco - EP')).toBe('mi disco');
      expect(normalizeTitle('  ¡Hola,  Mundo!  ')).toBe('hola mundo');
    });

    test('tolera valores vacíos', () => {
      expect(normalizeTitle(null)).toBe('');
      expect(normalizeTitle(undefined)).toBe('');
    });
  });

  describe('parseReleaseDate', () => {
    test('soporta las tres precisiones de Spotify', () => {
      expect(parseReleaseDate('2024').toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(parseReleaseDate('2024-03').toISOString()).toBe('2024-03-01T00:00:00.000Z');
      expect(parseReleaseDate('2024-03-15').toISOString()).toBe('2024-03-15T00:00:00.000Z');
    });

    test('devuelve null si no hay fecha o es inválida', () => {
      expect(parseReleaseDate('')).toBeNull();
      expect(parseReleaseDate('no-es-fecha')).toBeNull();
    });
  });

  describe('mapReleaseType', () => {
    test('mapea álbumes y recopilatorios a Album', () => {
      expect(mapReleaseType({ albumType: 'album', name: 'X', totalTracks: 12 })).toBe('Album');
      expect(mapReleaseType({ albumType: 'compilation', name: 'X', totalTracks: 20 })).toBe('Album');
    });

    test('distingue single de EP por número de pistas', () => {
      expect(mapReleaseType({ albumType: 'single', name: 'X', totalTracks: 1 })).toBe('Song');
      expect(mapReleaseType({ albumType: 'single', name: 'X', totalTracks: 3 })).toBe('Song');
      expect(mapReleaseType({ albumType: 'single', name: 'X', totalTracks: 5 })).toBe('EP');
    });

    test('detecta EP por el nombre aunque Spotify lo publique como album', () => {
      expect(mapReleaseType({ albumType: 'album', name: 'Verano EP', totalTracks: 6 })).toBe('EP');
    });
  });

  describe('dedupeAlbums', () => {
    test('se queda con la versión más completa del mismo disco y año', () => {
      const albums = [
        buildAlbum({ id: 'a', name: 'Mi Disco', totalTracks: 10 }),
        buildAlbum({ id: 'b', name: 'Mi Disco', totalTracks: 14 }), // reedición deluxe
        buildAlbum({ id: 'c', name: 'Otro Disco', totalTracks: 8 })
      ];

      const result = dedupeAlbums(albums);

      expect(result).toHaveLength(2);
      expect(result.find(a => normalizeTitle(a.name) === 'mi disco').id).toBe('b');
    });

    test('no fusiona discos con el mismo título de años distintos', () => {
      const albums = [
        buildAlbum({ id: 'a', name: 'Directo', releaseDate: '2019-01-01' }),
        buildAlbum({ id: 'b', name: 'Directo', releaseDate: '2024-01-01' })
      ];

      expect(dedupeAlbums(albums)).toHaveLength(2);
    });
  });

  describe('resolveSpotifyArtistId', () => {
    const spotifyService = buildSpotifyService();

    test('prefiere el id ya guardado en la ficha', () => {
      const artist = buildArtist({ spotifyArtistId: 'guardado' });
      expect(resolveSpotifyArtistId(artist, spotifyService)).toBe('guardado');
    });

    test('lo extrae del spotifyLink cuando no hay id', () => {
      expect(resolveSpotifyArtistId(buildArtist(), spotifyService)).toBe('spotifyArtist1');
    });

    test('devuelve null si el link no es de artista o no existe', () => {
      const albumLink = buildArtist({ spotifyLink: 'https://open.spotify.com/album/abc123' });
      expect(resolveSpotifyArtistId(albumLink, spotifyService)).toBeNull();
      expect(resolveSpotifyArtistId(buildArtist({ spotifyLink: '' }), spotifyService)).toBeNull();
      expect(resolveSpotifyArtistId(buildArtist({ spotifyLink: 'https://otra.web' }), spotifyService)).toBeNull();
    });
  });

  describe('mapAlbumToRelease', () => {
    test('mapea los campos del modelo Release', () => {
      const mapped = mapAlbumToRelease(
        buildAlbum({ artists: [{ id: 'spotifyArtist1', name: 'Artista Uno' }, { id: 'x', name: 'Feat Dos' }] }),
        buildArtist()
      );

      expect(mapped).toMatchObject({
        title: 'Primer Disco',
        subtitle: 'Artista Uno, Feat Dos',
        img: 'https://i.scdn.co/image/big.jpg',
        releaseType: 'Album',
        spotifyLink: 'https://open.spotify.com/album/album1',
        spotifyAlbumId: 'album1',
        source: 'spotify',
        artistIds: ['artistObjectId']
      });
      expect(mapped.date.toISOString()).toBe('2024-03-15T00:00:00.000Z');
      expect(mapped.userId).toBeTruthy();
    });
  });

  describe('syncArtistDiscography', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      Release.find = jest.fn().mockResolvedValue([]);
      Release.create = jest.fn().mockResolvedValue({});
      Release.updateOne = jest.fn().mockResolvedValue({});
      Artist.updateOne = jest.fn().mockResolvedValue({});
    });

    test('crea los releases que aún no existen', async () => {
      const spotifyService = buildSpotifyService([buildAlbum()]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary).toMatchObject({ created: 1, updated: 0, linked: 0, skipped: 0, total: 1 });
      expect(Release.create).toHaveBeenCalledWith(
        expect.objectContaining({ spotifyAlbumId: 'album1', source: 'spotify' })
      );
      expect(Artist.updateOne).toHaveBeenCalledWith(
        { _id: 'artistObjectId' },
        expect.objectContaining({
          $set: expect.objectContaining({ spotifyArtistId: 'spotifyArtist1' })
        })
      );
    });

    test('no duplica: actualiza el release ya importado de Spotify', async () => {
      Release.find = jest.fn()
        .mockResolvedValueOnce([{ _id: 'r1', spotifyAlbumId: 'album1', source: 'spotify', title: 'Primer Disco' }])
        .mockResolvedValueOnce([]);
      const spotifyService = buildSpotifyService([buildAlbum()]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary).toMatchObject({ created: 0, updated: 1 });
      expect(Release.create).not.toHaveBeenCalled();
      expect(Release.updateOne).toHaveBeenCalledWith(
        { _id: 'r1' },
        expect.objectContaining({ $set: expect.objectContaining({ title: 'Primer Disco' }) })
      );
    });

    test('respeta los campos editados a mano de un release adoptado', async () => {
      Release.find = jest.fn()
        .mockResolvedValueOnce([{ _id: 'r1', spotifyAlbumId: 'album1', source: 'manual', title: 'Título editado' }])
        .mockResolvedValueOnce([]);
      const spotifyService = buildSpotifyService([buildAlbum()]);

      await syncArtistDiscography(buildArtist(), { spotifyService });

      const [, update] = Release.updateOne.mock.calls[0];
      expect(update.$set).toEqual({ spotifySyncedAt: expect.any(Date) });
      expect(update.$set.title).toBeUndefined();
    });

    test('enlaza un release manual existente en vez de duplicarlo', async () => {
      Release.find = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: 'manual1', title: 'Primer  Disco', spotifyAlbumId: null, source: 'manual' }]);
      const spotifyService = buildSpotifyService([buildAlbum()]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary).toMatchObject({ created: 0, linked: 1 });
      expect(Release.create).not.toHaveBeenCalled();
      expect(Release.updateOne).toHaveBeenCalledWith(
        { _id: 'manual1' },
        expect.objectContaining({
          $set: expect.objectContaining({ spotifyAlbumId: 'album1' }),
          $addToSet: { artistIds: 'artistObjectId' }
        })
      );
    });

    test('omite álbumes sin carátula o sin fecha, que el modelo rechazaría', async () => {
      const spotifyService = buildSpotifyService([
        buildAlbum({ id: 'sinImagen', name: 'Sin Imagen', images: [] }),
        buildAlbum({ id: 'sinFecha', name: 'Sin Fecha', releaseDate: '' })
      ]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary).toMatchObject({ created: 0, skipped: 2 });
      expect(Release.create).not.toHaveBeenCalled();
    });

    test('descarta recopilatorios donde el artista no está acreditado', async () => {
      const spotifyService = buildSpotifyService([
        buildAlbum({ id: 'ajeno', artists: [{ id: 'otroArtista', name: 'Various Artists' }] })
      ]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary.total).toBe(0);
      expect(Release.create).not.toHaveBeenCalled();
    });

    test('no hace nada si el artista no tiene URL de Spotify válida', async () => {
      const spotifyService = buildSpotifyService([buildAlbum()]);
      const artist = buildArtist({ spotifyLink: '' });

      const summary = await syncArtistDiscography(artist, { spotifyService });

      expect(summary.skippedReason).toBe('NO_SPOTIFY_ARTIST_ID');
      expect(spotifyService.getArtistAlbums).not.toHaveBeenCalled();
      expect(Artist.updateOne).not.toHaveBeenCalled();
    });

    test('en dry-run no escribe en base de datos', async () => {
      const spotifyService = buildSpotifyService([buildAlbum()]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService, dryRun: true });

      expect(summary.created).toBe(1);
      expect(Release.create).not.toHaveBeenCalled();
      expect(Artist.updateOne).not.toHaveBeenCalled();
    });

    test('trata la colisión de clave única como duplicado ya existente', async () => {
      Release.create = jest.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));
      const spotifyService = buildSpotifyService([buildAlbum()]);

      const summary = await syncArtistDiscography(buildArtist(), { spotifyService });

      expect(summary).toMatchObject({ created: 0, skipped: 1 });
    });
  });
});
