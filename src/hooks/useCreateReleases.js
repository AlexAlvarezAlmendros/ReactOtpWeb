import { useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const RELEASES_ENDPOINT = `${API_URL}/releases`

export const useCreateRelease = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken, user } = useAuth()

  const createRelease = async (releaseData, imageFile = null) => {
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

      // Realizamos la petición POST a la API para crear un nuevo release
      console.log('Datos del release a crear:', releaseData)
      
      let body
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Si hay imagen, usar FormData
      if (imageFile) {
        const formData = new FormData()
        
        // Añadir todos los campos del release
        Object.keys(releaseData).forEach(key => {
          if (releaseData[key] !== null && releaseData[key] !== undefined && releaseData[key] !== '') {
            formData.append(key, releaseData[key])
          }
        })
        
        // Añadir la imagen
        formData.append('image', imageFile)
        
        body = formData
        // No incluir Content-Type, el navegador lo establece automáticamente con boundary
      } else {
        // Sin imagen, usar JSON tradicional
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(releaseData)
      }

      const response = await fetch(RELEASES_ENDPOINT, {
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
        : 'Error creando release: ' + err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createRelease, loading, error }
}
