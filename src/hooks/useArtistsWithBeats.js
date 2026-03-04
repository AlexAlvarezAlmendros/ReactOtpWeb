import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_WITH_BEATS_ENDPOINT = `${API_URL}/artists/with-beats`

/**
 * Custom hook para obtener la lista de artistas que tienen beats publicados.
 * Se usa principalmente para poblar el dropdown de filtro en la página de Beats.
 *
 * @returns {{
 *   artists: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   total: number,
 *   refetch: Function
 * }}
 */
export function useArtistsWithBeats () {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const fetchArtists = useCallback(async (signal) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(ARTISTS_WITH_BEATS_ENDPOINT, { signal })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const raw = result.data || result
      const mapped = raw.map((artist) => ({
        id: artist._id,
        title: artist.name,
        img: artist.img
      }))
      setArtists(mapped)
      setTotal(result.total ?? mapped.length)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error al cargar artistas')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchArtists(controller.signal)
    return () => controller.abort()
  }, [fetchArtists])

  return { artists, loading, error, total, refetch: fetchArtists }
}
