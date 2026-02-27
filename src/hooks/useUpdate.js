import { useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'
import { compressImage } from '../utils/imageCompressor'

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
  const toast = useToast()

  /**
   * Actualiza un elemento por su tipo, ID y datos
   * @param {string} type - Tipo de elemento ('release', 'artist', 'event', 'beat', 'newsletter')
   * @param {string} id - ID del elemento a actualizar
   * @param {object} data - Datos a actualizar
   * @param {File|null} imageFile - Archivo de imagen opcional
   * @returns {Promise<object|null>} - Objeto actualizado o null si falla
   */
  const updateItem = async (type, id, data, imageFile = null) => {
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
    const loadingToastId = toast.loading(`Actualizando ${typeNames[type] || type}...`)

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

      let body
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Si hay imagen, comprimir y usar FormData
      if (imageFile) {
        const compressedImage = await compressImage(imageFile)
        const formData = new FormData()
        
        // Añadir todos los campos
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formData.append(key, data[key])
          }
        })
        
        // Añadir la imagen comprimida
        formData.append('image', compressedImage)
        
        body = formData
      } else {
        // Sin imagen, usar JSON tradicional
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(data)
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body
      })

      

      if (!response.ok) {
        let errorMessage = 'Error al actualizar'
        if (response.status === 404) {
          errorMessage = 'El elemento no existe'
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para editar este elemento'
        } else if (response.status === 401) {
          errorMessage = 'No estás autenticado'
        } else if (response.status === 400) {
          const errorData = await response.json()
          errorMessage = errorData.message || 'Datos inválidos'
        } else {
          errorMessage = `Error al actualizar: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const updatedItem = await response.json()
      
      
      // Remover toast de carga y mostrar éxito
      toast.removeToast(loadingToastId)
      toast.success(`✓ ${typeNames[type]?.charAt(0).toUpperCase() + typeNames[type]?.slice(1)} actualizado exitosamente`)
      
      return updatedItem
    } catch (err) {
      setError(err.message)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(err.message)
      
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
