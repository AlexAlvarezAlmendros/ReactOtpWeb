import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

/**
 * Custom hook para obtener un beat individual por su ID.
 * Usa el Bearer token para recibir todos los archivos (WAV, STEMS, etc.)
 *
 * @param {string} beatId - ID del beat a obtener
 * @returns {{ beat: object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export function useBeat (beatId) {
  const [beat, setBeat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getToken, isLoading: authLoading, isAuthenticated } = useAuth()

  const getBeat = useCallback(async (signal) => {
    if (!beatId) {
      setError('ID de beat requerido')
      setLoading(false)
      return
    }

    // Wait for auth to be ready
    if (authLoading || !isAuthenticated) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = `${BEATS_ENDPOINT}/${beatId}`
      const fetchOptions = { signal }

      try {
        const token = await getToken()
        if (token) {
          fetchOptions.headers = {
            Authorization: `Bearer ${token}`
          }
        }
      } catch (e) {
        console.warn('Could not get auth token for beat fetch:', e)
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Beat no encontrado')
        }
        throw new Error(`Error al obtener el beat: ${response.statusText}`)
      }

      const beatData = await response.json()
      setBeat(beatData)
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error fetching beat:', e)
        setError(e.message)
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [beatId, getToken, authLoading, isAuthenticated])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getBeat(controller.signal)
    return () => controller.abort()
  }, [getBeat])

  useEffect(() => {
    const controller = new AbortController()
    getBeat(controller.signal)
    return () => controller.abort()
  }, [getBeat])

  return { beat, loading, error, refetch }
}
