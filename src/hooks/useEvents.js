import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const EVENTS_ENDPOINT = `${API_URL}/events`

/**
 * Custom hook para obtener la lista de eventos desde la API con filtros, paginación y ordenación.
 *
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {string} options.type - Filtro por tipo de event
 * @param {string} options.location - Filtro por ubicación
 * @param {string} options.dateMin - Fecha mínima (ISO 8601)
 * @param {string} options.dateMax - Fecha máxima (ISO 8601)
 * @param {string} options.userId - Filtro por ID de usuario
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.count - Elementos por página (default: 10)
 * @param {string} options.sortBy - Campo por el que ordenar (default: 'date')
 * @param {string} options.sortOrder - Orden ascendente/descendente ('asc'|'desc', default: 'asc')
 *
 * @returns {{
 *   events: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   pagination: Object,
 *   refetch: Function
 * }}
 */
export function useEvents (options = {}) {
  const [events, setEvents] = useState([])
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
    count = 100,
    sortBy = 'date',
    sortOrder = 'asc'
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

  const getEvents = useCallback(async (signal) => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const queryParams = buildQueryParams()
      const url = `${EVENTS_ENDPOINT}?${queryParams}`

      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        throw new Error(`Error al obtener los eventos: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Estructura de respuesta esperada: { data: [], pagination: {} }
      const eventsFromApi = responseData.data || responseData
      const paginationData = responseData.pagination || {}

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedCards = eventsFromApi.map((event) => ({
        id: event._id,
        title: event.name,
        subtitle: event.location,
        spotifyLink: event.spotifyLink,
        youtubeLink: event.youtubeLink,
        appleMusicLink: event.appleMusicLink,
        instagramLink: event.instagramLink,
        soundCloudLink: event.soundCloudLink,
        beatStarsLink: event.beatStarsLink,
        video: event.video,
        eventType: event.eventType,
        location: event.location,
        date: event.date,
        img: event.img,
        // Campos adicionales
        name: event.name,
        colaborators: event.colaborators,
        description: event.description,
        // Campos de tickets
        ticketsEnabled: event.ticketsEnabled || false,
        ticketPrice: event.ticketPrice || 0,
        totalTickets: event.totalTickets || 0,
        availableTickets: event.availableTickets || 0,
        ticketsSold: event.ticketsSold || 0,
        ticketCurrency: event.ticketCurrency || 'EUR',
        saleStartDate: event.saleStartDate || null,
        saleEndDate: event.saleEndDate || null,
        externalTicketUrl: event.externalTicketUrl || ''
      }))

      setEvents(mappedCards)
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
    getEvents(controller.signal)
    return () => controller.abort()
  }, [getEvents])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getEvents(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getEvents]) // Dependemos de getEvents que incluye todos los filtros

  // El hook devuelve el estado que los componentes necesitan.
  return { events, loading, error, pagination, refetch }
}
