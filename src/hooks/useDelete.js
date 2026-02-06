import { useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

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
  const toast = useToast()

  /**
   * Elimina un elemento por su tipo e ID
   * @param {string} type - Tipo de elemento ('release', 'artist', 'event', 'beat', 'newsletter')
   * @param {string} id - ID del elemento a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  const deleteItem = async (type, id) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const typeNames = {
      release: 'lanzamiento',
      artist: 'artista',
      event: 'evento',
      beat: 'beat',
      newsletter: 'newsletter'
    }
    const loadingToastId = toast.loading(`Eliminando ${typeNames[type] || type}...`)

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
        case 'beat':
          endpoint = `${API_URL}/beats/${id}`
          break
        case 'newsletter':
          endpoint = `${API_URL}/newsletters/${id}`
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
        let errorMessage = 'Error al eliminar'
        if (response.status === 404) {
          errorMessage = 'El elemento no existe o ya fue eliminado'
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para eliminar este elemento'
        } else if (response.status === 401) {
          errorMessage = 'No estás autenticado'
        } else {
          errorMessage = `Error al eliminar: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      // Remover toast de carga y mostrar éxito
      toast.removeToast(loadingToastId)
      toast.success(`✓ ${typeNames[type]?.charAt(0).toUpperCase() + typeNames[type]?.slice(1)} eliminado exitosamente`)
      
      return true
    } catch (err) {
      console.error('Error al eliminar elemento:', err)
      setError(err.message)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(err.message)
      
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
