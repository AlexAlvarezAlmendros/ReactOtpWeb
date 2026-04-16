import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpenText, faCheckCircle, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useUnsubscribe } from '../hooks'
import './Unsubscribe.css'

export default function Unsubscribe () {
  const navigate = useNavigate()
  const { unsubscribe, loading, error, success, email, response } = useUnsubscribe()
  const [manualEmail, setManualEmail] = useState('')
  const [showManualForm, setShowManualForm] = useState(false)
  const [autoUnsubscribed, setAutoUnsubscribed] = useState(false)

  // Auto-desuscribir si hay email/token en la URL
  useEffect(() => {
    if (email && !autoUnsubscribed && !success && !error) {
      setAutoUnsubscribed(true)
      unsubscribe()
    }
  }, [email, autoUnsubscribed, success, error, unsubscribe])

  const handleManualUnsubscribe = async (e) => {
    e.preventDefault()
    
    if (!manualEmail || manualEmail.trim() === '') {
      return
    }

    await unsubscribe(manualEmail)
  }

  const handleShowManualForm = () => {
    setShowManualForm(true)
  }

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-container">
        {/* Header Section */}
        <div className="unsubscribe-header">
          <FontAwesomeIcon 
            icon={faEnvelopeOpenText} 
            className="header-icon"
          />
          <h1>Desuscripción de Newsletter</h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="unsubscribe-state loading">
            <FontAwesomeIcon icon={faSpinner} className="state-icon" spin />
            <h2>Procesando desuscripción...</h2>
            <p>Por favor, espera un momento.</p>
          </div>
        )}

        {/* Success State */}
        {!loading && success && (
          <div className="unsubscribe-state success">
            <FontAwesomeIcon icon={faCheckCircle} className="state-icon" />
            <h2>¡Desuscripción exitosa!</h2>
            {response?.email && (
              <p className="success-email">
                {response.email} ha sido desuscrito de nuestra newsletter.
              </p>
            )}
            <p>Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte.</p>
            <div className="action-buttons">
              <Link to="/" className="btn-primary">
                Volver al inicio
              </Link>
              <button 
                onClick={() => navigate('/')} 
                className="btn-secondary"
              >
                Suscribirme nuevamente
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && !success && (
          <div className="unsubscribe-state error">
            <FontAwesomeIcon icon={faExclamationCircle} className="state-icon" />
            <h2>Error en la desuscripción</h2>
            <p className="error-message">{error}</p>
            <div className="action-buttons">
              <Link to="/" className="btn-primary">
                Volver al inicio
              </Link>
              <button 
                onClick={handleShowManualForm} 
                className="btn-secondary"
              >
                Intentar con otro email
              </button>
            </div>
          </div>
        )}

        {/* Initial State or Manual Form */}
        {!loading && !success && !email && !showManualForm && (
          <div className="unsubscribe-state initial">
            <h2>¿Deseas desuscribirte de nuestra newsletter?</h2>
            <p>
              Si llegaste aquí por error o no tienes el enlace de desuscripción en tu email,
              puedes introducir tu dirección de correo electrónico manualmente.
            </p>
            <button 
              onClick={handleShowManualForm} 
              className="btn-primary"
            >
              Desuscribirme manualmente
            </button>
            <Link to="/" className="btn-link">
              Volver al inicio
            </Link>
          </div>
        )}

        {/* Manual Form */}
        {!loading && !success && showManualForm && (
          <div className="unsubscribe-form-container">
            <h2>Introduce tu email</h2>
            <p>Ingresa el email que deseas desuscribir de nuestra newsletter.</p>
            <form onSubmit={handleManualUnsubscribe} className="unsubscribe-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              {error && (
                <div className="form-error">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Desuscribirme
                </button>
                <Link to="/" className="btn-secondary">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Footer Info */}
        <div className="unsubscribe-footer">
          <p className="footer-text">
            ¿Necesitas ayuda? <Link to="/contacto">Contáctanos</Link>
          </p>
          <p className="footer-text small">
            Al desuscribirte, dejarás de recibir nuestras actualizaciones sobre nuevos lanzamientos, 
            eventos y contenido exclusivo.
          </p>
        </div>
      </div>
    </div>
  )
}
