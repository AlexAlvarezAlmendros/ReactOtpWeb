import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../contexts/ToastContext'
import LinkIconPicker from '../components/LinkIconPicker/LinkIconPicker'
import './Perfil.css'

const API_URL = import.meta.env.VITE_API_URL

const SITE_URL = window.location.origin

function Perfil () {
  const { isAuthenticated, isLoading: authLoading, getToken } = useAuth()
  const { isAdmin, isArtist } = useUser()
  const { profile, loading, saving, fetchProfile, updateProfile } = useProfile()
  const toast = useToast()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [artists, setArtists] = useState([])
  const [artistsLoading, setArtistsLoading] = useState(false)

  // Artist links page state
  const [linkedArtist, setLinkedArtist] = useState(null)
  const [linksBio, setLinksBio] = useState('')
  const [customLinks, setCustomLinks] = useState([])
  const [linksSaving, setLinksSaving] = useState(false)

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

  // Cargar datos completos del artista vinculado (para la sección de links)
  useEffect(() => {
    const artistId = profile?.linkedArtistId?._id || profile?.linkedArtistId
    if (!artistId || (!isArtist && !isAdmin)) return

    const loadLinkedArtist = async () => {
      try {
        const res = await fetch(`${API_URL}/artists/${artistId}`)
        if (!res.ok) return
        const data = await res.json()
        setLinkedArtist(data)
        setLinksBio(data.linksBio || '')
        setCustomLinks(data.customLinks || [])
      } catch {
        // silently fail
      }
    }
    loadLinkedArtist()
  }, [profile?.linkedArtistId, isArtist, isAdmin])

  // Cargar lista de artistas si corresponde
  useEffect(() => {
    if (!showArtistDropdown) return

    const loadArtists = async () => {
      setArtistsLoading(true)
      try {
        const response = await fetch(`${API_URL}/artists?count=100`)
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

  const handleActivateLinks = async () => {
    const artistId = linkedArtist?._id
    if (!artistId) return
    setLinksSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/artists/${artistId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ linksSlug: '' })
      })
      if (!res.ok) throw new Error('Error activando la página')
      const updated = await res.json()
      setLinkedArtist(updated)
      toast.success('¡Página de links activada!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLinksSaving(false)
    }
  }

  const handleSaveLinks = useCallback(async () => {
    const artistId = linkedArtist?._id
    if (!artistId) return
    setLinksSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/artists/${artistId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ linksBio, customLinks })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      const updated = await res.json()
      setLinkedArtist(updated)
      toast.success('Página de links actualizada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLinksSaving(false)
    }
  }, [linkedArtist, linksBio, customLinks, getToken, toast])

  const addCustomLink = () => {
    setCustomLinks(prev => [...prev, { icon: '', label: '', url: '' }])
  }

  const updateCustomLink = (index, field, value) => {
    setCustomLinks(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const removeCustomLink = (index) => {
    setCustomLinks(prev => prev.filter((_, i) => i !== index))
  }

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

            {/* Artist links page editor */}
            {(isArtist || isAdmin) && linkedArtist && (
              <div className="perfil-form">
                <h2 className="perfil-form-title">Mi página de enlaces</h2>

                {linkedArtist.linksSlug ? (
                  <>
                    <div className="perfil-links-url-row">
                      <span className="perfil-links-url">
                        {SITE_URL}/l/{linkedArtist.linksSlug}
                      </span>
                      <div className="perfil-links-url-actions">
                        <button
                          type="button"
                          className="perfil-links-action-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(`${SITE_URL}/l/${linkedArtist.linksSlug}`)
                            toast.success('URL copiada')
                          }}
                        >
                          Copiar
                        </button>
                        <a
                          href={`/l/${linkedArtist.linksSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="perfil-links-action-btn"
                        >
                          Ver
                        </a>
                      </div>
                    </div>

                    <div className="perfil-form-group">
                      <label htmlFor="linksBio">Bio corta</label>
                      <textarea
                        id="linksBio"
                        value={linksBio}
                        onChange={e => setLinksBio(e.target.value)}
                        placeholder="Una frase sobre ti..."
                        maxLength={200}
                        rows={3}
                        className="perfil-textarea"
                      />
                      <span className="perfil-field-hint">{linksBio.length}/200</span>
                    </div>

                    <div className="perfil-form-group">
                      <label>Links personalizados</label>
                      {customLinks.length === 0 && (
                        <p className="perfil-field-hint">Sin links personalizados aún.</p>
                      )}
                      <div className="perfil-custom-links">
                        {customLinks.map((item, i) => (
                          <div key={i} className="perfil-custom-link-row">
                            <LinkIconPicker
                              value={item.icon || ''}
                              onChange={val => updateCustomLink(i, 'icon', val)}
                            />
                            <input
                              type="text"
                              value={item.label}
                              onChange={e => updateCustomLink(i, 'label', e.target.value)}
                              placeholder="Título"
                              maxLength={40}
                              className="perfil-custom-link-label"
                              aria-label="Título"
                            />
                            <input
                              type="url"
                              value={item.url}
                              onChange={e => updateCustomLink(i, 'url', e.target.value)}
                              placeholder="https://..."
                              className="perfil-custom-link-url"
                              aria-label="URL"
                            />
                            <button
                              type="button"
                              className="perfil-custom-link-remove"
                              onClick={() => removeCustomLink(i)}
                              aria-label="Eliminar link"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="perfil-add-link-btn"
                        onClick={addCustomLink}
                      >
                        + Añadir link
                      </button>
                    </div>

                    <button
                      type="button"
                      className="perfil-save-btn"
                      onClick={handleSaveLinks}
                      disabled={linksSaving}
                    >
                      {linksSaving ? 'Guardando...' : 'Guardar página de links'}
                    </button>
                  </>
                ) : (
                  <div className="perfil-links-activate">
                    <p className="perfil-links-activate-text">
                      Activa tu página de enlaces para compartir todos tus links en un solo lugar.
                    </p>
                    <button
                      type="button"
                      className="perfil-save-btn"
                      onClick={handleActivateLinks}
                      disabled={linksSaving}
                    >
                      {linksSaving ? 'Activando...' : 'Activar mi página de links'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="perfil-loading">No se pudo cargar el perfil.</p>
        )}
      </div>
    </section>
  )
}

export default Perfil
