import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const STUDIOS_ENDPOINT = `${API_URL}/studios`

/**
 * Custom hook para obtener la lista de estudios desde la API con filtros, paginación y ordenación.
 *
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} options.type - Filtro por tipo de studio
 * @param {string} options.location - Filtro por ubicación
 * @param {string} options.dateMin - Fecha mínima (ISO 8601)
 * @param {string} options.dateMax - Fecha máxima (ISO 8601)
 * @param {string} options.userId - Filtro por ID de usuario
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.count - Elementos por página (default: 10)
 * @param {string} options.sortBy - Campo por el que ordenar (default: 'createdAt')
 * @param {string} options.sortOrder - Orden ascendente/descendente ('asc'|'desc', default: 'desc')
 *
 * @returns {{
 *   studios: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   pagination: Object,
 *   refetch: Function
 * }}
 */
export function useStudios (options = {}) {
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    count: 10,
    total: 0,
    pages: 0
  })

  const {
    type,
    location,
    dateMin,
    dateMax,
    userId,
    page = 1,
    count = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()

    // Filtros
    if (type) params.append('type', type)
    if (location) params.append('location', location)
    if (dateMin) params.append('dateMin', dateMin)
    if (dateMax) params.append('dateMax', dateMax)
    if (userId) params.append('userId', userId)

    // Paginación
    params.append('page', page.toString())
    params.append('count', count.toString())

    // Ordenación
    params.append('sortBy', sortBy)
    params.append('sortOrder', sortOrder)

    return params.toString()
  }, [type, location, dateMin, dateMax, userId, page, count, sortBy, sortOrder])

  const getStudios = useCallback(async (signal) => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const queryParams = buildQueryParams()
      const url = `${STUDIOS_ENDPOINT}?${queryParams}`

      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        throw new Error(`Error al obtener los estudios: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Estructura de respuesta esperada: { data: [], pagination: {} }
      const studiosFromApi = responseData.data || responseData
      const paginationData = responseData.pagination || {}

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedCards = studiosFromApi.map((studio) => ({
        id: studio._id,
        title: studio.name,
        subtitle: studio.location,
        spotifyLink: studio.spotifyLink,
        youtubeLink: studio.youtubeLink,
        appleMusicLink: studio.appleMusicLink,
        instagramLink: studio.instagramLink,
        soundCloudLink: studio.soundCloudLink,
        beatStarsLink: studio.beatStarsLink,
        video: studio.video,
        studioType: studio.studioType,
        location: studio.location,
        img: studio.img
      }))

      setStudios(mappedCards)
      setPagination(paginationData)
    } catch (e) {
      // Si el error es por abortar la petición, no hacemos nada.
      if (e.name !== 'AbortError') {
        console.error(e)
        setError(e.message)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }, [buildQueryParams])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getStudios(controller.signal)
    return () => controller.abort()
  }, [getStudios])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getStudios(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getStudios]) // Dependemos de getStudios que incluye todos los filtros

  // El hook devuelve el estado que los componentes necesitan.
  return { studios, loading, error, pagination, refetch }
}
