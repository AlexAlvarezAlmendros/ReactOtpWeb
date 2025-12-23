import { useState } from 'react'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

export function useCreateBeat () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()

  const createBeat = async (beatData) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      const response = await fetch(BEATS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(beatData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error creating beat')
      }

      return await response.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createBeat, loading, error }
}
