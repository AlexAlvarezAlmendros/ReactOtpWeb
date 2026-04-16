import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'

export function useStripe () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const createCheckoutSession = async (eventId, quantity, customerEmail, customerName) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Preparando pago...')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          quantity,
          customerEmail,
          customerName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la sesión de pago')
      }

      const { sessionId, url } = await response.json()

      // Redirigir directamente a la URL de Stripe Checkout
      if (url) {
        // Remover toast de carga y mostrar info
        toast.removeToast(loadingToastId)
        toast.info('Redirigiendo a la pasarela de pago...')
        
        window.location.href = url
      } else {
        throw new Error('No se recibió la URL de checkout')
      }
    } catch (err) {
      setError(err.message)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    loading,
    error
  }
}
