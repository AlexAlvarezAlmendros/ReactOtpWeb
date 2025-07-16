import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useCreateArtist } from '../../hooks/useCreateArtist.js'

export default function ArtistForm ({ onSuccess }) {
  const [errors, setErrors] = useState([])
  const { createArtist, loading, error: apiError } = useCreateArtist()

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
    if (data.artist && data.artist.length > 60) {
      validationErrors.push('El artista no puede tener más de 60 caracteres')
    }

    // Validación de URLs (máximo 150 caracteres)
    const urlFields = [
      'img',
      'spotify',
      'youtube',
      'apple',
      'instagram',
      'soundcloud'
    ]
    for (const field of urlFields) {
      if (data[field] && data[field].length > 300) {
        validationErrors.push(
          `La URL de ${field} no puede tener más de 300 caracteres`
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
        name: data.name,
        genre: data.genre,
        img: data.img || '',
        spotifyLink: data.spotify || '',
        youtubeLink: data.youtube || '',
        appleMusicLink: data.apple || '',
        instagramLink: data.instagram || '',
        soundcloudLink: data.soundcloud || '',
        artistType: data.type,
        userId: '9416c0b4-59d5-4b7b-8ef6-b5b9f39454a4'
      }

      await createArtist(artistData)
      event.target.reset() // Limpiar el formulario después de enviar
      onSuccess?.('Artista creado con éxito') // Callback para manejar el éxito, si es necesario
    } catch (error) {
      setErrors([apiError || 'Error al crear el artista: ' + error.message])
    }
  }
  return (
    <section>
        <form onSubmit={handleSubmit} className="createCardModal__form">
        <div className="form-group">
            <label htmlFor="name">Nombre*</label>
            <input type="text" id="name" name="name" required />
        </div>

        <div className="form-group">
            <label htmlFor="genre">Genero*</label>
            <input type="text" id="genre" name="genre" required />
        </div>

        <div className="form-group">
            <label htmlFor="img">Imagen URL*</label>
            <input type="url" id="img" name="img" required />
        </div>

        <div className="form-group">
            <label htmlFor="spotify">Spotify URL</label>
            <input type="url" id="spotify" name="spotify" />
        </div>

        <div className="form-group">
            <label htmlFor="youtube">Youtube URL</label>
            <input type="url" id="youtube" name="youtube" />
        </div>

        <div className="form-group">
            <label htmlFor="apple">Apple URL</label>
            <input type="url" id="apple" name="apple" />
        </div>

        <div className="form-group">
            <label htmlFor="instagram">Instagram URL</label>
            <input type="url" id="instagram" name="instagram" />
        </div>

        <div className="form-group">
            <label htmlFor="soundcloud">SoundCloud URL</label>
            <input type="url" id="soundcloud" name="soundcloud" />
        </div>

        <div className="form-group form-group--full-width">
            <label htmlFor="type">Tipo</label>
            <select id="type" name="type" required>
            <option value="">Seleccione un tipo</option>
            <option value="Producer">Productor</option>
            <option value="Singer">Cantante</option>
            <option value="Filmmaker">Filmaker</option>
            <option value="Developer">Developer</option>
            </select>
        </div>

        <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Artista'}
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
