import { useState, useEffect } from 'react'
import { useNewsletter } from '../../hooks/useNewsletter'
import './NewsletterPopup.css'

function NewsletterPopup () {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const { subscribe, loading, error, success, reset } = useNewsletter()

  useEffect(() => {
    // Verificar si el usuario ya ha visto el popup
    const hasSeenPopup = localStorage.getItem('newsletter_popup_seen')
    
    if (!hasSeenPopup) {
      // Mostrar el popup después de 2 segundos para mejor UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Marcar como visto en localStorage
    localStorage.setItem('newsletter_popup_seen', 'true')
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    
    // Limpiar mensajes de estado cuando el usuario empiece a escribir
    if (error || success) {
      reset()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await subscribe(email, 'popup')
      
      if (result.success) {
        // Limpiar el email solo si la suscripción fue exitosa
        setEmail('')
        
        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
          handleClose()
        }, 3000)
      }
    } catch (error) {
      console.error('Error al suscribir a newsletter:', error)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="newsletter-popup-overlay" onClick={handleClose}>
      <div className="newsletter-popup-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="newsletter-popup-close" 
          onClick={handleClose}
          aria-label="Cerrar popup"
        >
          <CloseIcon />
        </button>

        <div className="newsletter-popup-content">
          {/* Icono principal */}
          <div className="newsletter-popup-icon">
            <NewsletterIcon />
          </div>

          {/* Título */}
          <h2 className="newsletter-popup-title">
            ¡Únete a nuestra comunidad!
          </h2>

          {/* Descripción */}
          <p className="newsletter-popup-description">
            Suscríbete a nuestra newsletter y recibe contenido exclusivo totalmente gratis
          </p>

          {/* Beneficios */}
          <div className="newsletter-popup-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <MusicIcon />
              </div>
              <div className="benefit-text">
                <strong>Beats exclusivos</strong>
                <span>Acceso anticipado a producciones</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <BellIcon />
              </div>
              <div className="benefit-text">
                <strong>Novedades y lanzamientos</strong>
                <span>Sé el primero en enterarte</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <CalendarIcon />
              </div>
              <div className="benefit-text">
                <strong>Próximos eventos</strong>
                <span>No te pierdas ninguna actuación</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <DiscountIcon />
              </div>
              <div className="benefit-text">
                <strong>Descuentos exclusivos</strong>
                <span>Promociones en entradas y merchandising</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form className="newsletter-popup-form" onSubmit={handleSubmit}>
            <div className="newsletter-popup-input-group">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Introduce tu email"
                className="newsletter-popup-input"
                required
                disabled={loading || success}
              />
              <button
                type="submit"
                className={`newsletter-popup-button ${loading ? 'loading' : ''}`}
                disabled={loading || success}
              >
                {loading ? 'Enviando...' : success ? '¡Suscrito!' : 'Suscribirse'}
              </button>
            </div>

            {success && (
              <div className="newsletter-popup-status success">
                <SuccessIcon />
                ¡Te has suscrito correctamente! Revisa tu email.
              </div>
            )}

            {error && (
              <div className="newsletter-popup-status error">
                <ErrorIcon />
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <p className="newsletter-popup-footer">
            No compartimos tu información. Puedes cancelar tu suscripción en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
}

// Iconos SVG
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const NewsletterIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
    <path d="M7 10l5 3 5-3"/>
  </svg>
)

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
)

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const DiscountIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

export default NewsletterPopup
