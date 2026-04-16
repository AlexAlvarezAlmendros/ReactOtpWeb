import { useState, useCallback } from 'react'
import { isValidSpotifyUrl, getSpotifyUrlType, extractSpotifyId, formatSpotifyError } from '../utils/spotifyHelpers'

/**
 * Hook personalizado para manejar la importación de datos desde Spotify
 * 
 * Proporciona funcionalidades completas para:
 * - Validación de URLs de Spotify
 * - Llamadas a API con manejo de errores
 * - Estados de loading y error
 * - Mapeo de tipos entre Spotify y aplicación
 * 
 * @hook
 * @returns {Object} Objeto con funciones y estados para manejar la importación
 * @returns {boolean} returns.loading - Indica si hay una importación en progreso
 * @returns {string|null} returns.error - Mensaje de error si algo falló, null si no hay errores
 * @returns {Object|null} returns.data - Datos importados desde Spotify, null si no se han importado datos
 * @returns {Function} returns.importFromSpotify - Función para importar datos desde URL de Spotify
 * @returns {Function} returns.reset - Función para resetear estados (error y data)
 * 
 * @example
 * const { importFromSpotify, loading, error, data, reset } = useSpotifyImport()
 * 
 * // Importar artista
 * await importFromSpotify('https://open.spotify.com/artist/123', 'artist')
 * 
 * // Verificar resultado
 * if (data) {
 *   console.log('Artista importado:', data.name)
 * }
 * 
 * if (error) {
 *   console.error('Error:', error)
 *   reset() // Limpiar error
 * }
 */
export function useSpotifyImport () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  /**
   * Importa datos desde una URL de Spotify
   * 
   * Valida la URL, extrae el ID de Spotify, determina el endpoint correcto
   * y realiza la llamada a la API para obtener los datos.
   * 
   * @async
   * @function
   * @param {string} spotifyUrl - URL de Spotify válida (artista, álbum o track)
   *                              Ejemplo: 'https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY'
   * @param {('artist'|'release')} type - Tipo de contenido a importar
   *                                      'artist' para artistas, 'release' para álbumes/tracks
   * @throws {Error} Lanza error si la URL no es válida, hay problemas de red, o incompatibilidad de tipos
   * 
   * @example
   * // Importar artista
   * try {
   *   await importFromSpotify('https://open.spotify.com/artist/123', 'artist')
   *   // Los datos estarán disponibles en el estado 'data'
   * } catch (error) {
   *   console.error('Error al importar:', error.message)
   * }
   */
  const importFromSpotify = useCallback(async (spotifyUrl, type) => {
    setLoading(true)
    setError(null)

    try {
      // Validar URL
      if (!isValidSpotifyUrl(spotifyUrl)) {
        throw new Error('URL de Spotify no válida. Verifica que sea un enlace correcto.')
      }

      const spotifyType = getSpotifyUrlType(spotifyUrl)
      const spotifyId = extractSpotifyId(spotifyUrl)

      if (!spotifyId) {
        throw new Error('No se pudo extraer el ID de la URL de Spotify.')
      }

      // Determinar endpoint según el tipo
      let endpoint
      if (type === 'artist' && spotifyType === 'artist') {
        endpoint = '/spotify/artist-info'
      } else if (type === 'release' && (spotifyType === 'album' || spotifyType === 'track')) {
        endpoint = '/spotify/release-info'
      } else {
        throw new Error(`Tipo de contenido no compatible. Se esperaba ${type} pero se encontró ${spotifyType}.`)
      }

      // Realizar llamada a la API
      const apiUrl = import.meta.env.VITE_API_URL
      

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spotifyUrl,
          spotifyId,
          type: spotifyType
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const importedData = await response.json()
      
      setData(importedData)

      return importedData
    } catch (err) {
      const formattedError = formatSpotifyError(err)
      setError(formattedError)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Limpia el estado del hook, reseteando errores y datos
   * 
   * Útil para limpiar el formulario después de una importación exitosa
   * o para reintentar después de un error.
   * 
   * @function
   * @example
   * // Limpiar después de error
   * if (error) {
   *   reset()
   * }
   * 
   * // Limpiar después de importación exitosa
   * if (data) {
   *   handleFormSubmit(data)
   *   reset() // Preparar para siguiente importación
   * }
   */
  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return {
    importFromSpotify,
    loading,
    error,
    data,
    reset
  }
}
