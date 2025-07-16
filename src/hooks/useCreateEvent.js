import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const EVENTS_ENDPOINT = `${API_URL}/events`

export const useCreateEvent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createEvent = async (eventData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(EVENTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createEvent, loading, error }
}
