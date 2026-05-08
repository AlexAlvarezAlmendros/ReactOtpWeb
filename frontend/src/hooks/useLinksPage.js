import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export function useLinksPage (slug) {
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/artists/slug/${slug}`)
        if (!res.ok) throw new Error('Artista no encontrado')
        const data = await res.json()
        if (!cancelled) setArtist(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  return { artist, loading, error }
}
