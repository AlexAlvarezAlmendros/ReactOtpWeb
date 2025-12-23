import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const NEWSLETTERS_ENDPOINT = `${API_URL}/newsletters`

/**
 * Custom hook para obtener la lista de newsletters desde la API con filtros y paginación.
 *
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.count - Elementos por página (default: 10)
 * @param {string} options.sortBy - Campo por el que ordenar (default: 'date')
 * @param {string} options.sortOrder - Orden ascendente/descendente ('asc'|'desc', default: 'desc')
 *
 * @returns {{
 *   newsletters: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   pagination: Object,
 *   refetch: Function
 * }}
 */
export function useNewsletters (options = {}) {
  const { getToken } = useAuth()
  const [newsletters, setNewsletters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    count: 10,
    total: 0,
    pages: 0
  })

  // Extraemos las opciones asegurándonos de tener valores por defecto
  const {
    page = 1,
    count = 10,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options

  // Construimos query string
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    
    params.append('page', page.toString())
    params.append('count', count.toString())
    params.append('sortBy', sortBy)
    params.append('sortOrder', sortOrder)

    return params.toString()
  }, [page, count, sortBy, sortOrder])

  const getNewsletters = useCallback(async (signal) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = buildQueryParams()
      const url = `${NEWSLETTERS_ENDPOINT}?${queryParams}`

      console.log('Fetching newsletters:', url) // Debug

      const response = await fetch(url, { signal })

      if (!response.ok) {
        // Si es 404, puede ser que aún no haya endpoint, manejamos gracefully
        if (response.status === 404) {
           console.warn('Endpoint de newsletters no encontrado (404).')
           setNewsletters([])
           return
        }
        throw new Error(`Error al obtener newsletters: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      // Adaptar según la estructura real de tu API
      const items = responseData.data || responseData
      const paginationData = responseData.pagination || {}

      const mappedItems = items.map(item => ({
        _id: item._id || item.id,
        id: item._id || item.id,
        title: item.title,
        slug: item.slug,
        subject: item.subject,
        content: item.content,
        preview: item.preview,
        status: item.status || 'draft', // draft, sent, scheduled
        sentAt: item.sentAt,
        createdAt: item.createdAt,
        recipientCount: item.recipientCount || 0,
        upcomingReleases: item.upcomingReleases || []
      }))

      setNewsletters(mappedItems)
      setPagination(paginationData)

    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error fetching newsletters:', e)
        setError(e.message)
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [buildQueryParams])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getNewsletters(controller.signal)
    return () => controller.abort()
  }, [getNewsletters])

  useEffect(() => {
    const controller = new AbortController()
    getNewsletters(controller.signal)
    return () => controller.abort()
  }, [getNewsletters])

  /**
   * Crea una nueva newsletter
   * @param {Object} data - Datos de la newsletter
   */
  const createNewsletter = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const response = await fetch(NEWSLETTERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || `Error creating newsletter: ${response.status}`)
      }

      await refetch() // Recargar lista
      return await response.json()
    } catch (e) {
      console.error('Error creating newsletter:', e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { newsletters, loading, error, pagination, refetch, createNewsletter }
}
