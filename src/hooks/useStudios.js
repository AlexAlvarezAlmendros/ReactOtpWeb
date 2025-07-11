import { useState, useEffect } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const STUDIOS_ENDPOINT = `${API_URL}/studios`

/**
 * Custom hook para obtener la lista de estudios desde la API.
 *
 * @returns {{
 *   studios: Array<object>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */

export function useStudios () {
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    const getStudios = async () => {
      try {
        // Reiniciamos los estados antes de cada petición
        setLoading(true)
        setError(null)

        const response = await fetch(STUDIOS_ENDPOINT, { signal })

        // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
        if (!response.ok) {
          throw new Error(`Error al obtener los estudios: ${response.statusText}`)
        }

        const studiosFromApi = await response.json()

        // Mapeamos la respuesta de la API a la estructura que necesitan
        // nuestros componentes. Esto nos protege de cambios en la API.
        const mappedCards = studiosFromApi.map((studio) => ({
          id: studio._id,
          title: studio.name,
          subtitle: studio.location,
          colaborators: studio.colaborators,
          youtubeLink: studio.youtubeLink,
          instagramLink: studio.instagramLink,
          detailpageUrl: studio.detailpageUrl,
          studioType: studio.studioType,
          img: studio.img
        }))

        setStudios(mappedCards)
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

    getStudios()

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, []) // El array de dependencias vacío [] asegura que el efecto se ejecute solo una vez.

  // El hook devuelve el estado que los componentes necesitan.
  return { studios, loading, error }
}
