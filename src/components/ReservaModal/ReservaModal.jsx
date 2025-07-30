import React, { useState, useEffect } from 'react'
import './ReservaModal.css'

function ReservaModal ({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    servicio: '',
    mensaje: '',
    nombre: '',
    email: '',
    telefono: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY
      
      // Deshabilitar scroll del body
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restaurar el scroll del body al cerrar el modal
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        
        // Restaurar la posición del scroll
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  const servicios = [
    'Grabación',
    'Mezcla',
    'Mastering',
    'Producción de Beats',
    'Sesiones de Composición',
    'Pulido de Vocales Pro'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria'
    } else {
      const fechaSeleccionada = new Date(formData.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      
      if (fechaSeleccionada < hoy) {
        newErrors.fecha = 'La fecha no puede ser anterior a hoy'
      }
    }

    if (!formData.hora) {
      newErrors.hora = 'La hora es obligatoria'
    }

    if (!formData.servicio) {
      newErrors.servicio = 'Selecciona un servicio'
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Generar el contenido del email de reserva
      const emailContent = {
        tipo: 'reserva_estudio',
        asunto: `Nueva Reserva de Estudio - ${formData.servicio}`,
        datos: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono || 'No proporcionado',
          fecha: formData.fecha,
          hora: formData.hora,
          servicio: formData.servicio,
          mensaje: formData.mensaje,
          fechaSolicitud: new Date().toISOString()
        }
      }

      await onSubmit(emailContent)
      
      // Resetear formulario
      setFormData({
        fecha: '',
        hora: '',
        servicio: '',
        mensaje: '',
        nombre: '',
        email: '',
        telefono: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error al enviar reserva:', error)
      setErrors({ submit: 'Error al enviar la reserva. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClick = (e) => {
    // Comentamos la funcionalidad de cerrar al hacer clic fuera
    // if (e.target === e.currentTarget) {
    //   onClose()
    // }
  }

  // Generar opciones de hora (de 9:00 a 20:00)
  const horasDisponibles = []
  for (let i = 9; i <= 20; i++) {
    horasDisponibles.push(`${i.toString().padStart(2, '0')}:00`)
    if (i < 20) {
      horasDisponibles.push(`${i.toString().padStart(2, '0')}:30`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="reserva-modal-overlay" onClick={handleModalClick}>
      <div className="reserva-modal">
        <div className="modal-header">
          <h2>Reservar Sesión de Estudio</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <form className="reserva-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={errors.nombre ? 'error' : ''}
                placeholder="Tu nombre completo"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="tu@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="+34 123 456 789 (opcional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha">Fecha de la sesión *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className={errors.fecha ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.fecha && <span className="error-message">{errors.fecha}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="hora">Hora de la sesión *</label>
              <select
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={handleInputChange}
                className={errors.hora ? 'error' : ''}
              >
                <option value="">Selecciona una hora</option>
                {horasDisponibles.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>
              {errors.hora && <span className="error-message">{errors.hora}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="servicio">Servicio solicitado *</label>
            <select
              id="servicio"
              name="servicio"
              value={formData.servicio}
              onChange={handleInputChange}
              className={errors.servicio ? 'error' : ''}
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio} value={servicio}>{servicio}</option>
              ))}
            </select>
            {errors.servicio && <span className="error-message">{errors.servicio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje adicional *</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleInputChange}
              className={errors.mensaje ? 'error' : ''}
              placeholder="Cuéntanos más detalles sobre tu proyecto, duración estimada, equipamiento necesario, etc."
              rows="4"
            />
            {errors.mensaje && <span className="error-message">{errors.mensaje}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                'Enviar Reserva'
              )}
            </button>
          </div>
        </form>

        <div className="modal-info">
          <p className="info-text">
            <strong>📋 Información importante:</strong>
          </p>
          <ul className="info-list">
            <li>Las reservas están sujetas a disponibilidad</li>
            <li>Te contactaremos en 24-48 horas para confirmar</li>
            <li>Horario de estudio: 9:00 - 20:00</li>
          </ul>
        </div>
      </div> 
    </div>
  )
}

export default ReservaModal
