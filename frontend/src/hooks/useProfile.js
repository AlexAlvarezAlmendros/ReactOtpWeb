import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../contexts/ToastContext'

const API_URL = import.meta.env.VITE_API_URL

export function useProfile () {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuth()
  const toast = useToast()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Error al cargar el perfil')
      }

      const data = await response.json()
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [getToken, toast])

  const updateProfile = useCallback(async ({ firstName, lastName, linkedArtistId }) => {
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, linkedArtistId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el perfil')
      }

      const updated = await response.json()
      setProfile(updated)
      toast.success('Perfil actualizado correctamente')
      return updated
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }, [getToken, toast])

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    updateProfile
  }
}
