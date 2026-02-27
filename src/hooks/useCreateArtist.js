import { useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'
import { compressImage } from '../utils/imageCompressor'

const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

export const useCreateArtist = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken, user } = useAuth()
  const toast = useToast()

  const createArtist = async (artistData, imageFile = null) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Creando artista...')

    try {
      // Obtener el token de Auth0
      const token = await getToken()

      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      let body
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Si hay imagen, comprimir y usar FormData
      if (imageFile) {
        const compressedImage = await compressImage(imageFile)
        const formData = new FormData()
        
        // Añadir todos los campos del artista
        Object.keys(artistData).forEach(key => {
          if (artistData[key] !== null && artistData[key] !== undefined && artistData[key] !== '') {
            formData.append(key, artistData[key])
          }
        })
        
        // Añadir la imagen comprimida
        formData.append('image', compressedImage)
        
        body = formData
      } else {
        // Sin imagen, usar JSON tradicional
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(artistData)
      }

      const response = await fetch(ARTISTS_ENDPOINT, {
        method: 'POST',
        headers,
        body
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Remover toast de carga y mostrar éxito
      toast.removeToast(loadingToastId)
      toast.success(`✨ Artista "${artistData.name}" creado exitosamente`)
      
      return result
    } catch (err) {
      const errorMessage = err.message.includes('No se pudo obtener el token')
        ? 'Error de autenticación: ' + err.message
        : 'Error creando artista: ' + err.message
      setError(errorMessage)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(errorMessage)
      
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createArtist, loading, error }
}
