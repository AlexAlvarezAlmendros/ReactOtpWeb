/**
 * @fileoverview Utilidades para gestión del historial de importaciones de Spotify
 * 
 * Este módulo proporciona funciones para almacenar, recuperar y gestionar
 * el historial de URLs de Spotify importadas. Utiliza localStorage para
 * persistencia y mantiene un historial limitado de las últimas importaciones.
 * 
 * @module spotifyHistory
 * @version 1.0.0
 * @author ReactOtpWeb Team
 */

const STORAGE_KEY = 'spotify_import_history'
const MAX_HISTORY_ITEMS = 5

/**
 * Obtiene el historial completo de importaciones desde localStorage
 * 
 * Recupera y deserializa el historial de importaciones almacenado.
 * Maneja errores de parsing y devuelve un array vacío en caso de problemas.
 * El historial está ordenado por timestamp (más reciente primero).
 * 
 * @function
 * @returns {Array<Object>} Array de objetos del historial
 * @returns {string} returns[].url - URL de Spotify importada
 * @returns {string} returns[].type - Tipo de contenido ('artist' | 'album' | 'track' | 'playlist')
 * @returns {string} returns[].name - Nombre del contenido importado
 * @returns {string} returns[].timestamp - Timestamp ISO de la importación
 * 
 * @example
 * // Obtener historial completo
 * const history = getSpotifyHistory()
 * console.log(history)
 * // [
 * //   {
 * //     url: 'https://open.spotify.com/artist/4YRxDV8wJFPHPTeXepOstw',
 * //     type: 'artist',
 * //     name: 'Arijit Singh',
 * //     timestamp: '2024-01-15T10:30:00.000Z'
 * //   },
 * //   ...
 * // ]
 */
export function getSpotifyHistory () {
  try {
    const history = localStorage.getItem(STORAGE_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.warn('Error loading Spotify history:', error)
    return []
  }
}

/**
 * Añade una nueva URL al historial de importaciones
 * 
 * Registra una nueva importación en el historial, removiendo duplicados
 * y manteniendo el límite máximo de elementos. Los elementos más recientes
 * aparecen primero en el historial.
 * 
 * @function
 * @param {string} url - URL de Spotify a añadir al historial
 * @param {string} type - Tipo de contenido ('artist' | 'album' | 'track' | 'playlist')
 * @param {string} [name='Contenido de Spotify'] - Nombre descriptivo del contenido
 * 
 * @example
 * // Añadir un artista al historial
 * addToSpotifyHistory(
 *   'https://open.spotify.com/artist/4YRxDV8wJFPHPTeXepOstw',
 *   'artist',
 *   'Arijit Singh'
 * )
 * 
 * @example
 * // Añadir sin nombre específico (usará valor por defecto)
 * addToSpotifyHistory(
 *   'https://open.spotify.com/album/abc123',
 *   'album'
 * )
 */
export function addToSpotifyHistory (url, type, name) {
  try {
    const history = getSpotifyHistory()
    
    // Remover duplicados
    const filteredHistory = history.filter(item => item.url !== url)
    
    // Añadir nuevo item al principio
    const newItem = {
      url,
      type,
      name: name || 'Contenido de Spotify',
      timestamp: new Date().toISOString()
    }
    
    filteredHistory.unshift(newItem)
    
    // Mantener solo los últimos MAX_HISTORY_ITEMS
    const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory))
  } catch (error) {
    console.warn('Error saving to Spotify history:', error)
  }
}

/**
 * Limpia completamente el historial de importaciones
 * 
 * Elimina todos los elementos del historial almacenado en localStorage.
 * Esta acción es irreversible y se usa típicamente cuando el usuario
 * quiere resetear su historial o limpiar datos personales.
 * 
 * @function
 * 
 * @example
 * // Limpiar todo el historial
 * clearSpotifyHistory()
 * 
 * // Verificar que se ha limpiado
 * const history = getSpotifyHistory()
 * console.log(history.length) // 0
 */
export function clearSpotifyHistory () {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Error clearing Spotify history:', error)
  }
}

/**
 * Formatea un timestamp para mostrar en el historial de forma amigable
 * 
 * Convierte timestamps ISO en texto legible con formato relativo.
 * Muestra "Hace X minutos/horas", "Ayer" o fecha específica según
 * la antigüedad del timestamp.
 * 
 * @function
 * @param {string} timestamp - Timestamp en formato ISO string
 * @returns {string} Fecha formateada de forma amigable
 * 
 * @example
 * // Hace unos minutos
 * const recent = new Date().toISOString()
 * formatHistoryDate(recent)
 * // Returns: 'Hace unos minutos'
 * 
 * @example
 * // Hace unas horas
 * const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
 * formatHistoryDate(hoursAgo)
 * // Returns: 'Hace 3 horas'
 * 
 * @example
 * // Ayer
 * const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
 * formatHistoryDate(yesterday)
 * // Returns: 'Ayer'
 * 
 * @example
 * // Fecha específica
 * const oldDate = '2024-01-10T10:30:00.000Z'
 * formatHistoryDate(oldDate)
 * // Returns: 'ene 10' (formato localizado)
 * 
 * @example
 * // Timestamp inválido
 * formatHistoryDate('invalid-date')
 * // Returns: 'Fecha desconocida'
 */
export function formatHistoryDate (timestamp) {
  try {
    const date = new Date(timestamp)
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha desconocida'
    }
    
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Hace unos minutos'
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`
    } else if (diffInHours < 48) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (error) {
    return 'Fecha desconocida'
  }
}
