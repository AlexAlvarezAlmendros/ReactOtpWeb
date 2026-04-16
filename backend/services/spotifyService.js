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

  async getReleaseData(albumId) {
    try {
      // Verificar cache primero
      const cacheKey = `album_${albumId}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener token de acceso
      const token = await this.getAccessToken();

      // Hacer request a la API de Spotify
      const response = await axios.get(`${this.apiBaseUrl}/albums/${albumId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('No data received from Spotify API');
      }

      const album = response.data;
      
      // Mapear datos al formato requerido
      const releaseData = {
        name: album.name || '',
        artists: album.artists?.map(artist => artist.name) || [],
        releaseDate: album.release_date || '',
        totalTracks: album.total_tracks || 0,
        images: album.images || [],
        spotifyUrl: album.external_urls?.spotify || '',
        type: album.album_type || 'album' // album, single, compilation
      };

      // Guardar en cache
      this.cache.set(cacheKey, releaseData);

      return releaseData;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Release not found on Spotify');
      } else if (error.response?.status === 401) {
        // Token expirado, limpiar y reintentar
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('Authentication failed with Spotify');
      }
      console.error('Error getting release data:', error.message);
      throw new Error('Failed to get release data from Spotify');
    }
  }

  async getTrackData(trackId) {
    try {
      // Verificar cache primero
      const cacheKey = `track_${trackId}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener token de acceso
      const token = await this.getAccessToken();

      // Hacer request a la API de Spotify
      const response = await axios.get(`${this.apiBaseUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('No data received from Spotify API');
      }

      const track = response.data;
      
      // Mapear datos al formato requerido (similar a release pero para tracks individuales)
      const trackData = {
        name: track.name || '',
        artists: track.artists?.map(artist => artist.name) || [],
        releaseDate: track.album?.release_date || '',
        totalTracks: 1, // Un track individual siempre es 1
        images: track.album?.images || [],
        spotifyUrl: track.external_urls?.spotify || '',
        type: 'track' // Siempre track para canciones individuales
      };

      // Guardar en cache
      this.cache.set(cacheKey, trackData);

      return trackData;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Track not found on Spotify');
      } else if (error.response?.status === 401) {
        // Token expirado, limpiar y reintentar
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('Authentication failed with Spotify');
      }
      console.error('Error getting track data:', error.message);
      throw new Error('Failed to get track data from Spotify');
    }
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
