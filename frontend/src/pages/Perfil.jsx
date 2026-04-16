import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'
import { useProfile } from '../hooks/useProfile'
import './Perfil.css'

const API_URL = import.meta.env.VITE_API_URL

function Perfil () {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isAdmin, isArtist } = useUser()
  const { profile, loading, saving, fetchProfile, updateProfile } = useProfile()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [artists, setArtists] = useState([])
  const [artistsLoading, setArtistsLoading] = useState(false)

  const showArtistDropdown = isAdmin || isArtist

  // Cargar perfil al montar
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, fetchProfile])

  // Sincronizar formulario con datos del perfil
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setSelectedArtistId(profile.linkedArtistId?._id || profile.linkedArtistId || '')
    }
  }, [profile])

  // Cargar lista de artistas si corresponde
  useEffect(() => {
    if (!showArtistDropdown) return

    const loadArtists = async () => {
      setArtistsLoading(true)
      try {
        const response = await fetch(`${API_URL}/artists`)
        if (response.ok) {
          const data = await response.json()
          const list = data.data || data.artists || data
          setArtists(Array.isArray(list) ? list : [])
        }
      } catch {
        // silently fail — dropdown will be empty
      } finally {
        setArtistsLoading(false)
      }
    }
    loadArtists()
  }, [showArtistDropdown])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    }

    if (showArtistDropdown) {
      payload.linkedArtistId = selectedArtistId || null
    }

    await updateProfile(payload)
  }

  if (authLoading) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <p className="perfil-loading">Cargando...</p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <div className="perfil-header">
            <h1 className="perfil-title">Mi Perfil</h1>
            <div className="perfil-underline" />
          </div>
          <p className="perfil-restricted">Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="perfil-section">
      <div className="perfil-container">
        <div className="perfil-header">
          <h1 className="perfil-title">Mi Perfil</h1>
          <div className="perfil-underline" />
          <p className="perfil-subtitle">Gestiona tu información personal</p>
        </div>

        {loading ? (
          <p className="perfil-loading">Cargando perfil...</p>
        ) : profile ? (
          <div className="perfil-content">
            {/* Info de solo lectura */}
            <div className="perfil-info-card">
              <div className="perfil-info-row">
                <span className="perfil-info-label">Email</span>
                <span className="perfil-info-value">{profile.email}</span>
              </div>
              <div className="perfil-info-row">
                <span className="perfil-info-label">Rol</span>
                <span className={`perfil-role-badge perfil-role-${profile.role}`}>
                  {profile.role}
                </span>
              </div>
              {profile.linkedArtistId && profile.linkedArtistId.name && (
                <div className="perfil-info-row">
                  <span className="perfil-info-label">Artista vinculado</span>
                  <div className="perfil-linked-artist">
                    {profile.linkedArtistId.img && (
                      <img
                        src={profile.linkedArtistId.img}
                        alt={profile.linkedArtistId.name}
                        className="perfil-artist-avatar"
                      />
                    )}
                    <span>{profile.linkedArtistId.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario editable */}
            <form className="perfil-form" onSubmit={handleSubmit}>
              <h2 className="perfil-form-title">Editar datos</h2>

              <div className="perfil-form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={50}
                />
              </div>

              <div className="perfil-form-group">
                <label htmlFor="lastName">Apellidos</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tus apellidos"
                  maxLength={100}
                />
              </div>

              {showArtistDropdown && (
                <div className="perfil-form-group">
                  <label htmlFor="linkedArtist">¿Qué artista eres?</label>
                  <select
                    id="linkedArtist"
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    disabled={artistsLoading}
                  >
                    <option value="">— Ninguno —</option>
                    {artists.map((artist) => (
                      <option key={artist._id || artist.id} value={artist._id || artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                  {artistsLoading && <span className="perfil-field-hint">Cargando artistas...</span>}
                </div>
              )}

              <button
                type="submit"
                className="perfil-save-btn"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        ) : (
          <p className="perfil-loading">No se pudo cargar el perfil.</p>
        )}
      </div>
    </section>
  )
}

export default Perfil
