import { useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Custom hook para eliminar elementos (releases, artists, events)
 * @returns {{
 *   deleteItem: Function,
 *   loading: boolean,
 *   error: string | null
 * }}
 */
export function useDelete () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  /**
   * Elimina un elemento por su tipo e ID
   * @param {string} type - Tipo de elemento ('release', 'artist', 'event')
   * @param {string} id - ID del elemento a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  const deleteItem = async (type, id) => {
    setLoading(true)
    setError(null)

    try {
      // Obtener el token de acceso para la autenticación
      const token = await getToken()

      // Determinar el endpoint basado en el tipo
      let endpoint
      switch (type) {
        case 'release':
          endpoint = `${API_URL}/releases/${id}`
          break
        case 'artist':
          endpoint = `${API_URL}/artists/${id}`
          break
        case 'event':
          endpoint = `${API_URL}/events/${id}`
          break
        default:
          throw new Error(`Tipo de elemento no válido: ${type}`)
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El elemento no existe o ya fue eliminado')
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar este elemento')
        } else if (response.status === 401) {
          throw new Error('No estás autenticado')
        } else {
          throw new Error(`Error al eliminar: ${response.status}`)
        }
      }

      return true
    } catch (err) {
      console.error('Error al eliminar elemento:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteItem,
    loading,
    error
  }
}
