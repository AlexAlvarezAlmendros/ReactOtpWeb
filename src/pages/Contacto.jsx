import { useState } from 'react'
import { useContact } from '../hooks/useContact'
import './Contacto.css'
import Footer from '../components/Footer/Footer'

function Contacto () {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  // Estados para newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState(null)

  const { sendMessage, loading, error, success, reset } = useContact()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar mensajes de estado cuando el usuario empiece a escribir
    if (error || success) {
      reset()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await sendMessage(formData)
      // Si el envío es exitoso, limpiar el formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      // El error ya está manejado en el hook
      console.error('Error al enviar el formulario:', error)
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterLoading(true)
    setNewsletterError(null)
    setNewsletterSuccess(false)

    try {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newsletterEmail)) {
        throw new Error('Por favor, introduce un email válido')
      }

      // Simular envío a la API de newsletter
      // En un caso real, esto sería una llamada a tu endpoint de newsletter
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setNewsletterSuccess(true)
      setNewsletterEmail('')
      
      // Limpiar el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setNewsletterSuccess(false)
      }, 5000)
      
    } catch (error) {
      setNewsletterError(error.message)
      // Limpiar el mensaje de error después de 5 segundos
      setTimeout(() => {
        setNewsletterError(null)
      }, 5000)
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <>
    <section className="contacto-section">
      <div className="contacto-container">
        {/* Encabezado de sección */}
        <header className="contacto-header">
          <h1 className="contacto-title">CONTÁCTANOS</h1>
          <div className="contacto-underline"></div>
          <p className="contacto-subtitle">
            ¿Tienes un proyecto en mente? Hablemos sobre cómo podemos llevarlo al siguiente nivel.
          </p>
        </header>

        <div className="contacto-content">
          {/* Información de contacto */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">
                <EmailIcon />
              </div>
              <h3>Email</h3>
              <p>justsomeotherpeople@gmail.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <PhoneIcon />
              </div>
              <h3>Teléfono</h3>
              <p>+34 656 852 437</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <LocationIcon />
              </div>
              <h3>Ubicación</h3>
              <p>Av Europa, Carrer de Dinamarca, 35</p>
              <p>08700 Igualada, Barcelona</p>
            </div>

            {/* Newsletter Subscription */}
            <div className="newsletter-card">
              <div className="newsletter-content">
                <div className="newsletter-icon">
                  <NewsletterIcon />
                </div>
                <h3>Newsletter</h3>
                <p>Suscríbete para recibir novedades sobre lanzamientos, eventos y noticias de nuestros artistas.</p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <div className="newsletter-input-group">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="newsletter-input"
                      required
                    />
                    <button
                      type="submit"
                      className={`newsletter-button ${newsletterLoading ? 'loading' : ''}`}
                      disabled={newsletterLoading}
                    >
                      {newsletterLoading ? 'Enviando...' : 'Suscribirse'}
                    </button>
                  </div>
                  
                  {newsletterSuccess && (
                    <div className="newsletter-status success">
                      <SuccessIcon />
                      ¡Te has suscrito correctamente!
                    </div>
                  )}
                  
                  {newsletterError && (
                    <div className="newsletter-status error">
                      <ErrorIcon />
                      {newsletterError}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+34 123 456 789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                Asunto *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Selecciona un asunto</option>
                <option value="booking">Booking de Artistas</option>
                <option value="studio">Servicios de Estudio</option>
                <option value="demo">Envío de Demo</option>
                <option value="collaboration">Colaboración</option>
                <option value="press">Prensa y Medios</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Mensaje *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="form-textarea"
                required
                placeholder="Cuéntanos sobre tu proyecto..."
                rows={5}
              />
            </div>

            {success && (
              <div className="form-status success">
                <SuccessIcon />
                ¡Mensaje enviado correctamente! Te contactaremos pronto.
              </div>
            )}

            {error && (
              <div className="form-status error">
                <ErrorIcon />
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
            
            <div className="form-info">
              <p>* Campos obligatorios</p>
            </div>
          </form>
        </div>
      </div>
    </section>
    <Footer />
    </>
  )
}

// Iconos SVG
const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Email">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Teléfono">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Ubicación">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Horario">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
)

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Éxito">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Error">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const NewsletterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Newsletter">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
    <path d="M7 10l5 3 5-3"/>
  </svg>
)

export default Contacto
