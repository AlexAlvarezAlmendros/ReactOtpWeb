import { useState, useEffect } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const RELEASES_ENDPOINT = `${API_URL}/releases`
/**
 * Custom hook para obtener la lista de lanzamientos desde la API.
 *
 * @returns {{
 *   cards: Array<object>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */

export function useReleases () {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    const getReleases = async () => {
      try {
        // Reiniciamos los estados antes de cada petición
        setLoading(true)
        setError(null)

        const response = await fetch(RELEASES_ENDPOINT, { signal })

        // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
        if (!response.ok) {
          throw new Error(`Error al obtener los lanzamientos: ${response.statusText}`)
        }
        const releasesFromApi = await response.json()

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
    }

    getReleases()

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, []) // El array de dependencias vacío [] asegura que el efecto se ejecute solo una vez.

  // El hook devuelve el estado que los componentes necesitan.
  return { releases, loading, error }
}
