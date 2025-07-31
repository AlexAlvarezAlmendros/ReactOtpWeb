import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

/**
 * Custom hook para obtener un artista específico por su ID desde la API.
 *
 * @param {string} artistId - ID del artista a obtener
 *
 * @returns {{
 *   artist: object | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function
 * }}
 */
export function useArtist (artistId) {
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getArtist = useCallback(async (signal) => {
    if (!artistId) {
      setError('ID de artista requerido')
      setLoading(false)
      return
    }

    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      const url = `${ARTISTS_ENDPOINT}/${artistId}`
      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Artista no encontrado')
        }
        throw new Error(`Error al obtener el artista: ${response.statusText}`)
      }

      const artistFromApi = await response.json()

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedArtist = {
        id: artistFromApi._id,
        title: artistFromApi.name,
        subtitle: artistFromApi.genre,
        spotifyLink: artistFromApi.spotifyLink,
        youtubeLink: artistFromApi.youtubeLink,
        appleMusicLink: artistFromApi.appleMusicLink,
        instagramLink: artistFromApi.instagramLink,
        soundCloudLink: artistFromApi.soundCloudLink,
        beatStarsLink: artistFromApi.beatStarsLink,
        video: artistFromApi.video,
        artistType: artistFromApi.artistType,
        genre: artistFromApi.genre,
        img: artistFromApi.img,
        // Campos adicionales para la vista de detalle
        bio: artistFromApi.bio || '',
        location: artistFromApi.location || '',
        createdAt: artistFromApi.createdAt,
        updatedAt: artistFromApi.updatedAt
      }

      setArtist(mappedArtist)
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
  }, [artistId])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getArtist(controller.signal)
    return () => controller.abort()
  }, [getArtist])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getArtist(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getArtist]) // Dependemos de getArtist que incluye el artistId

  // El hook devuelve el estado que los componentes necesitan.
  return { artist, loading, error, refetch }
}
