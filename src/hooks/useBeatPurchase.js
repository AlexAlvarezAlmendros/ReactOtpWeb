import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

const API_URL = import.meta.env.VITE_API_URL

export function useBeatPurchase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()
  const toast = useToast()

  const createCheckoutSession = useCallback(async (beatId, licenseId, customerEmail, customerName) => {
    setLoading(true)
    setError(null)

    // Mostrar toast de carga
    const loadingToastId = toast.loading('Preparando compra de licencia...')

    try {
      const token = await getToken()

      const response = await fetch(`${API_URL}/beats/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          beatId,
          licenseId,
          customerEmail,
          customerName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error('No se recibió la URL de pago')
      }

      // Remover toast de carga y mostrar info
      toast.removeToast(loadingToastId)
      toast.info('Redirigiendo a la pasarela de pago...')

      // Redirigir a Stripe Checkout
      window.location.href = data.url

      return data
    } catch (err) {
      const errorMessage = err.message || 'Error al crear la sesión de pago'
      setError(errorMessage)
      console.error('Error en createCheckoutSession:', err)
      
      // Remover toast de carga y mostrar error
      toast.removeToast(loadingToastId)
      toast.error(errorMessage)
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [getToken, toast])

  return {
    createCheckoutSession,
    loading,
    error
  }
}
