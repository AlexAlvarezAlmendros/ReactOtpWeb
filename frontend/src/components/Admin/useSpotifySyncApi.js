import { useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL

/** Peticiones autenticadas a /api/spotify-sync (solo administradores). */
export function useSpotifySyncApi () {
  const { getToken } = useAuth()

  return useCallback(async (path, options = {}) => {
    const token = await getToken()
    const res = await fetch(`${API_URL}/spotify-sync${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`)
    return body
  }, [getToken])
}

export const SYNC_MODES = [
  {
    value: 'auto',
    label: 'Automático',
    hint: 'Lo que saque en Spotify se publica solo.'
  },
  {
    value: 'review',
    label: 'Revisión',
    hint: 'Entra como borrador y no se ve en la web hasta que lo aceptes.'
  },
  {
    value: 'off',
    label: 'Desactivado',
    hint: 'No se sincroniza.'
  }
]

export const RELEASE_TYPES = { Song: 'Single', EP: 'EP', Album: 'Álbum', Videoclip: 'Videoclip' }

export const formatDate = (value, withTime = false) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
