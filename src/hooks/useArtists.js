import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

/**
 * Custom hook para obtener la lista de artistas desde la API con filtros, paginación y ordenación.
 *
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} options.type - Filtro por tipo de artist
 * @param {string} options.genre - Filtro por género
 * @param {string} options.dateMin - Fecha mínima (ISO 8601)
 * @param {string} options.dateMax - Fecha máxima (ISO 8601)
 * @param {string} options.userId - Filtro por ID de usuario
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.count - Elementos por página (default: 10)
 * @param {string} options.sortBy - Campo por el que ordenar (default: 'createdAt')
 * @param {string} options.sortOrder - Orden ascendente/descendente ('asc'|'desc', default: 'desc')
 *
 * @returns {{
 *   artists: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   pagination: Object,
 *   refetch: Function
 * }}
 */
export function useArtists (options = {}) {
  const [artists, setArtists] = useState([])
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
    genre,
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
    if (genre) params.append('genre', genre)
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
  }, [type, genre, dateMin, dateMax, userId, page, count, sortBy, sortOrder])

  const getArtists = useCallback(async (signal) => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const queryParams = buildQueryParams()
      const url = `${ARTISTS_ENDPOINT}?${queryParams}`

      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        throw new Error(`Error al obtener los artistas: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Estructura de respuesta esperada: { data: [], pagination: {} }
      const artistsFromApi = responseData.data || responseData
      const paginationData = responseData.pagination || {}

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedCards = artistsFromApi.map((artist) => ({
        id: artist._id,
        title: artist.name,
        subtitle: artist.genre,
        spotifyLink: artist.spotifyLink,
        youtubeLink: artist.youtubeLink,
        appleMusicLink: artist.appleMusicLink,
        instagramLink: artist.instagramLink,
        soundCloudLink: artist.soundCloudLink,
        beatStarsLink: artist.beatStarsLink,
        video: artist.video,
        artistType: artist.artistType,
        genre: artist.genre,
        img: artist.img
      }))

      setArtists(mappedCards)
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
    getArtists(controller.signal)
    return () => controller.abort()
  }, [getArtists])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getArtists(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getArtists]) // Dependemos de getArtists que incluye todos los filtros

  // El hook devuelve el estado que los componentes necesitan.
  return { artists, loading, error, pagination, refetch }
}
