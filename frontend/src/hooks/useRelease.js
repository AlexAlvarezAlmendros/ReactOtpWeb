import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Un lanzamiento por id o slug (el backend acepta los dos).
 * @returns {{ release: object|null, loading: boolean, error: string|null }}
 */
export function useRelease (idOrSlug) {
  const [release, setRelease] = useState(null)
  const [loading, setLoading] = useState(Boolean(idOrSlug))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idOrSlug) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/releases/${encodeURIComponent(idOrSlug)}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) throw new Error('Lanzamiento no encontrado')
        if (!res.ok) throw new Error(`Error al obtener el lanzamiento: ${res.statusText}`)
        const data = await res.json()
        setRelease({ ...data, id: data._id })
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [idOrSlug])

  return { release, loading, error }
}
