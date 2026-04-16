import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './BeatLicenseModal.css'

export default function BeatLicenseModal({ isOpen, onClose, beat, onPurchase }) {
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [errors, setErrors] = useState({})
  const customerInfoRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!selectedLicense) {
      newErrors.license = 'Por favor selecciona una licencia'
    }

    if (!customerName.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!customerEmail.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePurchase = () => {
    if (validateForm()) {
      onPurchase({
        beatId: beat._id || beat.id,
        licenseId: selectedLicense.id,
        customerName,
        customerEmail
      })
    } else {
      // Scroll automático al formulario si hay errores
      if (customerInfoRef.current) {
        customerInfoRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }

  const formatValue = (value) => {
    if (value === 'unlimited' || value === -1 || value === 0) {
      return 'Ilimitado'
    }
    return value?.toLocaleString('es-ES') || '0'
  }

  if (!isOpen) return null

  const licenses = beat.licenses || []

  return (
    <div className="beat-license-modal-overlay" onClick={handleOverlayClick}>
      <div className="beat-license-modal">
        <div className="modal-header">
          <h2>Elige tu Licencia</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={['fas', 'times']} />
          </button>
        </div>

        <div className="beat-info">
          <div className="beat-info-content">
            {beat.coverUrl && (
              <img src={beat.coverUrl} alt={beat.title} className="beat-thumbnail" />
            )}
            <div className="beat-details">
              <h3>{beat.title}</h3>
              <p className="beat-producer">
                {typeof beat.producer === 'string' 
                  ? beat.producer 
                  : beat.producer?.name || 'Desconocido'}
              </p>
              <div className="beat-meta">
                <span>{beat.bpm} BPM</span>
                {beat.key && <span>· {beat.key}</span>}
                {beat.genre && <span>· {beat.genre}</span>}
              </div>
            </div>
          </div>
        </div>

        {errors.license && (
          <div className="error-message">{errors.license}</div>
        )}

        <div className="licenses-container">
          {licenses.length === 0 ? (
            <div className="no-licenses">
              <p>No hay licencias disponibles para este beat</p>
            </div>
          ) : (
            licenses.map((license) => (
              <div
                key={license.id}
                className={`license-card ${selectedLicense?.id === license.id ? 'selected' : ''}`}
                onClick={() => setSelectedLicense(license)}
              >
                <div className="license-header">
                  <h3>{license.name}</h3>
                  <div className="license-price">
                    <span className="currency">€</span>
                    <span className="amount">{license.price.toFixed(2)}</span>
                  </div>
                </div>

                {license.description && (
                  <p className="license-description">{license.description}</p>
                )}

                <div className="license-formats">
                  <h4>Formatos incluidos</h4>
                  <div className="format-tags">
                    {license.formats?.map((format) => (
                      <span key={format} className="format-tag">
                        <FontAwesomeIcon icon={['fas', 'file-audio']} />
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {license.terms && (
                  <div className="license-terms">
                    <h4>Términos de uso</h4>
                    <ul className="terms-list">
                      {license.terms.usedForRecording !== undefined && (
                        <li>
                          <FontAwesomeIcon 
                            icon={['fas', license.terms.usedForRecording ? 'check' : 'times']} 
                            className={license.terms.usedForRecording ? 'check-icon' : 'times-icon'}
                          />
                          Grabación musical
                        </li>
                      )}
                      {license.terms.distributionLimit !== undefined && (
                        <li>
                          <FontAwesomeIcon icon={['fas', 'compact-disc']} />
                          Distribuir hasta {formatValue(license.terms.distributionLimit)} copias
                        </li>
                      )}
                      {license.terms.audioStreams !== undefined && (
                        <li>
                          <FontAwesomeIcon icon={['fas', 'headphones']} />
                          {formatValue(license.terms.audioStreams)} reproducciones online
                        </li>
                      )}
                      {license.terms.musicVideos !== undefined && (
                        <li>
                          <FontAwesomeIcon icon={['fas', 'video']} />
                          {formatValue(license.terms.musicVideos)} vídeos musicales
                        </li>
                      )}
                      {license.terms.forProfitPerformances !== undefined && (
                        <li>
                          <FontAwesomeIcon 
                            icon={['fas', license.terms.forProfitPerformances ? 'check' : 'times']} 
                            className={license.terms.forProfitPerformances ? 'check-icon' : 'times-icon'}
                          />
                          Actuaciones con ánimo de lucro
                        </li>
                      )}
                      {license.terms.radioBroadcasting !== undefined && (
                        <li>
                          <FontAwesomeIcon icon={['fas', 'radio']} />
                          Radio: {formatValue(license.terms.radioBroadcasting)} emisoras
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="license-select-indicator">
                  {selectedLicense?.id === license.id && (
                    <>
                      <FontAwesomeIcon icon={['fas', 'check-circle']} />
                      <span>Seleccionada</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {licenses.length > 0 && (
          <div className="customer-info-section infocomprador-componente" ref={customerInfoRef}>
            <h3>Información del Comprador</h3>
            <div className="form-group">
              <label htmlFor="customerName">
                Nombre completo <span className="required">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre completo"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="tu@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
              <small className="field-hint">
                Recibirás el beat en este email tras completar la compra
              </small>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          {licenses.length > 0 && (
            <button 
              className="btn-primary" 
              onClick={handlePurchase}
              disabled={!selectedLicense}
              type="button"
            >
              Proceder al Pago
              {selectedLicense && (
                <span className="btn-price"> · {selectedLicense.price.toFixed(2)}€</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
