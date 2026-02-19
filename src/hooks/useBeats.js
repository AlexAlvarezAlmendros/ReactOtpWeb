import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

export function useBeats (options = {}) {
  const [beats, setBeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    count: 10,
    total: 0,
    pages: 0
  })
  const { getToken, isLoading: authLoading, isAuthenticated } = useAuth()

  // Destructure all supported query params with defaults
  const {
      page = 1,
      count = 10,
      genre = '',
      key = '',
      bpmMin = '',
      bpmMax = '',
      priceMin = '',
      priceMax = '',
      tag = '',
      title = '',
      userId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      authenticated = false
  } = options

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    
    // Required pagination params (with defaults)
    params.append('page', page.toString())
    params.append('count', count.toString())
    params.append('sortBy', sortBy)
    params.append('sortOrder', sortOrder)

    // Optional filters if they have values
    if (genre) params.append('genre', genre)
    if (key) params.append('key', key)
    if (bpmMin) params.append('bpmMin', bpmMin.toString())
    if (bpmMax) params.append('bpmMax', bpmMax.toString())
    if (priceMin) params.append('priceMin', priceMin.toString())
    if (priceMax) params.append('priceMax', priceMax.toString())
    if (tag) params.append('tag', tag)
    if (title) params.append('title', title)
    if (userId) params.append('userId', userId)

    return params.toString()
  }, [page, count, genre, key, bpmMin, bpmMax, priceMin, priceMax, tag, title, userId, sortBy, sortOrder])
  
  const getBeats = useCallback(async (signal) => {
    // If authenticated mode, wait until auth is ready
    if (authenticated && (authLoading || !isAuthenticated)) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const queryParams = buildQueryParams()
      const url = `${BEATS_ENDPOINT}?${queryParams}`

      const fetchOptions = { signal }
      if (authenticated) {
        try {
          const token = await getToken()
          if (token) {
            fetchOptions.headers = {
              Authorization: `Bearer ${token}`
            }
          }
        } catch (e) {
          console.warn('Could not get auth token for beats fetch:', e)
        }
      }

      const response = await fetch(url, fetchOptions)
      
      if (!response.ok) {
        throw new Error(`Error fetching beats: ${response.statusText}`)
      }
      
      const responseData = await response.json()
      
      // Expected structure: { data: [...], pagination: {...} }
      // Fallback to direct array if API changes
      const items = Array.isArray(responseData) ? responseData : (responseData.data || [])
      const paginationData = responseData.pagination || { page, count, total: items.length, pages: 1 }

      setBeats(items)
      setPagination(paginationData)
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error fetching beats:', e)
        setError(e.message)
      }
    } finally {
        if (!signal?.aborted) {
            setLoading(false)
        }
    }
  }, [buildQueryParams, authenticated, getToken, authLoading, isAuthenticated])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getBeats(controller.signal)
    return () => controller.abort()
  }, [getBeats])

  useEffect(() => {
    const controller = new AbortController()
    getBeats(controller.signal)
    return () => controller.abort()
  }, [getBeats])

  return { beats, loading, error, pagination, refetch }
}
