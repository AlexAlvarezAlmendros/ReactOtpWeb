import { useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

export function useCreateBeat () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()
  const toast = useToast()

  const createBeat = async (beatData, coverImage = null) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Creando beat...')
    
    try {
      const token = await getToken()
      
      let body
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      // Si hay imagen de portada, usar FormData
      if (coverImage) {
        const formData = new FormData()
        
        // Añadir todos los campos del beat
        Object.keys(beatData).forEach(key => {
          if (beatData[key] !== null && beatData[key] !== undefined && beatData[key] !== '') {
            // Si es un array u objeto, stringify
            if (typeof beatData[key] === 'object') {
              formData.append(key, JSON.stringify(beatData[key]))
            } else {
              formData.append(key, beatData[key])
            }
          }
        })
        
        // Añadir la imagen de portada
        formData.append('image', coverImage)
        
        body = formData
      } else {
        // Sin imagen, usar JSON tradicional
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(beatData)
      }

      const response = await fetch(BEATS_ENDPOINT, {
        method: 'POST',
        headers,
        body
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error creating beat')
      }

      const result = await response.json()
      
      // Remover toast de carga y mostrar éxito
      toast.removeToast(loadingToastId)
      toast.success(`✨ Beat "${beatData.title || 'nuevo'}" creado exitosamente`)
      
      return result
    } catch (err) {
      setError(err.message)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(`Error creando beat: ${err.message}`)
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createBeat, loading, error }
}
