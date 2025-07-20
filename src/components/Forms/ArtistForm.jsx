import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useCallback } from 'react'
import { useCreateArtist } from '../../hooks/useCreateArtist.js'
import SpotifyImport from '../SpotifyImport/SpotifyImport.jsx'

export default function ArtistForm ({ onSuccess }) {
  const [errors, setErrors] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    img: '',
    spotify: '',
    youtube: '',
    apple: '',
    instagram: '',
    soundcloud: '',
    type: ''
  })
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

    // Validación del nombre
    if (formData.name && formData.name.length > 60) {
      validationErrors.push('El nombre no puede tener más de 60 caracteres')
    }
    // Validación del género
    if (formData.genre && formData.genre.length > 60) {
      validationErrors.push('El género no puede tener más de 60 caracteres')
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
        soundcloudLink: formData.soundcloud || '',
        artistType: formData.type,
        userId: '9416c0b4-59d5-4b7b-8ef6-b5b9f39454a4'
      }

      await createArtist(artistData)
      
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
        type: ''
      })
      
      onSuccess?.('Artista creado con éxito') // Callback para manejar el éxito, si es necesario
    } catch (error) {
      setErrors([apiError || 'Error al crear el artista: ' + error.message])
    }
  }, [formData, createArtist, apiError, onSuccess])
  return (
    <section>
        {/* Componente de importación de Spotify */}
        <SpotifyImport
          onDataImported={handleSpotifyImport}
          type="artist"
        />

        <form onSubmit={handleSubmit} className="createCardModal__form">
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
            <label htmlFor="genre">Genero*</label>
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
            <label htmlFor="img">Imagen URL*</label>
            <input
              type="url"
              id="img"
              name="img"
              value={formData.img}
              onChange={handleInputChange}
              required
            />
        </div>

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
            <label htmlFor="youtube">Youtube URL</label>
            <input
              type="url"
              id="youtube"
              name="youtube"
              value={formData.youtube}
              onChange={handleInputChange}
            />
        </div>

        <div className="form-group">
            <label htmlFor="apple">Apple URL</label>
            <input
              type="url"
              id="apple"
              name="apple"
              value={formData.apple}
              onChange={handleInputChange}
            />
        </div>

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

        <div className="form-group form-group--full-width">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
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
