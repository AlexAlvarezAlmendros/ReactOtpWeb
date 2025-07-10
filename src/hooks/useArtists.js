import { useState, useEffect } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const ARTISTS_ENDPOINT = 'http://localhost:5001/api/artists'

/**
 * Custom hook para obtener la lista de artistas desde la API.
 *
 * @returns {{
 *   artists: Array<object>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */

export function useArtists () {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    const getArtists = async () => {
      try {
        // Reiniciamos los estados antes de cada petición
        setLoading(true)
        setError(null)

        const response = await fetch(ARTISTS_ENDPOINT, { signal })

        // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
        if (!response.ok) {
          throw new Error(`Error al obtener los artistas: ${response.statusText}`)
        }

        const artistsFromApi = await response.json()

        // Mapeamos la respuesta de la API a la estructura que necesitan
        // nuestros componentes. Esto nos protege de cambios en la API.
        const mappedCards = artistsFromApi.map((artist) => ({
          id: artist._id,
          name: artist.name,
          genre: artist.genre,
          spotifyLink: artist.spotifyLink,
          youtubeLink: artist.youtubeLink,
          appleMusicLink: artist.appleMusicLink,
          instagramLink: artist.instagramLink,
          soundCloudLink: artist.soundCloudLink,
          beatStarsLink: artist.beatStarsLink,
          profileUrl: artist.profileUrl,
          artistType: artist.artistType,
          img: artist.img
        }))

        setArtists(mappedCards)
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

    getArtists()

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, []) // El array de dependencias vacío [] asegura que el efecto se ejecute solo una vez.

  // El hook devuelve el estado que los componentes necesitan.
  return { artists, loading, error }
}
