import { useState } from 'react'

// La URL base de tu API
const API_URL = import.meta.env.VITE_API_URL
const NEWSLETTER_ENDPOINT = `${API_URL}/newsletter`

/**
 * Custom hook para manejar suscripciones a la newsletter.
 *
 * @returns {{
 *   subscribe: Function,
 *   unsubscribe: Function,
 *   checkStatus: Function,
 *   loading: boolean,
 *   error: string | null,
 *   success: boolean,
 *   response: Object | null
 * }}
 */
export function useNewsletter () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [response, setResponse] = useState(null)

  /**
   * Suscribe un email a la newsletter
   * 
   * @param {string} email - Email a suscribir
   * @param {string} source - Fuente de la suscripción (opcional, default: 'website')
   * 
   * @returns {Promise<Object>} - Resultado de la suscripción
   */
  const subscribe = async (email, source = 'website') => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResponse(null)

      // Validamos el email
      if (!email || email.trim() === '') {
        throw new Error('El email es requerido')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        throw new Error('Por favor, introduce un email válido')
      }

      // Preparamos los datos para enviar
      const dataToSend = {
        email: email.trim().toLowerCase(),
        source: source
      }

      const response = await fetch(`${NEWSLETTER_ENDPOINT}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const responseData = await response.json()

      // Manejamos los diferentes tipos de respuesta
      if (response.ok) {
        // 201 - Nueva suscripción o 200 - Reactivación
        setResponse(responseData)
        setSuccess(true)
        
        return {
          success: true,
          message: responseData.message,
          status: responseData.status || 'new',
          data: responseData
        }
      } else if (response.status === 409) {
        // Email ya suscrito
        setResponse(responseData)
        setError('Este email ya está suscrito a nuestra newsletter')
        
        return {
          success: false,
          message: 'Email ya suscrito',
          status: 'already_subscribed',
          data: responseData
        }
      } else if (response.status === 400) {
        // Datos inválidos
        throw new Error(responseData.message || 'Email faltante o formato inválido')
      } else if (response.status === 429) {
        // Rate limit excedido
        throw new Error('Has excedido el límite de suscripciones por hora. Inténtalo más tarde.')
      } else if (response.status >= 500) {
        // Error del servidor
        throw new Error('Error del servidor. Por favor, inténtalo más tarde.')
      } else {
        throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`)
      }

    } catch (e) {
      console.error('Error al suscribir a newsletter:', e)
      setError(e.message)
      setSuccess(false)
      
      return {
        success: false,
        message: e.message,
        status: 'error'
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Desuscribe un email de la newsletter
   * 
   * @param {string} email - Email a desuscribir
   * 
   * @returns {Promise<Object>} - Resultado de la desuscripción
   */
  const unsubscribe = async (email) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResponse(null)

      if (!email || email.trim() === '') {
        throw new Error('El email es requerido')
      }

      const response = await fetch(`${NEWSLETTER_ENDPOINT}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const responseData = await response.json()

      if (response.ok) {
        setResponse(responseData)
        setSuccess(true)
        
        return {
          success: true,
          message: responseData.message,
          data: responseData
        }
      } else if (response.status === 404) {
        throw new Error('Este email no está suscrito a nuestra newsletter')
      } else {
        throw new Error(responseData.message || 'Error al desuscribir')
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
  }

  /**
   * Verifica el estado de suscripción de un email
   * 
   * @param {string} email - Email a verificar
   * 
   * @returns {Promise<Object>} - Estado de la suscripción
   */
  const checkStatus = async (email) => {
    try {
      if (!email || email.trim() === '') {
        return { subscribed: false, status: 'invalid_email' }
      }

      const response = await fetch(
        `${NEWSLETTER_ENDPOINT}/status?email=${encodeURIComponent(email.trim().toLowerCase())}`
      )

      if (response.ok) {
        const responseData = await response.json()
        return responseData
      } else {
        console.error('Error checking newsletter status:', response.status)
        return { subscribed: false, status: 'error' }
      }

    } catch (e) {
      console.error('Error checking newsletter status:', e)
      return { subscribed: false, status: 'error' }
    }
  }

  /**
   * Resetea el estado del hook
   */
  const reset = () => {
    setLoading(false)
    setError(null)
    setSuccess(false)
    setResponse(null)
  }

  return {
    subscribe,
    unsubscribe,
    checkStatus,
    loading,
    error,
    success,
    response,
    reset
  }
}
