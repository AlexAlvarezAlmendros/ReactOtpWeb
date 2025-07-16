import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useCreateRelease } from '../../hooks/useCreateReleases.js'

export default function ReleaseForm ({ onSuccess }) {
  const [errors, setErrors] = useState([])
  const { createRelease, loading, error: apiError } = useCreateRelease()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    const validationErrors = []

    // Validación del título
    if (data.title && data.title.length > 60) {
      validationErrors.push('El título no puede tener más de 60 caracteres')
    }
    // Validación del artista
    if (data.subtitle && data.subtitle.length > 60) {
      validationErrors.push('El artista no puede tener más de 60 caracteres')
    }

    // Validación de URLs (máximo 500 caracteres)
    const urlFields = [
      'img',
      'spotifyLink',
      'youtubeLink',
      'appleMusicLink',
      'instagramLink',
      'soundcloudLink',
      'beatStarsLink',
      'twitterLink',
      'video'
    ]

    for (const field of urlFields) {
      if (data[field] && data[field].length > 500) {
        validationErrors.push(
          `La URL de ${field} no puede tener más de 500 caracteres`
        )
      }
    }

    // Validación de ubicación
    if (data.ubicacion && data.ubicacion.length > 100) {
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
        title: data.title,
        subtitle: data.subtitle,
        spotifyLink: data.spotifyLink || '',
        youtubeLink: data.video || '',
        appleMusicLink: data.appleMusicLink || '',
        instagramLink: data.instagramLink || '',
        soundCloudLink: data.soundCloudLink || '',
        beatStarsLink: data.beatStarsLink || '',
        img: data.img || '',
        releaseType: data.releaseType,
        date: new Date().toISOString(),
        userId: '9416c0b4-59d5-4b7b-8ef6-b5b9f39454a4'
      }

      await createRelease(releaseData)
      event.target.reset() // Limpiar el formulario después de enviar
      onSuccess?.('Release creado con éxito') // Callback para manejar el éxito, si es necesario
    } catch (error) {
      setErrors([apiError || 'Error al crear el release: ' + error.message])
    }
  }
  return (
    <section>
        <form onSubmit={handleSubmit} className="createCardModal__form">
        <div className="form-group">
            <label htmlFor="title">Título*</label>
            <input type="text" id="title" name="title" required />
        </div>

        <div className="form-group">
            <label htmlFor="artist">Artista*</label>
            <input type="text" id="artist" name="subtitle" required />
        </div>

        <div className="form-group">
            <label htmlFor="img">Imagen URL*</label>
            <input type="url" id="img" name="img" required />
        </div>

        <div className="form-group">
            <label htmlFor="spotify">Spotify URL</label>
            <input type="url" id="spotify" name="spotifyLink" />
        </div>

        <div className="form-group">
            <label htmlFor="apple">Apple URL</label>
            <input type="url" id="apple" name="appleMusicLink" />
        </div>

        <div className="form-group">
            <label htmlFor="instagram">Instagram URL</label>
            <input type="url" id="instagram" name="instagramLink" />
        </div>

        <div className="form-group">
            <label htmlFor="soundcloud">SoundCloud URL</label>
            <input type="url" id="soundcloud" name="soundCloudLink" />
        </div>

        <div className="form-group">
            <label htmlFor="beatstars">BeatStars URL</label>
            <input type="url" id="beatstars" name="beatStarsLink" />
        </div>

        <div className="form-group">
            <label htmlFor="video">Video URL</label>
            <input type="url" id="video" name="video" placeholder="URL del video (YouTube embed)" />
        </div>

        <div className="form-group form-group--full-width">
            <label htmlFor="type">Tipo</label>
            <select id="type" name="releaseType" required>
            <option value="">Seleccione un tipo</option>
            <option value="Song">Song</option>
            <option value="Album">Álbum</option>
            <option value="EP">EP</option>
            <option value="Videoclip">Videoclip</option>
            </select>
        </div>

        <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Release'}
        </button>
        </form>

        {errors.length > 0 && (
        <div className="error-messages">
            {errors.map((error, index) => (
            <p key={index}>{error}</p>
            ))}
        </div>
        )}
    </section>
  )
}
