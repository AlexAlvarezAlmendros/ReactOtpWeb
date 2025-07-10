import { useState, useEffect } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const EVENTS_ENDPOINT = 'http://localhost:5001/api/events'

/**
 * Custom hook para obtener la lista de eventos desde la API.
 *
 * @returns {{
 *   events: Array<object>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */

export function useEvents () {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    const getEvents = async () => {
      try {
        // Reiniciamos los estados antes de cada petición
        setLoading(true)
        setError(null)

        const response = await fetch(EVENTS_ENDPOINT, { signal })

        // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
        if (!response.ok) {
          throw new Error(`Error al obtener los eventos: ${response.statusText}`)
        }

        const eventsFromApi = await response.json()

        // Mapeamos la respuesta de la API a la estructura que necesitan
        // nuestros componentes. Esto nos protege de cambios en la API.
        const mappedCards = eventsFromApi.map((event) => ({
          id: event._id,
          name: event.name,
          location: event.location,
          colaborators: event.colaborators,
          youtubeLink: event.youtubeLink,
          instagramLink: event.instagramLink,
          date: event.date,
          detailpageUrl: event.detailpageUrl,
          eventType: event.eventType,
          img: event.img
        }))

        setEvents(mappedCards)
      } catch (e) {
        // Si el error es por abortar la petición, no hacemos nada.
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    getEvents()

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, []) // El array de dependencias vacío [] asegura que el efecto se ejecute solo una vez.

  // El hook devuelve el estado que los componentes necesitan.
  return { events, loading, error }
}
