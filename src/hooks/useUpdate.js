import { useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Custom hook para actualizar elementos (releases, artists, events)
 * @returns {{
 *   updateItem: Function,
 *   loading: boolean,
 *   error: string | null
 * }}
 */
export function useUpdate () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  /**
   * Actualiza un elemento por su tipo, ID y datos
   * @param {string} type - Tipo de elemento ('release', 'artist', 'event')
   * @param {string} id - ID del elemento a actualizar
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object|null>} - Objeto actualizado o null si falla
   */
  const updateItem = async (type, id, data) => {
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
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El elemento no existe')
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para editar este elemento')
        } else if (response.status === 401) {
          throw new Error('No estás autenticado')
        } else if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Datos inválidos')
        } else {
          throw new Error(`Error al actualizar: ${response.status}`)
        }
      }

      const updatedItem = await response.json()
      return updatedItem
    } catch (err) {
      console.error('Error al actualizar elemento:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateItem,
    loading,
    error
  }
}
