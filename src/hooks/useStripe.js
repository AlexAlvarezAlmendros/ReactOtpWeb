import { useState } from 'react'

export function useStripe () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createCheckoutSession = async (eventId, quantity, customerEmail, customerName) => {
    setLoading(true)
    setError(null)

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
        window.location.href = url
      } else {
        throw new Error('No se recibió la URL de checkout')
      }
    } catch (err) {
      setError(err.message)
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
