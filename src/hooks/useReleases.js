import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const RELEASES_ENDPOINT = `${API_URL}/releases`

/**
 * Custom hook para obtener la lista de lanzamientos desde la API con filtros, paginación y ordenación.
 *
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} options.type - Filtro por tipo de release
 * @param {string} options.subtitle - Filtro por subtitle
 * @param {string} options.dateMin - Fecha mínima (ISO 8601)
 * @param {string} options.dateMax - Fecha máxima (ISO 8601)
 * @param {string} options.userId - Filtro por ID de usuario
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.count - Elementos por página (default: 10)
 * @param {string} options.sortBy - Campo por el que ordenar (default: 'date')
 * @param {string} options.sortOrder - Orden ascendente/descendente ('asc'|'desc', default: 'desc')
 *
 * @returns {{
 *   releases: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   pagination: Object,
 *   refetch: Function
 * }}
 */
export function useReleases (options = {}) {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 0,
    count: 100,
    total: 0,
    pages: 0
  })

  const {
    type,
    subtitle,
    dateMin,
    dateMax,
    userId,
    page = 0,
    count = 100,
    sortBy = 'date',
    sortOrder = 'desc'
  } = options

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()

    // Filtros
    if (type) params.append('type', type)
    if (subtitle) params.append('subtitle', subtitle)
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
  }, [type, subtitle, dateMin, dateMax, userId, page, count, sortBy, sortOrder])

  const getReleases = useCallback(async (signal) => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const queryParams = buildQueryParams()
      const url = `${RELEASES_ENDPOINT}?${queryParams}`

      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        throw new Error(`Error al obtener los lanzamientos: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Estructura de respuesta esperada: { data: [], pagination: {} }
      const releasesFromApi = responseData.data || responseData
      const paginationData = responseData.pagination || {}

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedCards = releasesFromApi.map(release => ({
        id: release._id, // MongoDB usa _id por defecto
        title: release.title,
        subtitle: release.subtitle,
        spotifyLink: release.spotifyLink,
        youtubeLink: release.youtubeLink,
        appleMusicLink: release.appleMusicLink,
        instagramLink: release.instagramLink,
        soundCloudLink: release.soundCloudLink,
        beatStarsLink: release.beatStarsLink,
        video: release.video,
        releaseType: release.releaseType,
        date: release.date,
        img: release.img
      }))

      setReleases(mappedCards)
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
    getReleases(controller.signal)
    return () => controller.abort()
  }, [getReleases])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getReleases(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getReleases]) // Dependemos de getReleases que incluye todos los filtros

  // El hook devuelve el estado que los componentes necesitan.
  return { releases, loading, error, pagination, refetch }
}
