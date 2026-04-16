const SpotifyService = require('../spotifyService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('SpotifyService', () => {
  let spotifyService;
  
  beforeEach(() => {
    // Reset environment variables for testing
    process.env.SPOTIFY_CLIENT_ID = 'test_client_id';
    process.env.SPOTIFY_CLIENT_SECRET = 'test_client_secret';
    process.env.SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
    process.env.SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
    
    spotifyService = new SpotifyService();
    jest.clearAllMocks();
  });
  
  describe('getAccessToken', () => {
    test('should get access token from Spotify API', async () => {
      const mockResponse = {
        data: {
          access_token: 'test_token',
          expires_in: 3600
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      const token = await spotifyService.getAccessToken();
      
      expect(token).toBe('test_token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });
    
    test('should return cached token if still valid', async () => {
      // Set up a valid token
      spotifyService.accessToken = 'cached_token';
      spotifyService.tokenExpiry = Date.now() + 1000000; // Future date
      
      const token = await spotifyService.getAccessToken();
      
      expect(token).toBe('cached_token');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
  
  describe('extractIdFromUrl', () => {
    test('should extract artist ID from Spotify URL', () => {
      const tests = [
        {
          url: 'https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY',
          expected: { type: 'artist', id: '4dpARuHxo51G3z768sgnrY' }
        },
        {
          url: 'https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY?si=abc123',
          expected: { type: 'artist', id: '4dpARuHxo51G3z768sgnrY' }
        },
        {
          url: 'open.spotify.com/artist/4dpARuHxo51G3z768sgnrY',
          expected: { type: 'artist', id: '4dpARuHxo51G3z768sgnrY' }
        },
        {
          url: 'https://open.spotify.com/intl-es/artist/4dpARuHxo51G3z768sgnrY',
          expected: { type: 'artist', id: '4dpARuHxo51G3z768sgnrY' }
        },
        {
          url: 'https://open.spotify.com/intl-en/artist/4dpARuHxo51G3z768sgnrY?si=test123',
          expected: { type: 'artist', id: '4dpARuHxo51G3z768sgnrY' }
        }
      ];
      
      tests.forEach(test => {
        const result = spotifyService.extractIdFromUrl(test.url);
        expect(result).toEqual(test.expected);
      });
    });
    
    test('should extract album ID from Spotify URL', () => {
      const tests = [
        {
          url: 'https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo',
          expected: { type: 'album', id: '1A2GTWGtFfWp7KSQTwWOyo' }
        },
        {
          url: 'https://open.spotify.com/intl-es/album/1A2GTWGtFfWp7KSQTwWOyo?si=abc123',
          expected: { type: 'album', id: '1A2GTWGtFfWp7KSQTwWOyo' }
        }
      ];
      
      tests.forEach(test => {
        const result = spotifyService.extractIdFromUrl(test.url);
        expect(result).toEqual(test.expected);
      });
    });
    
    test('should extract track ID from Spotify URL', () => {
      const tests = [
        {
          url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
          expected: { type: 'track', id: '4iV5W9uYEdYUVa79Axb7Rh' }
        },
        {
          url: 'https://open.spotify.com/intl-es/track/7vsOrcyJk9KRI3LEMUwj4f?si=dfe12ee382ef4511',
          expected: { type: 'track', id: '7vsOrcyJk9KRI3LEMUwj4f' }
        },
        {
          url: 'https://open.spotify.com/intl-fr/track/4iV5W9uYEdYUVa79Axb7Rh?si=test',
          expected: { type: 'track', id: '4iV5W9uYEdYUVa79Axb7Rh' }
        }
      ];
      
      tests.forEach(test => {
        const result = spotifyService.extractIdFromUrl(test.url);
        expect(result).toEqual(test.expected);
      });
    });
    
    test('should throw error for invalid URL', () => {
      expect(() => {
        spotifyService.extractIdFromUrl('https://invalid-url.com');
      }).toThrow('Could not extract ID from Spotify URL');
    });
  });
  
  describe('getArtistData', () => {
    test('should get artist data from Spotify API', async () => {
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 }
      };
      
      const mockArtistResponse = {
        data: {
          name: 'Test Artist',
          genres: ['pop', 'rock'],
          images: [{ url: 'https://example.com/image.jpg' }],
          popularity: 75,
          external_urls: { spotify: 'https://open.spotify.com/artist/123' },
          followers: { total: 1000000 }
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockTokenResponse);
      mockedAxios.get.mockResolvedValue(mockArtistResponse);
      
      const result = await spotifyService.getArtistData('123');
      
      expect(result).toEqual({
        name: 'Test Artist',
        genres: ['pop', 'rock'],
        images: [{ url: 'https://example.com/image.jpg' }],
        popularity: 75,
        spotifyUrl: 'https://open.spotify.com/artist/123',
        followers: 1000000
      });
    });
    
    test('should throw error for artist not found', async () => {
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 }
      };
      
      mockedAxios.post.mockResolvedValue(mockTokenResponse);
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 }
      });
      
      await expect(spotifyService.getArtistData('invalid_id')).rejects.toThrow('Artist not found on Spotify');
    });
  });
  
  describe('getReleaseData', () => {
    test('should get release data from Spotify API', async () => {
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 }
      };
      
      const mockAlbumResponse = {
        data: {
          name: 'Test Album',
          artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
          release_date: '2024-01-01',
          total_tracks: 12,
          images: [{ url: 'https://example.com/album.jpg' }],
          external_urls: { spotify: 'https://open.spotify.com/album/123' },
          album_type: 'album'
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockTokenResponse);
      mockedAxios.get.mockResolvedValue(mockAlbumResponse);
      
      const result = await spotifyService.getReleaseData('123');
      
      expect(result).toEqual({
        name: 'Test Album',
        artists: ['Artist 1', 'Artist 2'],
        releaseDate: '2024-01-01',
        totalTracks: 12,
        images: [{ url: 'https://example.com/album.jpg' }],
        spotifyUrl: 'https://open.spotify.com/album/123',
        type: 'album'
      });
    });
  });
  
  describe('Cache functionality', () => {
    test('should clear cache', () => {
      spotifyService.clearCache();
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
    
    test('should return cache stats', () => {
      const stats = spotifyService.getCacheStats();
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('stats');
    });
  });
});
