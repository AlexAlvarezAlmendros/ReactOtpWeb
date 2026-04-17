import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useCallback } from 'react'
import { useCreateRelease } from '../../hooks/useCreateReleases.js'
import { useAuth } from '../../hooks/useAuth.js'
import SpotifyImport from '../SpotifyImport/SpotifyImport.jsx'
import { ImageUploader } from '../ImageUploader/ImageUploader.jsx'
import './Forms.css'

export default function ReleaseForm ({ onSuccess, initialData = null, isEditMode = false }) {
  console.log('🎵 ReleaseForm - initialData:', initialData)
  console.log('🎵 ReleaseForm - isEditMode:', isEditMode)
  
  const { user } = useAuth()
  const [errors, setErrors] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    img: initialData?.img || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    type: initialData?.type || initialData?.releaseType || '',
    spotifyLink: initialData?.spotifyLink || '',
    youtubeLink: initialData?.youtubeLink || '',
    appleMusicLink: initialData?.appleMusicLink || initialData?.appleLink || '',
    instagramLink: initialData?.instagramLink || '',
    soundcloudLink: initialData?.soundcloudLink || '',
    beatStarsLink: initialData?.beatStarsLink || '',
    twitterLink: initialData?.twitterLink || '',
    video: initialData?.video || '',
    ubicacion: initialData?.ubicacion || ''
  })
  
  console.log('🎵 ReleaseForm - formData inicial:', formData)
  const { createRelease, loading, error: apiError } = useCreateRelease()

  const handleSpotifyImport = useCallback((spotifyData) => {
    console.log('📥 Datos recibidos en handleSpotifyImport:', spotifyData)
    
    // Los datos vienen en spotifyData.data
    const actualData = spotifyData.data || spotifyData
    
    console.log('📋 Datos procesados:', actualData)
    
    // Formatear fecha para input date (YYYY-MM-DD)
    let formattedDate = ''
    if (actualData.date) {
      try {
        const date = new Date(actualData.date)
        formattedDate = date.toISOString().split('T')[0]
      } catch (error) {
        console.warn('Error formateando fecha:', error)
      }
    }
    
    // Mapear datos de Spotify a campos del formulario
    setFormData(prev => ({
      ...prev,
      title: actualData.title || prev.title,
      subtitle: actualData.artist || actualData.subtitle || prev.subtitle,
      img: actualData.img || prev.img,
      spotifyLink: actualData.spotifyLink || prev.spotifyLink,
      type: actualData.type || prev.type,
      appleMusicLink: actualData.appleMusicLink || prev.appleMusicLink,
      youtubeLink: actualData.youtubeMusicLink || prev.youtubeLink,
      soundcloudLink: actualData.soundcloudLink || prev.soundcloudLink,
      date: formattedDate || prev.date
    }))
    
    console.log('✅ Formulario actualizado con datos de Spotify')
  }, [])

  const handleReset = useCallback(() => {
    // Limpiar el formulario
    setFormData({
      title: '',
      subtitle: '',
      img: '',
      date: '',
      type: '',
      spotifyLink: '',
      youtubeLink: '',
      appleMusicLink: '',
      instagramLink: '',
      soundcloudLink: '',
      beatStarsLink: '',
      twitterLink: '',
      video: '',
      ubicacion: ''
    })
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    const validationErrors = []

    // Validación del título
    if (formData.title && formData.title.length > 60) {
      validationErrors.push('El título no puede tener más de 60 caracteres')
    }
    // Validación del artista
    if (formData.subtitle && formData.subtitle.length > 60) {
      validationErrors.push('El artista no puede tener más de 60 caracteres')
    }

    // Validación de URLs (máximo 500 caracteres)
    const urlFields = [
      { field: 'img', name: 'imagen' },
      { field: 'spotifyLink', name: 'Spotify' },
      { field: 'youtubeLink', name: 'YouTube' },
      { field: 'appleMusicLink', name: 'Apple Music' },
      { field: 'instagramLink', name: 'Instagram' },
      { field: 'soundcloudLink', name: 'SoundCloud' },
      { field: 'beatStarsLink', name: 'BeatStars' },
      { field: 'twitterLink', name: 'Twitter' },
      { field: 'video', name: 'video' }
    ]

    for (const { field, name } of urlFields) {
      if (formData[field] && formData[field].length > 500) {
        validationErrors.push(
          `La URL de ${name} no puede tener más de 500 caracteres`
        )
      }
    }

    // Validación de ubicación
    if (formData.ubicacion && formData.ubicacion.length > 100) {
      validationErrors.push('La ubicación no puede tener más de 100 caracteres')
    }

    // Si hay errores, mostrarlos y detener el envío
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // Limpiar errores si todo está bien
      setErrors([])

      // Construir el objeto según la estructura requerida por la API
      const releaseData = {
        title: formData.title,
        subtitle: formData.subtitle,
        spotifyLink: formData.spotifyLink || '',
        youtubeLink: formData.video || '',
        appleMusicLink: formData.appleMusicLink || '',
        instagramLink: formData.instagramLink || '',
        soundCloudLink: formData.soundcloudLink || '',
        beatStarsLink: formData.beatStarsLink || '',
        img: formData.img || '',
        releaseType: formData.type,
        date: formData.date || new Date().toISOString(),
        userId: user?.sub || null
      }

      if (isEditMode) {
        // En modo edición, pasar los datos al callback onSuccess
        onSuccess?.(releaseData, imageFile)
      } else {
        // En modo creación, usar el hook de createRelease
        await createRelease(releaseData, imageFile)
        
        // Limpiar el formulario después de enviar
        setFormData({
          title: '',
          subtitle: '',
          img: '',
          date: '',
          type: '',
          spotifyLink: '',
          youtubeLink: '',
          appleMusicLink: '',
          instagramLink: '',
          soundcloudLink: '',
          beatStarsLink: '',
          twitterLink: '',
          video: '',
          ubicacion: ''
        })
        setImageFile(null)
        
        onSuccess?.('Release creado con éxito')
      }
    } catch (error) {
      setErrors([apiError || 'Error al crear el release: ' + error.message])
    }
  }, [formData, createRelease, apiError, onSuccess])
  return (
    <div className="form-layout">
      {/* Columna izquierda: import + portada */}
      <aside className="form-layout__sidebar">
        {!isEditMode && (
          <SpotifyImport
            onDataImported={handleSpotifyImport}
            onReset={handleReset}
            type="release"
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
                <label htmlFor="title">Título*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className="form-group">
                <label htmlFor="artist">Artista*</label>
                <input
                  type="text"
                  id="artist"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className="form-group">
                <label htmlFor="date">Fecha de lanzamiento</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="type">Tipo*</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                <option value="">Seleccione un tipo</option>
                <option value="Song">Song</option>
                <option value="Album">Álbum</option>
                <option value="EP">EP</option>
                <option value="Videoclip">Videoclip</option>
                </select>
            </div>
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
                  name="spotifyLink"
                  value={formData.spotifyLink}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="apple">Apple Music URL</label>
                <input
                  type="url"
                  id="apple"
                  name="appleMusicLink"
                  value={formData.appleMusicLink}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="soundcloud">SoundCloud URL</label>
                <input
                  type="url"
                  id="soundcloud"
                  name="soundcloudLink"
                  value={formData.soundcloudLink}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="beatstars">BeatStars URL</label>
                <input
                  type="url"
                  id="beatstars"
                  name="beatStarsLink"
                  value={formData.beatStarsLink}
                  onChange={handleInputChange}
                />
            </div>
          </div>
        </fieldset>

        {/* --- Redes y video --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Redes y video</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="instagram">Instagram URL</label>
                <input
                  type="url"
                  id="instagram"
                  name="instagramLink"
                  value={formData.instagramLink}
                  onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="video">Video URL</label>
                <input
                  type="url"
                  id="video"
                  name="video"
                  value={formData.video}
                  onChange={handleInputChange}
                  placeholder="URL del video (YouTube embed)"
                />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="form-submit" disabled={loading}>
            {isEditMode 
              ? (loading ? 'Actualizando...' : 'Actualizar Release')
              : (loading ? 'Creando...' : 'Crear Release')
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
