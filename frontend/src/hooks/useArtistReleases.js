import { useState, useEffect, useCallback } from 'react'

// La URL base de tu API. Es una buena práctica tenerla en una constante.
// En un proyecto real, esto vendría de una variable de entorno.
const API_URL = import.meta.env.VITE_API_URL

/**
 * Custom hook para obtener los releases en los que aparece un artista específico desde la API.
 *
 * @param {string} artistName - Nombre del artista para filtrar releases
 * @param {number} limit - Número máximo de releases a obtener (default: 3)
 *
 * @returns {{
 *   releases: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function
 * }}
 */
export function useArtistReleases (artistName, limit = 3) {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getArtistReleases = useCallback(async (signal) => {
    if (!artistName) {
      setReleases([])
      setLoading(false)
      return
    }

    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)

      // Codificamos el nombre del artista para manejar espacios y caracteres especiales
      const encodedArtistName = encodeURIComponent(artistName)
      const url = `${API_URL}/releases/artist/${encodedArtistName}?page=0&limit=${limit}`
      
      const response = await fetch(url, { signal })

      // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
      if (!response.ok) {
        if (response.status === 404) {
          // Si no se encuentran releases, no es un error, simplemente no hay datos
          setReleases([])
          setLoading(false)
          return
        }
        throw new Error(`Error al obtener los releases del artista: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Estructura de respuesta esperada: { data: [], pagination: {} } o directamente un array
      const releasesFromApi = responseData.data || responseData

      // Verificamos que tengamos un array
      if (!Array.isArray(releasesFromApi)) {
        throw new Error('La respuesta de la API no tiene el formato esperado')
      }

      // Mapeamos la respuesta de la API a la estructura que necesitan
      // nuestros componentes. Esto nos protege de cambios en la API.
      const mappedReleases = releasesFromApi.map((release) => ({
        id: release._id || release.id,
        title: release.title,
        subtitle: release.subtitle,
        spotifyLink: release.spotifyLink,
        youtubeLink: release.youtubeLink,
        appleMusicLink: release.appleMusicLink,
        instagramLink: release.instagramLink,
        soundCloudLink: release.soundCloudLink,
        beatStarsLink: release.beatStarsLink,
        video: release.video,
        img: release.img,
        releaseType: release.releaseType,
        date: release.date || release.createdAt
      }))

      setReleases(mappedReleases)
    } catch (e) {
      // Si el error es por abortar la petición, no hacemos nada.
      if (e.name !== 'AbortError') {
        console.error('Error al obtener releases del artista:', e)
        setError(e.message)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }, [artistName, limit])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    getArtistReleases(controller.signal)
    return () => controller.abort()
  }, [getArtistReleases])

  useEffect(() => {
    // Usamos AbortController para poder cancelar la petición fetch
    // si el componente se desmonta antes de que termine.
    const controller = new AbortController()
    const { signal } = controller

    getArtistReleases(signal)

    // Función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => {
      controller.abort()
    }
  }, [getArtistReleases]) // Dependemos de getArtistReleases que incluye artistName y limit

  // El hook devuelve el estado que los componentes necesitan.
  return { releases, loading, error, refetch }
}
