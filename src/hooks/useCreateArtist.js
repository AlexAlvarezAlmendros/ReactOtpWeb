import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

export const useCreateArtist = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createArtist = async (artistData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(ARTISTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artistData)
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

  return { createArtist, loading, error }
}
