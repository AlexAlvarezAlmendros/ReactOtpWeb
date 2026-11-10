import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useCallback } from 'react'
import { useCreateArtist } from '../../hooks/useCreateArtist.js'
import { useAuth } from '../../hooks/useAuth.js'
import SpotifyImport from '../SpotifyImport/SpotifyImport.jsx'
import { ImageUploader } from '../ImageUploader/ImageUploader.jsx'
import './Forms.css'

// Tope del modelo Artist.bio en el backend.
const BIO_MAX = 5000

function countWords (text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length
}

export default function ArtistForm ({ onSuccess, initialData = null, isEditMode = false }) {
  console.log('🎨 ArtistForm - initialData:', initialData)
  console.log('🎨 ArtistForm - isEditMode:', isEditMode)
  
  const { user } = useAuth()
  const [errors, setErrors] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.title || '',
    genre: initialData?.genre || '',
    img: initialData?.img || '',
    spotify: initialData?.spotify || initialData?.spotifyLink || '',
    youtube: initialData?.youtube || initialData?.youtubeLink || '',
    // El listado mapea estos dos como appleMusicLink y soundCloudLink: sin
    // leerlos aquí, editar un artista vaciaba su enlace de Apple Music.
    apple: initialData?.apple || initialData?.appleMusicLink || initialData?.appleLink || '',
    instagram: initialData?.instagram || initialData?.instagramLink || '',
    soundcloud: initialData?.soundcloud || initialData?.soundCloudLink || initialData?.soundcloudLink || '',
    type: initialData?.type || initialData?.artistType || '',
    bio: initialData?.bio || '',
    city: initialData?.city || '',
    activeSince: initialData?.activeSince || '',
    pressQuotes: Array.isArray(initialData?.pressQuotes) ? initialData.pressQuotes : [],
    videos: Array.isArray(initialData?.videos) ? initialData.videos : []
  })
  
  console.log('🎨 ArtistForm - formData inicial:', formData)
  const { createArtist, loading, error: apiError } = useCreateArtist()

  const handleSpotifyImport = useCallback((spotifyData) => {
    console.log('📥 Datos de artista recibidos:', spotifyData)
    
    // Los datos vienen en spotifyData.data
    const actualData = spotifyData.data || spotifyData
    
    console.log('📋 Datos de artista procesados:', actualData)
    
    // Mapear datos de Spotify a campos del formulario
    setFormData(prev => ({
      ...prev,
      name: actualData.name || prev.name,
      genre: actualData.genre || actualData.genres?.join(', ') || prev.genre,
      img: actualData.img || actualData.image || prev.img,
      spotify: actualData.spotifyLink || prev.spotify
    }))
    
    console.log('✅ Formulario de artista actualizado con datos de Spotify')
  }, [])

  const handleReset = useCallback(() => {
    // Limpiar el formulario de artista
    setFormData({
      name: '',
      genre: '',
      img: '',
      spotify: '',
      youtube: '',
      apple: '',
      instagram: '',
      soundcloud: '',
      type: '',
      bio: '',
      city: '',
      activeSince: '',
      pressQuotes: [],
      videos: []
    })
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  /** Editar listas de objetos (citas de prensa, vídeos). */
  const updateRow = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((row, i) => (i === index ? { ...row, [key]: value } : row))
    }))
  }
  const addRow = (field, empty) => setFormData(prev => ({ ...prev, [field]: [...prev[field], empty] }))
  const removeRow = (field, index) => setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    
    const validationErrors = []

    // Validación del nombre
    if (formData.name && formData.name.length > 60) {
      validationErrors.push('El nombre no puede tener más de 60 caracteres')
    }
    // Validación del género
    if (formData.genre && formData.genre.length > 60) {
      validationErrors.push('El género no puede tener más de 60 caracteres')
    }

    if (formData.bio && formData.bio.length > BIO_MAX) {
      validationErrors.push(`La biografía no puede tener más de ${BIO_MAX} caracteres`)
    }

    // Validación de URLs (máximo 300 caracteres)
    const urlFields = [
      { field: 'img', name: 'imagen' },
      { field: 'spotify', name: 'Spotify' },
      { field: 'youtube', name: 'YouTube' },
      { field: 'apple', name: 'Apple Music' },
      { field: 'instagram', name: 'Instagram' },
      { field: 'soundcloud', name: 'SoundCloud' }
    ]
    for (const { field, name } of urlFields) {
      if (formData[field] && formData[field].length > 300) {
        validationErrors.push(
          `La URL de ${name} no puede tener más de 300 caracteres`
        )
      }
    }
    // Si hay errores, mostrarlos y detener el envío
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // Limpiar errores si todo está bien
      setErrors([])
      
      const artistData = {
        name: formData.name,
        genre: formData.genre,
        img: formData.img || '',
        spotifyLink: formData.spotify || '',
        youtubeLink: formData.youtube || '',
        appleMusicLink: formData.apple || '',
        instagramLink: formData.instagram || '',
        // El modelo lo llama soundCloudLink: con «soundcloudLink» Mongoose lo
        // descartaba y el enlace nunca se guardaba.
        soundCloudLink: formData.soundcloud || '',
        artistType: formData.type,
        bio: formData.bio.trim(),
        city: formData.city.trim(),
        activeSince: formData.activeSince ? Number(formData.activeSince) : null,
        pressQuotes: formData.pressQuotes
          .map(q => ({ quote: (q.quote || '').trim(), source: (q.source || '').trim(), url: (q.url || '').trim() }))
          .filter(q => q.quote && q.source),
        videos: formData.videos
          .map(v => ({ title: (v.title || '').trim(), url: (v.url || '').trim() }))
          .filter(v => v.title && v.url),
        userId: user?.sub || null
      }

      if (isEditMode) {
        // En modo edición, pasar los datos al callback onSuccess
        onSuccess?.(artistData, imageFile)
      } else {
        // En modo creación, usar el hook de createArtist
        await createArtist(artistData, imageFile)
        
        // Limpiar el formulario después de enviar
        setFormData({
          name: '',
          genre: '',
          img: '',
          spotify: '',
          youtube: '',
          apple: '',
          instagram: '',
          soundcloud: '',
          type: '',
          bio: '',
          city: '',
          activeSince: '',
          pressQuotes: [],
          videos: []
        })
        setImageFile(null)
        
        onSuccess?.('Artista creado con éxito')
      }
    } catch (error) {
      setErrors([apiError || 'Error al crear el artista: ' + error.message])
    }
  }, [formData, createArtist, apiError, onSuccess, isEditMode])
  
  return (
    <div className="form-layout">
      {/* Columna izquierda: import + portada */}
      <aside className="form-layout__sidebar">
        {!isEditMode && (
          <SpotifyImport
            onDataImported={handleSpotifyImport}
            onReset={handleReset}
            type="artist"
          />
        )}

        <ImageUploader
          label="Imagen de portada*"
          onChange={setImageFile}
          currentImageUrl={formData.img}
          selectedFile={imageFile}
        />
      </aside>

      {/* Columna derecha: secciones del formulario */}
      <form onSubmit={handleSubmit} className="form-layout__body">
        {/* --- Información básica --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Información básica</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="name">Nombre*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className="form-group">
                <label htmlFor="genre">Género*</label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Producer, Singer, DJ..."
                  list="artist-type-suggestions"
                  maxLength={40}
                />
                <datalist id="artist-type-suggestions">
                  <option value="Producer" />
                  <option value="Singer" />
                  <option value="Filmmaker" />
                  <option value="Developer" />
                  <option value="DJ" />
                  <option value="Rapper" />
                  <option value="Band" />
                </datalist>
            </div>
          </div>
        </fieldset>

        {/* --- Biografía (lo que hace que la ficha se indexe) --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Biografía</legend>
          <div className="form-group">
            <label htmlFor="bio">Biografía pública</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={8}
              maxLength={BIO_MAX}
              placeholder="De dónde es, qué estilo hace, lanzamientos clave, con quién ha trabajado, hitos (conciertos, playlists, cifras)…"
            />
            <small>
              Entre 150 y 400 palabras, escritas por el sello. Sin biografía la ficha es una plantilla y Google no la indexa.
              {' '}{countWords(formData.bio)} palabras.
            </small>
          </div>

          <div className="form-layout__grid">
            <div className="form-group">
              <label htmlFor="city">Ciudad</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Igualada (Barcelona)" maxLength={80} />
            </div>
            <div className="form-group">
              <label htmlFor="activeSince">En activo desde (año)</label>
              <input type="number" id="activeSince" name="activeSince" value={formData.activeSince} onChange={handleInputChange} min="1950" max="2100" placeholder="2021" />
            </div>
          </div>

          <div className="form-group">
            <label>Citas de prensa</label>
            {formData.pressQuotes.map((row, i) => (
              <div key={i} className="release-credit-row">
                <input type="text" aria-label="Cita" placeholder="«Una de las voces a seguir…»" value={row.quote} onChange={e => updateRow('pressQuotes', i, 'quote', e.target.value)} maxLength={400} />
                <input type="text" aria-label="Medio" placeholder="Medio" value={row.source} onChange={e => updateRow('pressQuotes', i, 'source', e.target.value)} />
                <input type="url" aria-label="Enlace" placeholder="https://…" value={row.url} onChange={e => updateRow('pressQuotes', i, 'url', e.target.value)} />
                <button type="button" onClick={() => removeRow('pressQuotes', i)} aria-label="Quitar cita">✕</button>
              </div>
            ))}
            <button type="button" className="release-credit-add" onClick={() => addRow('pressQuotes', { quote: '', source: '', url: '' })}>+ Añadir cita</button>
          </div>

          <div className="form-group">
            <label>Vídeos de YouTube</label>
            {formData.videos.map((row, i) => (
              <div key={i} className="release-credit-row">
                <input type="text" aria-label="Título" placeholder="Título del vídeo" value={row.title} onChange={e => updateRow('videos', i, 'title', e.target.value)} />
                <input type="url" aria-label="URL de YouTube" placeholder="https://www.youtube.com/watch?v=…" value={row.url} onChange={e => updateRow('videos', i, 'url', e.target.value)} />
                <span />
                <button type="button" onClick={() => removeRow('videos', i)} aria-label="Quitar vídeo">✕</button>
              </div>
            ))}
            <button type="button" className="release-credit-add" onClick={() => addRow('videos', { title: '', url: '' })}>+ Añadir vídeo</button>
          </div>
        </fieldset>

        {/* --- Links de plataformas --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Links de plataformas</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="spotify">Spotify URL</label>
                <input
                  type="url"
                  id="spotify"
                  name="spotify"
                  value={formData.spotify}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="apple">Apple Music URL</label>
                <input
                  type="url"
                  id="apple"
                  name="apple"
                  value={formData.apple}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="youtube">YouTube URL</label>
                <input
                  type="url"
                  id="youtube"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="soundcloud">SoundCloud URL</label>
                <input
                  type="url"
                  id="soundcloud"
                  name="soundcloud"
                  value={formData.soundcloud}
                  onChange={handleInputChange}
                />
            </div>
          </div>
        </fieldset>

        {/* --- Redes sociales --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Redes sociales</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="instagram">Instagram URL</label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="form-submit" disabled={loading}>
            {isEditMode 
              ? (loading ? 'Actualizando...' : 'Actualizar Artista')
              : (loading ? 'Creando...' : 'Crear Artista')
            }
        </button>

        {errors.length > 0 && (
          <div className="error-messages">
              {errors.map((error, index) => (
              <p key={index}>{error}</p>
              ))}
          </div>
        )}
      </form>
    </div>
  )
}
