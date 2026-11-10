import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL

export const POST_CATEGORIES = {
  guias: 'Guías para artistas',
  escena: 'Escena',
  produccion: 'Producción',
  noticias: 'Noticias del sello'
}

/** Artículos publicados de la revista. */
export function usePosts ({ count = 12, category } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ count: String(count) })
    if (category) params.set('category', category)
    setLoading(true)
    fetch(`${API_URL}/posts?${params}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(body => setPosts(body.data || []))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [count, category])

  return { posts, loading, error }
}

/** Un artículo por slug (o id). */
export function usePost (idOrSlug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(Boolean(idOrSlug))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idOrSlug) return
    const controller = new AbortController()
    setLoading(true)
    fetch(`${API_URL}/posts/${encodeURIComponent(idOrSlug)}`, { signal: controller.signal })
      .then(res => {
        if (res.status === 404) throw new Error('Artículo no encontrado')
        return res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))
      })
      .then(setPost)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [idOrSlug])

  return { post, loading, error }
}

/** Panel: todos los artículos (también borradores) y operaciones CRUD. */
export function usePostsAdmin () {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const request = useCallback(async (path, options = {}) => {
    const token = await getToken()
    const res = await fetch(`${API_URL}/posts${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
    return body
  }, [getToken])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const body = await request('?status=all&count=100')
      setPosts(body.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => { reload() }, [reload])

  const getFull = (id) => request(`/${id}`)
  const save = async (post) => {
    const saved = post._id
      ? await request(`/${post._id}`, { method: 'PATCH', body: JSON.stringify(post) })
      : await request('', { method: 'POST', body: JSON.stringify(post) })
    await reload()
    return saved
  }
  const remove = async (id) => {
    await request(`/${id}`, { method: 'DELETE' })
    await reload()
  }

  return { posts, loading, error, reload, getFull, save, remove }
}
