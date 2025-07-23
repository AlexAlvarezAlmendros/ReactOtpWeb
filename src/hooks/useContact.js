import { useState } from 'react'

// La URL base de tu API
const API_URL = import.meta.env.VITE_API_URL
const CONTACT_ENDPOINT = `${API_URL}/contact`

/**
 * Custom hook para enviar mensajes de contacto a la API.
 *
 * @returns {{
 *   sendMessage: Function,
 *   loading: boolean,
 *   error: string | null,
 *   success: boolean,
 *   response: Object | null
 * }}
 */
export function useContact () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [response, setResponse] = useState(null)

  /**
   * Envía un mensaje de contacto a la API
   * 
   * @param {Object} contactData - Datos del formulario de contacto
   * @param {string} contactData.name - Nombre del remitente
   * @param {string} contactData.email - Email del remitente
   * @param {string} contactData.subject - Asunto del mensaje
   * @param {string} contactData.message - Contenido del mensaje
   * @param {string} [contactData.phone] - Teléfono del remitente (opcional)
   * 
   * @returns {Promise<Object>} - Respuesta de la API
   */
  const sendMessage = async (contactData) => {
    try {
      // Reiniciamos los estados antes de cada petición
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResponse(null)

      // Validamos los campos requeridos
      const requiredFields = ['name', 'email', 'subject', 'message']
      for (const field of requiredFields) {
        if (!contactData[field] || contactData[field].trim() === '') {
          throw new Error(`El campo ${field} es requerido`)
        }
      }

      // Validamos el formato del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contactData.email)) {
        throw new Error('El formato del email no es válido')
      }

      // Preparamos los datos para enviar (solo los campos necesarios)
      const dataToSend = {
        name: contactData.name.trim(),
        email: contactData.email.trim().toLowerCase(),
        subject: contactData.subject,
        message: contactData.message.trim()
      }

      // Incluimos el teléfono si fue proporcionado
      if (contactData.phone && contactData.phone.trim() !== '') {
        dataToSend.phone = contactData.phone.trim()
      }

      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const responseData = await response.json()

      // Si la respuesta no es OK, manejamos los diferentes tipos de error
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(responseData.message || 'Datos del formulario inválidos')
        } else if (response.status === 429) {
          throw new Error('Has excedido el límite de mensajes por hora. Inténtalo más tarde.')
        } else if (response.status >= 500) {
          throw new Error('Error del servidor. Por favor, inténtalo más tarde.')
        } else {
          throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`)
        }
      }

      // Si todo va bien, guardamos la respuesta exitosa
      setResponse(responseData)
      setSuccess(true)
      
      return responseData

    } catch (e) {
      console.error('Error al enviar mensaje de contacto:', e)
      setError(e.message)
      setSuccess(false)
      throw e // Re-lanzamos el error para que el componente pueda manejarlo si es necesario
    } finally {
      setLoading(false)
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
    sendMessage,
    loading,
    error,
    success,
    response,
    reset
  }
}
