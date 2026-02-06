import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'

const API_URL = import.meta.env.VITE_API_URL
const CONTACT_ENDPOINT = `${API_URL}/contact`

export function useReserva () {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const toast = useToast()

  const enviarReserva = async (datosReserva) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Enviando reserva...')

    try {
      // Formatear los datos para el email
      const emailData = {
        name: datosReserva.datos.nombre,
        email: datosReserva.datos.email,
        message: `
NUEVA RESERVA DE ESTUDIO

Datos del cliente:
- Nombre: ${datosReserva.datos.nombre}
- Email: ${datosReserva.datos.email}
- Teléfono: ${datosReserva.datos.telefono}

Detalles de la reserva:
- Fecha solicitada: ${new Date(datosReserva.datos.fecha).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
- Hora solicitada: ${datosReserva.datos.hora}
- Servicio: ${datosReserva.datos.servicio}

Mensaje del cliente:
${datosReserva.datos.mensaje}

---
Fecha de solicitud: ${new Date(datosReserva.datos.fechaSolicitud).toLocaleString('es-ES')}
        `.trim(),
        subject: datosReserva.asunto || `Nueva Reserva de Estudio - ${datosReserva.datos.servicio}`
      }

      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setSuccess(true)
      
      // Remover toast de carga y mostrar éxito
      toast.removeToast(loadingToastId)
      toast.success('🎉 Reserva enviada exitosamente. Te contactaremos pronto')
      
      return result
    } catch (err) {
      console.error('Error al enviar reserva:', err)
      const errorMessage = err.message || 'Error al enviar la reserva. Por favor, inténtalo de nuevo.'
      setError(errorMessage)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(errorMessage)
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
    setIsLoading(false)
  }

  return {
    enviarReserva,
    isLoading,
    error,
    success,
    resetState
  }
}
