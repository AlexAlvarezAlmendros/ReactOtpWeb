import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL
const NEWSLETTER_ENDPOINT = `${API_URL}/newsletter`

/**
 * Custom hook para manejar la desuscripción de la newsletter.
 * Procesa el token o email de los query params de la URL.
 *
 * @returns {{
 *   unsubscribe: Function,
 *   loading: boolean,
 *   error: string | null,
 *   success: boolean,
 *   email: string | null,
 *   response: Object | null
 * }}
 */
export function useUnsubscribe () {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [response, setResponse] = useState(null)
  const [email, setEmail] = useState(null)

  // Extraer email o token de los query params
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tokenParam = searchParams.get('token')
    
    if (emailParam) {
      setEmail(emailParam)
    } else if (tokenParam) {
      // Si hay token, lo usaremos para desuscribir
      setEmail(tokenParam)
    }
  }, [searchParams])

  /**
   * Desuscribe un email de la newsletter
   * 
   * @param {string} emailToUnsubscribe - Email a desuscribir (opcional, usa el de la URL por defecto)
   * 
   * @returns {Promise<Object>} - Resultado de la desuscripción
   */
  const unsubscribe = useCallback(async (emailToUnsubscribe = null) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResponse(null)

      // Usar el email proporcionado o el de la URL
      const targetEmail = emailToUnsubscribe || email

      if (!targetEmail || targetEmail.trim() === '') {
        throw new Error('No se proporcionó un email válido')
      }

      // Validar formato de email si no es un token
      if (!targetEmail.includes('-') || targetEmail.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(targetEmail.trim())) {
          throw new Error('El formato del email no es válido')
        }
      }

      const response = await fetch(`${NEWSLETTER_ENDPOINT}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: targetEmail.trim().toLowerCase(),
          token: searchParams.get('token') // Incluir token si existe
        })
      })

      const responseData = await response.json()

      if (response.ok) {
        setResponse(responseData)
        setSuccess(true)
        
        return {
          success: true,
          message: responseData.message || 'Desuscripción exitosa',
          data: responseData
        }
      } else if (response.status === 404) {
        throw new Error('Este email no está suscrito a nuestra newsletter')
      } else if (response.status === 400) {
        throw new Error(responseData.message || 'Datos inválidos')
      } else if (response.status === 410) {
        // Ya estaba desuscrito
        setResponse(responseData)
        setSuccess(true)
        
        return {
          success: true,
          message: responseData.message || 'El email ya estaba desuscrito',
          data: responseData
        }
      } else if (response.status === 429) {
        throw new Error('Demasiados intentos. Por favor, inténtalo más tarde.')
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Por favor, inténtalo más tarde.')
      } else {
        throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`)
      }

    } catch (e) {
      console.error('Error al desuscribir de newsletter:', e)
      setError(e.message)
      setSuccess(false)
      
      return {
        success: false,
        message: e.message
      }
    } finally {
      setLoading(false)
    }
  }, [email, searchParams])

  return {
    unsubscribe,
    loading,
    error,
    success,
    email,
    response
  }
}
