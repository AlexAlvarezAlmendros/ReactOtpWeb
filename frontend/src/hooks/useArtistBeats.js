import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

/**
 * Obtiene los beats en los que participa un artista,
 * filtrando por nombre en el campo `colaboradores` o `producer`.
 *
 * @param {string} artistName - Nombre del artista
 * @param {number} limit - Máximo de beats a mostrar (default 6)
 */
export function useArtistBeats (artistName, limit = 6) {
  const [beats, setBeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const parseColaboradores = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(c => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean)
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          return Array.isArray(parsed) ? parsed.map(c => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean) : [trimmed]
        } catch { return [trimmed] }
      }
      return trimmed.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  const getBeats = useCallback(async (signal) => {
    if (!artistName) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch a large batch to filter client-side
      const params = new URLSearchParams({ page: '1', count: '100', sortBy: 'createdAt', sortOrder: 'desc' })
      const response = await fetch(`${BEATS_ENDPOINT}?${params}`, { signal })

      if (!response.ok) throw new Error(`Error al obtener beats: ${response.statusText}`)

      const data = await response.json()
      const items = Array.isArray(data) ? data : (data.data || [])

      const lowerName = artistName.toLowerCase()

      const filtered = items.filter((beat) => {
        // Check producer
        const producerName = typeof beat.producer === 'object' ? beat.producer?.name : beat.producer
        if (producerName && producerName.toLowerCase().includes(lowerName)) return true

        // Check colaboradores
        const colabs = parseColaboradores(beat.colaboradores)
        return colabs.some(c => c.toLowerCase().includes(lowerName))
      }).slice(0, limit)

      setBeats(filtered)
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [artistName, limit])

  useEffect(() => {
    const controller = new AbortController()
    getBeats(controller.signal)
    return () => controller.abort()
  }, [getBeats])

  return { beats, loading, error }
}
