const axios = require('axios');
const NodeCache = require('node-cache');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.tokenUrl = process.env.SPOTIFY_TOKEN_URL;
    this.apiBaseUrl = process.env.SPOTIFY_API_BASE_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Cache for API responses (1 hour TTL)
    this.cache = new NodeCache({ stdTTL: 3600 });
  }
  
  async getAccessToken() {
    try {
      // Si tenemos un token válido en cache, lo retornamos
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Preparar credenciales para autenticación
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.tokenUrl, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Expira 5 minutos antes del tiempo real para evitar problemas de timing
        this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
        return this.accessToken;
      } else {
        throw new Error('No access token received from Spotify');
      }
    } catch (error) {
      console.error('Error getting Spotify access token:', error.message);
      throw new Error('Failed to authenticate with Spotify API');
    }
  }

  extractIdFromUrl(spotifyUrl) {
    try {
      // Patrones para diferentes tipos de URLs de Spotify (incluyendo URLs con región como /intl-es/)
      const patterns = {
        artist: /(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z]{2}\/)?artist\/([a-zA-Z0-9]+)(?:\?.*)?/,
        album: /(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z]{2}\/)?album\/([a-zA-Z0-9]+)(?:\?.*)?/,
        track: /(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]+)(?:\?.*)?/
      };

      // Intentar extraer ID de artista
      let match = spotifyUrl.match(patterns.artist);
      if (match) {
        return { type: 'artist', id: match[1] };
      }

      // Intentar extraer ID de álbum
      match = spotifyUrl.match(patterns.album);
      if (match) {
        return { type: 'album', id: match[1] };
      }

      // Intentar extraer ID de track
      match = spotifyUrl.match(patterns.track);
      if (match) {
        return { type: 'track', id: match[1] };
      }

      throw new Error('Invalid Spotify URL format');
    } catch (error) {
      console.error('Error extracting ID from Spotify URL:', error.message);
      throw new Error('Could not extract ID from Spotify URL');
    }
  }

  async getArtistData(artistId) {
    try {
      // Verificar cache primero
      const cacheKey = `artist_${artistId}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener token de acceso
      const token = await this.getAccessToken();

      // Hacer request a la API de Spotify
      const response = await axios.get(`${this.apiBaseUrl}/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('No data received from Spotify API');
      }

      const artist = response.data;
      
      // Mapear datos al formato requerido
      const artistData = {
        name: artist.name || '',
        genres: artist.genres || [],
        images: artist.images || [],
        popularity: artist.popularity || 0,
        spotifyUrl: artist.external_urls?.spotify || '',
        followers: artist.followers?.total || 0
      };

      // Guardar en cache
      this.cache.set(cacheKey, artistData);

      return artistData;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Artist not found on Spotify');
      } else if (error.response?.status === 401) {
        // Token expirado, limpiar y reintentaral
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('Authentication failed with Spotify');
      }
      console.error('Error getting artist data:', error.message);
      throw new Error('Failed to get artist data from Spotify');
    }
  }

  /**
   * Devuelve la discografía completa de un artista paginando /artists/{id}/albums.
   *
   * @param {string} artistId - ID de artista en Spotify
   * @param {object} [options]
   * @param {string} [options.includeGroups='album,single,compilation'] - Grupos de Spotify a incluir
   * @param {string} [options.market='ES'] - Mercado para filtrar disponibilidad
   * @param {number} [options.maxAlbums=300] - Tope de seguridad para artistas con catálogos enormes
   * @returns {Promise<Array<object>>} Álbumes normalizados, sin duplicados por id
   */
  async getArtistAlbums(artistId, options = {}) {
    const {
      includeGroups = 'album,single,compilation',
      market = 'ES',
      maxAlbums = 300
    } = options;

    const cacheKey = `artist_albums_${artistId}_${includeGroups}_${market}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const pageSize = 50;
      const albums = [];
      const seenIds = new Set();
      let offset = 0;
      let hasNextPage = true;

      while (hasNextPage && albums.length < maxAlbums) {
        const response = await axios.get(`${this.apiBaseUrl}/artists/${artistId}/albums`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            include_groups: includeGroups,
            market,
            limit: pageSize,
            offset
          }
        });

        const page = response.data || {};

        for (const album of page.items || []) {
          // Spotify puede devolver el mismo álbum en varios grupos (p.ej. album y compilation)
          if (!album?.id || seenIds.has(album.id)) continue;
          seenIds.add(album.id);

          albums.push({
            id: album.id,
            name: album.name || '',
            artists: album.artists?.map(a => ({ id: a.id, name: a.name })) || [],
            releaseDate: album.release_date || '',
            releaseDatePrecision: album.release_date_precision || '',
            totalTracks: album.total_tracks || 0,
            images: album.images || [],
            spotifyUrl: album.external_urls?.spotify || '',
            albumType: album.album_type || 'album',
            albumGroup: album.album_group || album.album_type || 'album'
          });
        }

        hasNextPage = Boolean(page.next);
        offset += pageSize;
      }

      this.cache.set(cacheKey, albums);
      return albums;
    } catch (error) {
      this._handleApiError(error, 'artist albums');
    }
  }

  async getReleaseData(albumId) {
    const cacheKey = `album_${albumId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.apiBaseUrl}/albums/${albumId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { market: 'ES' }
      });

      const album = response.data;
      const releaseData = {
        name: album.name || '',
        artists: album.artists?.map(a => a.name) || [],
        releaseDate: album.release_date || '',
        totalTracks: album.total_tracks || 0,
        images: album.images || [],
        spotifyUrl: album.external_urls?.spotify || '',
        type: album.album_type || 'album'
      };

      this.cache.set(cacheKey, releaseData);
      return releaseData;
    } catch (error) {
      this._handleApiError(error, 'release data');
    }
  }

  async getTrackData(trackId) {
    const cacheKey = `track_${trackId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.apiBaseUrl}/tracks/${trackId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { market: 'ES' }
      });

      const track = response.data;
      const trackData = {
        name: track.name || '',
        artists: track.artists?.map(a => a.name) || [],
        releaseDate: track.album?.release_date || '',
        totalTracks: 1,
        images: track.album?.images || [],
        spotifyUrl: track.external_urls?.spotify || '',
        type: 'track'
      };

      this.cache.set(cacheKey, trackData);
      return trackData;
    } catch (error) {
      this._handleApiError(error, 'track data');
    }
  }

  _handleApiError(error, context) {
    const status = error.response?.status;
    if (status === 401) {
      this.accessToken = null;
      this.tokenExpiry = null;
      throw new Error('Authentication failed with Spotify');
    }
    if (status === 403) {
      throw new Error('Spotify API access denied — verify app credentials in the Developer Dashboard');
    }
    if (status === 404) {
      throw new Error(`${context} not found on Spotify`);
    }
    if (status === 429) {
      // Spotify indica en Retry-After cuántos segundos hay que esperar
      const retryAfter = parseInt(error.response?.headers?.['retry-after'], 10) || 30;
      const rateLimitError = new Error(`Spotify rate limit reached — retry after ${retryAfter}s`);
      rateLimitError.name = 'SpotifyRateLimitError';
      rateLimitError.retryAfter = retryAfter;
      throw rateLimitError;
    }
    console.error(`Error getting ${context}:`, error.message);
    throw new Error(`Failed to get ${context} from Spotify`);
  }

  // Método para limpiar cache manualmente
  clearCache() {
    this.cache.flushAll();
    console.log('Spotify service cache cleared');
  }

  // Método para obtener estadísticas del cache
  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      stats: this.cache.getStats()
    };
  }
}

module.exports = SpotifyService;
