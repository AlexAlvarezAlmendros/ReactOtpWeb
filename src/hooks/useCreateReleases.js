import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const RELEASES_ENDPOINT = `${API_URL}/releases`

export const useCreateRelease = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createRelease = async (releaseData) => {
    setLoading(true)
    setError(null)

    try {
      // Realizamos la petición POST a la API para crear un nuevo release
      console.log('Datos del release a crear:', releaseData)
      const response = await fetch(RELEASES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(releaseData)
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

  return { createRelease, loading, error }
}
