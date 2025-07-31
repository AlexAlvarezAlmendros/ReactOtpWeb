import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const EVENTS_ENDPOINT = `${API_URL}/events`

/**
 * Custom hook para obtener un evento específico por su ID desde la API.
 *
 * @param {string} eventId - ID del evento a obtener
 *
 * @returns {{
 *   event: object | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function
 * }}
 */
export function useEvent (eventId) {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getEvent = useCallback(async (signal) => {
    if (!eventId) {
      setError('ID de evento requerido')
      setLoading(false)
      return
    }

    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const url = `${EVENTS_ENDPOINT}/${eventId}`
      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Evento no encontrado')
        }
        throw new Error(`Error al obtener el evento: ${response.statusText}`)
      }

      const eventFromApi = await response.json()

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedEvent = {
        id: eventFromApi._id,
        title: eventFromApi.name,
        subtitle: eventFromApi.location,
        spotifyLink: eventFromApi.spotifyLink,
        youtubeLink: eventFromApi.youtubeLink,
        appleMusicLink: eventFromApi.appleMusicLink,
        instagramLink: eventFromApi.instagramLink,
        soundCloudLink: eventFromApi.soundCloudLink,
        beatStarsLink: eventFromApi.beatStarsLink,
        video: eventFromApi.video,
        eventType: eventFromApi.eventType,
        location: eventFromApi.location,
        date: eventFromApi.date,
        img: eventFromApi.img,
        // Campos adicionales para la vista de detalle
        description: eventFromApi.description || '',
        colaborators: eventFromApi.colaborators || '',
        createdAt: eventFromApi.createdAt,
        updatedAt: eventFromApi.updatedAt
      }

      setEvent(mappedEvent)
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
  }, [eventId])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getEvent(controller.signal)
    return () => controller.abort()
  }, [getEvent])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getEvent(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getEvent]) // Dependemos de getEvent que incluye el eventId

  // El hook devuelve el estado que los componentes necesitan.
  return { event, loading, error, refetch }
}
