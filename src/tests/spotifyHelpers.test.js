/**
 * Tests para utilidades de Spotify
 */
import {
  isValidSpotifyUrl,
  getSpotifyUrlType,
  extractSpotifyId,
  mapSpotifyTypeToAppType,
  formatSpotifyError
} from '../utils/spotifyHelpers'

describe('spotifyHelpers', () => {
  describe('isValidSpotifyUrl', () => {
    test('debe validar URLs de artista correctas', () => {
      const validUrls = [
        'https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY',
        'http://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY',
        'https://spotify.com/artist/4dpARuHxo51G3z768sgnrY',
        'https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY?si=abc123'
      ]
      
      validUrls.forEach(url => {
        expect(isValidSpotifyUrl(url)).toBe(true)
      })
    })

    test('debe validar URLs de álbum correctas', () => {
      const validUrls = [
        'https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo',
        'https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo?si=def456'
      ]
      
      validUrls.forEach(url => {
        expect(isValidSpotifyUrl(url)).toBe(true)
      })
    })

    test('debe validar URLs de track correctas', () => {
      const validUrls = [
        'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh?si=ghi789'
      ]
      
      validUrls.forEach(url => {
        expect(isValidSpotifyUrl(url)).toBe(true)
      })
    })

    test('debe validar URLs internacionalizadas correctas', () => {
      const validUrls = [
        'https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb',
        'https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb?si=82a45967375d4726',
        'https://open.spotify.com/intl-en/artist/4dpARuHxo51G3z768sgnrY',
        'https://open.spotify.com/intl-fr/album/1A2GTWGtFfWp7KSQTwWOyo',
        'https://open.spotify.com/intl-de/playlist/37i9dQZF1DX0XUsuxWHRQd'
      ]
      
      validUrls.forEach(url => {
        expect(isValidSpotifyUrl(url)).toBe(true)
      })
    })

    test('debe rechazar URLs inválidas', () => {
      const invalidUrls = [
        '',
        null,
        undefined,
        'https://google.com',
        'https://youtube.com/watch?v=abc123',
        'spotify.com/artist/123',
        'https://open.spotify.com/',
        'https://open.spotify.com/invalid/123',
        'not-a-url'
      ]
      
      invalidUrls.forEach(url => {
        expect(isValidSpotifyUrl(url)).toBe(false)
      })
    })
  })

  describe('getSpotifyUrlType', () => {
    test('debe extraer el tipo correcto de URLs válidas', () => {
      expect(getSpotifyUrlType('https://open.spotify.com/artist/123')).toBe('artist')
      expect(getSpotifyUrlType('https://open.spotify.com/album/456')).toBe('album')
      expect(getSpotifyUrlType('https://open.spotify.com/track/789')).toBe('track')
    })

    test('debe extraer el tipo correcto de URLs internacionalizadas', () => {
      expect(getSpotifyUrlType('https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb')).toBe('track')
      expect(getSpotifyUrlType('https://open.spotify.com/intl-en/artist/123')).toBe('artist')
      expect(getSpotifyUrlType('https://open.spotify.com/intl-fr/album/456')).toBe('album')
      expect(getSpotifyUrlType('https://open.spotify.com/intl-de/playlist/789')).toBe('playlist')
    })

    test('debe retornar null para URLs inválidas', () => {
      expect(getSpotifyUrlType('https://google.com')).toBe(null)
      expect(getSpotifyUrlType('')).toBe(null)
      expect(getSpotifyUrlType(null)).toBe(null)
    })
  })

  describe('extractSpotifyId', () => {
    test('debe extraer IDs correctos', () => {
      expect(extractSpotifyId('https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY'))
        .toBe('4dpARuHxo51G3z768sgnrY')
      expect(extractSpotifyId('https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo?si=abc'))
        .toBe('1A2GTWGtFfWp7KSQTwWOyo')
    })

    test('debe extraer IDs correctos de URLs internacionalizadas', () => {
      expect(extractSpotifyId('https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb?si=82a45967375d4726'))
        .toBe('4NL9TP4qFHx7YcMHsXQrSb')
      expect(extractSpotifyId('https://open.spotify.com/intl-en/artist/4dpARuHxo51G3z768sgnrY'))
        .toBe('4dpARuHxo51G3z768sgnrY')
      expect(extractSpotifyId('https://open.spotify.com/intl-fr/album/1A2GTWGtFfWp7KSQTwWOyo'))
        .toBe('1A2GTWGtFfWp7KSQTwWOyo')
    })

    test('debe retornar null para URLs inválidas', () => {
      expect(extractSpotifyId('https://google.com')).toBe(null)
      expect(extractSpotifyId('')).toBe(null)
    })
  })

  describe('mapSpotifyTypeToAppType', () => {
    test('debe mapear tipos correctamente', () => {
      expect(mapSpotifyTypeToAppType('artist')).toBe('artist')
      expect(mapSpotifyTypeToAppType('album')).toBe('release')
      expect(mapSpotifyTypeToAppType('track')).toBe('release')
      expect(mapSpotifyTypeToAppType('invalid')).toBe('unknown')
    })
  })

  describe('formatSpotifyError', () => {
    test('debe formatear errores de red', () => {
      const networkError = new Error('Failed to fetch')
      expect(formatSpotifyError(networkError))
        .toContain('No se pudo conectar con Spotify')
    })

    test('debe formatear errores 404', () => {
      const error404 = { status: 404, message: 'Not found' }
      expect(formatSpotifyError(error404))
        .toContain('No se encontró el contenido en Spotify')
    })

    test('debe formatear errores 429', () => {
      const error429 = { status: 429, message: 'Too many requests' }
      expect(formatSpotifyError(error429))
        .toContain('Demasiadas solicitudes')
    })

    test('debe formatear errores de servidor', () => {
      const error500 = { status: 500, message: 'Internal server error' }
      expect(formatSpotifyError(error500))
        .toContain('Error del servidor de Spotify')
    })

    test('debe manejar errores genéricos', () => {
      const genericError = new Error('Generic error message')
      expect(formatSpotifyError(genericError))
        .toBe('Generic error message')
    })
  })
})
