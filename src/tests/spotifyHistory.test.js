/**
 * Tests para las utilidades de historia de Spotify
 */
import {
  getSpotifyHistory,
  addToSpotifyHistory,
  clearSpotifyHistory,
  formatHistoryDate
} from '../utils/spotifyHistory'

describe('spotifyHistory', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('addToSpotifyHistory', () => {
    test('debe agregar nueva entrada al historial', () => {
      const entry = {
        url: 'https://open.spotify.com/artist/123',
        type: 'artist',
        name: 'Test Artist'
      }

      addToSpotifyHistory(entry.url, entry.type, entry.name)

      const history = getSpotifyHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        url: entry.url,
        type: entry.type,
        name: entry.name
      })
      expect(history[0].timestamp).toBeTruthy()
    })

    test('debe mantener el límite máximo de entradas', () => {
      // Agregar más de 5 entradas (límite máximo)
      for (let i = 0; i < 8; i++) {
        addToSpotifyHistory(
          `https://open.spotify.com/artist/${i}`,
          'artist',
          `Artist ${i}`
        )
      }

      const history = getSpotifyHistory()
      expect(history).toHaveLength(5)
      // Verificar que las más recientes están al principio
      expect(history[0].name).toBe('Artist 7')
      expect(history[4].name).toBe('Artist 3')
    })

    test('debe evitar duplicados por URL', () => {
      const url = 'https://open.spotify.com/artist/123'

      addToSpotifyHistory(url, 'artist', 'Artist 1')
      addToSpotifyHistory(url, 'artist', 'Artist 1 Updated')

      const history = getSpotifyHistory()
      expect(history).toHaveLength(1)
      expect(history[0].name).toBe('Artist 1 Updated')
    })

    test('debe mover entrada existente al principio', () => {
      // Agregar varias entradas
      addToSpotifyHistory('https://open.spotify.com/artist/1', 'artist', 'Artist 1')
      addToSpotifyHistory('https://open.spotify.com/artist/2', 'artist', 'Artist 2')
      addToSpotifyHistory('https://open.spotify.com/artist/3', 'artist', 'Artist 3')

      // Volver a agregar la primera
      addToSpotifyHistory('https://open.spotify.com/artist/1', 'artist', 'Artist 1')

      const history = getSpotifyHistory()
      expect(history).toHaveLength(3)
      expect(history[0].name).toBe('Artist 1')
      expect(history[1].name).toBe('Artist 3')
      expect(history[2].name).toBe('Artist 2')
    })
  })

  describe('getSpotifyHistory', () => {
    test('debe retornar array vacío si no hay historial', () => {
      const history = getSpotifyHistory()
      expect(history).toEqual([])
    })

    test('debe retornar historial ordenado correctamente', () => {
      addToSpotifyHistory('https://open.spotify.com/artist/1', 'artist', 'Artist 1')
      addToSpotifyHistory('https://open.spotify.com/artist/2', 'artist', 'Artist 2')
      addToSpotifyHistory('https://open.spotify.com/artist/3', 'artist', 'Artist 3')

      const history = getSpotifyHistory()
      expect(history[0].name).toBe('Artist 3')
      expect(history[1].name).toBe('Artist 2')
      expect(history[2].name).toBe('Artist 1')
    })

    test('debe manejar datos corruptos en localStorage', () => {
      localStorage.setItem('spotify_import_history', 'invalid json')

      const history = getSpotifyHistory()
      expect(history).toEqual([])
    })
  })

  describe('clearSpotifyHistory', () => {
    test('debe limpiar todo el historial', () => {
      addToSpotifyHistory('https://open.spotify.com/artist/1', 'artist', 'Artist 1')
      addToSpotifyHistory('https://open.spotify.com/artist/2', 'artist', 'Artist 2')

      expect(getSpotifyHistory()).toHaveLength(2)

      clearSpotifyHistory()

      expect(getSpotifyHistory()).toHaveLength(0)
      expect(localStorage.getItem('spotify_import_history')).toBeNull()
    })
  })

  describe('formatHistoryDate', () => {
    test('debe formatear fechas recientes como "Hace unos minutos"', () => {
      const recentDate = new Date().toISOString()
      const formatted = formatHistoryDate(recentDate)
      expect(formatted).toBe('Hace unos minutos')
    })

    test('debe formatear fechas de hace horas', () => {
      const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const formatted = formatHistoryDate(hoursAgo)
      expect(formatted).toBe('Hace 2 horas')
    })

    test('debe formatear fechas de ayer', () => {
      const yesterday = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      const formatted = formatHistoryDate(yesterday)
      expect(formatted).toBe('Ayer')
    })

    test('debe manejar fechas inválidas', () => {
      const formatted = formatHistoryDate('invalid-date')
      expect(formatted).toBe('Fecha desconocida')
    })
  })

  describe('integración con localStorage', () => {
    test('debe persistir y recuperar datos correctamente', () => {
      const entry = {
        url: 'https://open.spotify.com/artist/123',
        type: 'artist',
        name: 'Test Artist'
      }

      addToSpotifyHistory(entry.url, entry.type, entry.name)

      // Simular recarga de página verificando localStorage directamente
      const savedData = localStorage.getItem('spotify_import_history')
      expect(savedData).toBeTruthy()

      const parsedData = JSON.parse(savedData)
      expect(parsedData).toHaveLength(1)
      expect(parsedData[0]).toMatchObject({
        url: entry.url,
        type: entry.type,
        name: entry.name
      })
    })

    test('debe manejar errores de localStorage', () => {
      // Mock localStorage para que falle
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage full')
      })

      // No debe fallar al agregar al historial
      expect(() => {
        addToSpotifyHistory('https://open.spotify.com/artist/1', 'artist', 'Artist 1')
      }).not.toThrow()

      // Restaurar funcionamiento original
      localStorage.setItem = originalSetItem
    })
  })
})
