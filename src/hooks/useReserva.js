import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const CONTACT_ENDPOINT = `${API_URL}/contact`

export function useReserva () {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const enviarReserva = async (datosReserva) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

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
      return result
    } catch (err) {
      console.error('Error al enviar reserva:', err)
      setError(err.message || 'Error al enviar la reserva. Por favor, inténtalo de nuevo.')
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
