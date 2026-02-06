import { useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

const API_URL = import.meta.env.VITE_API_URL
const EVENTS_ENDPOINT = `${API_URL}/events`

export const useCreateEvent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken, user } = useAuth()
  const toast = useToast()

  const createEvent = async (eventData, imageFile = null) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Creando evento...')

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
        
        // Añadir todos los campos del evento
        Object.keys(eventData).forEach(key => {
          if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
            formData.append(key, eventData[key])
          }
        })
        
        // Añadir la imagen
        formData.append('image', imageFile)
        
        body = formData
      } else {
        // Sin imagen, usar JSON tradicional
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(eventData)
      }

      const response = await fetch(EVENTS_ENDPOINT, {
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
      toast.success(`✨ Evento "${eventData.name || 'nuevo'}" creado exitosamente`)
      
      return result
    } catch (err) {
      const errorMessage = err.message.includes('No se pudo obtener el token')
        ? 'Error de autenticación: ' + err.message
        : 'Error creando evento: ' + err.message
      setError(errorMessage)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(errorMessage)
      
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createEvent, loading, error }
}
