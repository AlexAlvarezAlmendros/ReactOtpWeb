import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

export default function EventForm () {
  const [errors, setErrors] = useState([])

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    const validationErrors = []

    // Validación del título
    if (data.title.length > 60) {
      validationErrors.push('El título no puede tener más de 60 caracteres')
    }
    // Validación del artista
    if (data.artist.length > 60) {
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

    // Limpiar errores si todo está bien
    setErrors([])
    // Aquí puedes agregar la lógica para procesar los datos válidos
    console.log('Datos del formulario:', data)
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

        <button type="submit" className="form-submit">
            Crear Tarjeta
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
