import { useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

export const useCreateArtist = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken, user } = useAuth()

  const createArtist = async (artistData, imageFile = null) => {
    setLoading(true)
    setError(null)

    try {
      // Obtener el token de Auth0
      const token = await getToken()

      // Debug del token y usuario
      console.log('🔍 Token being sent:', token)
      console.log('🔍 User data:', user)

      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      let body
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Si hay imagen, usar FormData
      if (imageFile) {
        const formData = new FormData()
        
        // Añadir todos los campos del artista
        Object.keys(artistData).forEach(key => {
          if (artistData[key] !== null && artistData[key] !== undefined && artistData[key] !== '') {
            formData.append(key, artistData[key])
          }
        })
        
        // Añadir la imagen
        formData.append('image', imageFile)
        
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
      return result
    } catch (err) {
      const errorMessage = err.message.includes('No se pudo obtener el token')
        ? 'Error de autenticación: ' + err.message
        : 'Error creando artista: ' + err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createArtist, loading, error }
}
