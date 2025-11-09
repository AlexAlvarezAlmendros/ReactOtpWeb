import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useEvent } from '../hooks/useEvent'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import TicketPurchase from '../components/TicketPurchase/TicketPurchase'
import './EventoDetalle.css'

function EventoDetalle () {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { event, loading, error } = useEvent(id)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Detectar si volvemos de un pago exitoso
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)

      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', `/eventos/${id}`)

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
  }, [searchParams, id])

  if (loading) {
    return <LoadingSpinner message="Cargando evento..." />
  }

  if (error) {
    return (
      <section className="evento-section">
        <div className="evento-container">
          <div className="error-container">
            <h2>Error al cargar el evento</h2>
            <p>{error}</p>
            <Link to="/eventos" className="back-button-subtle">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              Volver a Eventos
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section className="evento-section">
        <div className="evento-container">
          <div className="error-container">
            <h2>Evento no encontrado</h2>
            <p>El evento que buscas no existe o ha sido eliminado.</p>
            <Link to="/eventos" className="back-button-subtle">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              Volver a Eventos
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const socialLinks = [
    { link: event.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify', color: '#1DB954' },
    { link: event.youtubeLink, icon: ['fab', 'youtube'], label: 'YouTube', color: '#FF0000' },
    { link: event.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music', color: '#000000' },
    { link: event.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram', color: '#E4405F' },
    { link: event.soundCloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud', color: '#FF3300' },
    { link: event.beatStarsLink, icon: ['fas', 'music'], label: 'BeatStars', color: '#FF6B35' }
  ].filter(item => item.link)

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para generar el iframe de Google Maps
  const generateMapIframe = (location) => {
    if (!location) return null
    
    // Codificamos la ubicación para la URL
    const encodedLocation = encodeURIComponent(location)
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedLocation}`
    
    // Como alternativa sin API key, usamos el enlace directo de Google Maps
    const simpleMapUrl = `https://maps.google.com/maps?q=${encodedLocation}&output=embed`
    
    return (
      <iframe
        src={simpleMapUrl}
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: '12px' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Ubicación: ${location}`}
      />
    )
  }

  return (
    <section className="evento-section">
      <div className="evento-container">
        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <div className="success-notification">
            <div className="success-icon">✓</div>
            <div>
              <h3>¡Compra exitosa!</h3>
              <p>Recibirás tus entradas por email en breve.</p>
            </div>
          </div>
        )}

        {/* Botón de volver discreto */}
        <Link to="/eventos" className="back-button-subtle">
          <FontAwesomeIcon icon={['fas', 'arrow-left']} />
          Volver a Eventos
        </Link>

        {/* Encabezado del evento */}
        <header className="evento-header">
          <div className="evento-image-container">
            <img 
              src={event.img} 
              alt={`Imagen de ${event.title}`}
              className="evento-image"
            />
          </div>
          <div className="evento-main-info">
            <h1 className="evento-title">{event.title}</h1>
            <div className="evento-underline"></div>
            <div className="evento-meta">
              {event.date && (
                <div className="evento-date">
                  <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                  <span>{formatDate(event.date)}</span>
                </div>
              )}
              {event.subtitle && (
                <div className="evento-location">
                  <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                  <span>{event.subtitle}</span>
                </div>
              )}
              {event.eventType && (
                <span className="evento-type">{event.eventType}</span>
              )}
            </div>
            {event.colaborators && (
              <div className="evento-colaborators">
                <h3>Colaboradores</h3>
                <p>{event.colaborators}</p>
              </div>
            )}
          </div>
        </header>

        <div className="evento-content">
          {/* Descripción del evento */}
          {event.description && (
            <div className="evento-description">
              <h2 className="section-title">Descripción</h2>
              <div className="section-underline"></div>
              <div 
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* NUEVO: Componente de compra de tickets */}
          <TicketPurchase event={event} />

          {/* Sección de Ubicación */}
          {event.colaborators && (
            <div className="evento-map">
              <h2 className="section-title">Ubicación</h2>
              <div className="section-underline"></div>
              <div className="map-container">
                {generateMapIframe(event.location)}
              </div>
            </div>
          )}

          {/* Sección de Enlaces */}
          {socialLinks.length > 0 && (
            <div className="evento-social">
              <h2 className="section-title">Enlaces</h2>
              <div className="section-underline"></div>
              <div className="social-links-grid">
                {socialLinks.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-card"
                    style={{ '--social-color': item.color }}
                    aria-label={`${event.title} en ${item.label}`}
                  >
                    <div className="social-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <span className="social-label">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default EventoDetalle
