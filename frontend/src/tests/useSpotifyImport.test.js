/**
 * Tests simplificados para el hook useSpotifyImport
 */
import { renderHook } from '@testing-library/react'
import { useSpotifyImport } from '../hooks/useSpotifyImport'

// Mock del fetch
global.fetch = jest.fn()

describe('useSpotifyImport', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test('debe inicializar con estado correcto', () => {
    const { result } = renderHook(() => useSpotifyImport())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
    expect(typeof result.current.importFromSpotify).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  test('debe resetear el estado correctamente', () => {
    const { result } = renderHook(() => useSpotifyImport())

    // Llamar a reset
    result.current.reset()

    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })
})
