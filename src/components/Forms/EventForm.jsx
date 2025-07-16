import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useCreateEvent } from '../../hooks/useCreateEvent.js'

export default function EventForm ({ onSuccess }) {
  const [errors, setErrors] = useState([])
  const { createEvent, loading, error: apiError } = useCreateEvent()

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
      'youtube',
      'instagram'
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

      const eventData = {
        name: data.title,
        location: data.location,
        colaborators: data.colaborators,
        img: data.img || '',
        youtubeLink: data.youtube || '',
        instagramLink: data.instagram || '',
        detailpageUrl: data.detailpageUrl || '',
        eventType: data.type,
        date: new Date().toISOString(),
        userId: '9416c0b4-59d5-4b7b-8ef6-b5b9f39454a4'
      }

      await createEvent(eventData)
      event.target.reset() // Limpiar el formulario después de enviar
      onSuccess?.('Evento creado con éxito') // Callback para manejar el éxito, si es necesario
    } catch (error) {
      setErrors([apiError || 'Error al crear el evento: ' + error.message])
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
            <label htmlFor="location">Ubicacion*</label>
            <input type="text" id="location" name="location" required />
        </div>

        <div className="form-group">
            <label htmlFor="colaborators">Colaboradores*</label>
            <input type="text" id="colaborators" name="colaborators" required />
        </div>

        <div className="form-group">
            <label htmlFor="img">Imagen URL*</label>
            <input type="url" id="img" name="img" required />
        </div>

        <div className="form-group">
            <label htmlFor="youtube">Youtube URL</label>
            <input type="url" id="youtube" name="youtube" />
        </div>

        <div className="form-group">
            <label htmlFor="instagram">Instagram URL</label>
            <input type="url" id="instagram" name="instagram" />
        </div>

        <div className="form-group form-group--full-width">
            <label htmlFor="type">Tipo</label>
            <select id="type" name="type" required>
            <option value="">Seleccione un tipo</option>
            <option value="Concert">Concierto</option>
            <option value="Festival">Festival</option>
            <option value="Showcase">Showcase</option>
            <option value="Party">Party</option>
            </select>
        </div>

        <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Evento'}
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
