/**
 * @fileoverview Utilidades para trabajar con URLs y datos de Spotify
 * 
 * Este módulo proporciona funciones para:
 * - Validar URLs de Spotify
 * - Extraer información de URLs (tipo, ID)
 * - Mapear tipos entre Spotify y la aplicación
 * - Formatear mensajes de error user-friendly
 * 
 * Soporta URLs de artistas, álbumes y tracks de Spotify.
 * 
 * @module spotifyHelpers
 * @version 1.0.0
 * @author ReactOtpWeb Team
 * 
 * @example
 * import { isValidSpotifyUrl, extractSpotifyId } from './spotifyHelpers'
 * 
 * if (isValidSpotifyUrl(url)) {
 *   const id = extractSpotifyId(url)
 *   console.log('ID extraído:', id)
 * }
 */

/**
 * Expresión regular para validar URLs de Spotify
 * Acepta URLs de artistas, álbumes y tracks con o sin parámetros de consulta
 * Incluye soporte para URLs internacionalizadas (ej: /intl-es/)
 * 
 * @constant {RegExp}
 * @example
 * // URLs válidas que coinciden:
 * // https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY
 * // https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3?si=123
 * // https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC
 * // https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb?si=123
 */
const SPOTIFY_URL_REGEX = /^https?:\/\/(open\.)?spotify\.com\/(intl-[a-z]{2}\/)?(?:embed\/)?(artist|album|track|playlist)\/[a-zA-Z0-9]+(\?.*)?$/

/**
 * Verifica si una URL es válida de Spotify
 * 
 * Valida que la URL tenga el formato correcto y apunte a contenido
 * de Spotify soportado (artista, álbum o track).
 * 
 * @function
 * @param {string} url - URL a validar
 * @returns {boolean} True si es una URL válida de Spotify, false en caso contrario
 * 
 * @example
 * // URLs válidas
 * isValidSpotifyUrl('https://open.spotify.com/artist/123') // true
 * isValidSpotifyUrl('https://open.spotify.com/album/456') // true
 * 
 * @example
 * // URLs inválidas
 * isValidSpotifyUrl('https://example.com') // false
 * isValidSpotifyUrl('not-a-url') // false
 * isValidSpotifyUrl('') // false
 */
export function isValidSpotifyUrl (url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  return SPOTIFY_URL_REGEX.test(url.trim())
}

/**
 * Obtiene el tipo de contenido de una URL de Spotify
 * 
 * Extrae el tipo de contenido (artist, album, track) de una URL de Spotify válida.
 * Útil para determinar qué tipo de datos se pueden obtener de la URL.
 * Soporta URLs internacionalizadas (ej: /intl-es/).
 * 
 * @function
 * @param {string} url - URL de Spotify a analizar
 * @returns {('artist'|'album'|'track'|'playlist'|null)} Tipo de contenido o null si la URL no es válida
 * 
 * @example
 * getSpotifyUrlType('https://open.spotify.com/artist/123') // 'artist'
 * getSpotifyUrlType('https://open.spotify.com/album/456') // 'album' 
 * getSpotifyUrlType('https://open.spotify.com/track/789') // 'track'
 * getSpotifyUrlType('https://open.spotify.com/intl-es/track/789') // 'track'
 * getSpotifyUrlType('https://example.com') // null
 */
export function getSpotifyUrlType (url) {
  if (!isValidSpotifyUrl(url)) {
    return null
  }

  const match = url.match(/spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(artist|album|track|playlist)\//)
  return match ? match[1] : null
}

/**
 * Extrae el ID único de Spotify de una URL
 * 
 * Obtiene el identificador único que Spotify usa internamente para
 * identificar artistas, álbumes y tracks. Este ID es necesario para
 * realizar llamadas a la API de Spotify.
 * Soporta URLs internacionalizadas y embebidas.
 * 
 * @function
 * @param {string} url - URL de Spotify válida
 * @returns {string|null} ID de Spotify (cadena alfanumérica) o null si la URL no es válida
 * 
 * @example
 * // Extraer ID de artista
 * extractSpotifyId('https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY')
 * // Returns: '4dpARuHxo51G3z768sgnrY'
 * 
 * @example
 * // Extraer ID de álbum
 * extractSpotifyId('https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3?si=abc123')
 * // Returns: '1DFixLWuPkv3KT3TnV35m3'
 * 
 * @example
 * // Extraer ID de track internacional
 * extractSpotifyId('https://open.spotify.com/intl-es/track/4NL9TP4qFHx7YcMHsXQrSb?si=123')
 * // Returns: '4NL9TP4qFHx7YcMHsXQrSb'
 */
export function extractSpotifyId (url) {
  if (!isValidSpotifyUrl(url)) {
    return null
  }

  const match = url.match(/spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(artist|album|track|playlist)\/([a-zA-Z0-9]+)/)
  return match ? match[2] : null
}

/**
 * Mapea el tipo de contenido de Spotify al tipo usado en la aplicación
 * 
 * Convierte los tipos específicos de Spotify a los tipos genéricos
 * que maneja la aplicación. Tanto álbumes como tracks se consideran
 * "releases" en el contexto de la aplicación.
 * 
 * @function
 * @param {('artist'|'album'|'track')} spotifyType - Tipo de contenido de Spotify
 * @returns {('artist'|'release')} Tipo correspondiente en la aplicación
 * 
 * @example
 * mapSpotifyTypeToAppType('artist') // 'artist'
 * mapSpotifyTypeToAppType('album')  // 'release'
 * mapSpotifyTypeToAppType('track')  // 'release'
 * 
 * @example
 * // Uso típico en validación
 * const spotifyType = getSpotifyUrlType(url)
 * const appType = mapSpotifyTypeToAppType(spotifyType)
 * if (appType === expectedType) {
 *   // Proceder con importación
 * }
 */
export function mapSpotifyTypeToAppType (spotifyType) {
  switch (spotifyType) {
    case 'artist':
      return 'artist'
    case 'album':
    case 'track':
      return 'release'
    default:
      return 'unknown'
  }
}

/**
 * Formatea errores de Spotify en mensajes user-friendly
 * 
 * Convierte errores técnicos de la API y red en mensajes comprensibles
 * para el usuario final. Maneja diferentes tipos de errores comunes
 * como problemas de conectividad, contenido no encontrado, rate limiting, etc.
 * 
 * @function
 * @param {Error|Object} error - Error a formatear (puede tener propiedades status, name, message)
 * @returns {string} Mensaje de error formateado y user-friendly
 * 
 * @example
 * // Error de red
 * const networkError = new Error('fetch failed')
 * formatSpotifyError(networkError)
 * // Returns: 'No se pudo conectar con Spotify. Verifica tu conexión a internet.'
 * 
 * @example
 * // Error 404
 * const notFoundError = { status: 404 }
 * formatSpotifyError(notFoundError)
 * // Returns: 'No se encontró el contenido en Spotify. Verifica que el enlace sea correcto.'
 * 
 * @example
 * // Rate limiting
 * const rateLimitError = { status: 429 }
 * formatSpotifyError(rateLimitError)
 * // Returns: 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.'
 */
export function formatSpotifyError (error) {
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return 'No se pudo conectar con Spotify. Verifica tu conexión a internet.'
  }

  if (error.status === 404) {
    return 'No se encontró el contenido en Spotify. Verifica que el enlace sea correcto.'
  }

  if (error.status === 429) {
    return 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.'
  }

  if (error.status >= 500) {
    return 'Error del servidor de Spotify. Inténtalo de nuevo más tarde.'
  }

  return error.message || 'Error inesperado al conectar con Spotify.'
}
