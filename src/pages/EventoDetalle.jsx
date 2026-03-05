import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useEvent } from '../hooks/useEvent'
import { usePageMeta } from '../hooks/usePageMeta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import TicketPurchase from '../components/TicketPurchase/TicketPurchase'
import LazyImage from '../components/LazyImage/LazyImage'
import './EventoDetalle.css'

function EventoDetalle () {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { event, loading, error } = useEvent(id)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  usePageMeta({
    title: event?.title,
    description: [event?.subtitle, event?.eventType].filter(Boolean).join(' · '),
    image: event?.img
  })

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
      <section className="evento-detail">
        <div className="evento-detail__error">
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="evento-detail__error-icon" />
          <h2>Error al cargar el evento</h2>
          <p>{error}</p>
          <Link to="/eventos" className="evento-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Eventos
          </Link>
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section className="evento-detail">
        <div className="evento-detail__error">
          <FontAwesomeIcon icon={['fas', 'calendar-xmark']} className="evento-detail__error-icon" />
          <h2>Evento no encontrado</h2>
          <p>El evento que buscas no existe o ha sido eliminado.</p>
          <Link to="/eventos" className="evento-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Eventos
          </Link>
        </div>
      </section>
    )
  }

  const socialLinks = [
    { link: event.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify', color: '#1DB954' },
    { link: event.youtubeLink, icon: ['fab', 'youtube'], label: 'YouTube', color: '#FF0000' },
    { link: event.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music', color: '#fc3c44' },
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

  const formatDateShort = (dateString) => {
    if (!dateString) return { day: '', month: '' }
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
    }
  }

  // Función para generar el iframe de Google Maps
  const generateMapIframe = (location) => {
    if (!location) return null

    const encodedLocation = encodeURIComponent(location)
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

  const dateShort = formatDateShort(event.date)

  return (
    <section className="evento-detail">
      {/* Success notification */}
      {showSuccessMessage && (
        <div className="evento-detail__success">
          <div className="evento-detail__success-icon">
            <FontAwesomeIcon icon={['fas', 'check']} />
          </div>
          <div>
            <h3>¡Compra exitosa!</h3>
            <p>Recibirás tus entradas por email en breve.</p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="evento-hero">
        <div className="evento-hero__backdrop">
          <img src={event.img} alt="" className="evento-hero__bg" aria-hidden="true" />
          <div className="evento-hero__overlay" />
        </div>
        <div className="evento-hero__content">
          <Link to="/eventos" className="evento-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Eventos
          </Link>
          <div className="evento-hero__layout">
            <div className="evento-hero__poster-wrapper">
              <LazyImage
                src={event.img}
                alt={`Imagen de ${event.title}`}
                className="evento-hero__poster"
              />
              {event.date && (
                <div className="evento-hero__date-badge">
                  <span className="evento-hero__date-day">{dateShort.day}</span>
                  <span className="evento-hero__date-month">{dateShort.month}</span>
                </div>
              )}
            </div>
            <div className="evento-hero__info">
              {event.eventType && (
                <span className="evento-hero__type-badge">{event.eventType}</span>
              )}
              <h1 className="evento-hero__title">{event.title}</h1>
              <div className="evento-hero__accent" />
              {/* Fecha y ubicación — solo desktop */}
              {(event.date || event.subtitle) && (
                <div className="evento-hero__meta evento-hero__meta--desktop">
                  {event.date && (
                    <div className="evento-hero__meta-item">
                      <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  )}
                  {event.subtitle && (
                    <div className="evento-hero__meta-item">
                      <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                      <span>{event.subtitle}</span>
                    </div>
                  )}
                </div>
              )}
              {event.colaborators && (
                <div className="evento-hero__collab">
                  <FontAwesomeIcon icon={['fas', 'users']} />
                  <span>{event.colaborators}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="evento-detail__body">
        {/* Meta: fecha y ubicación — solo mobile */}
        {(event.date || event.subtitle) && (
          <div className="evento-hero__meta evento-hero__meta--mobile">
            {event.date && (
              <div className="evento-hero__meta-item">
                <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                <span>{formatDate(event.date)}</span>
              </div>
            )}
            {event.subtitle && (
              <div className="evento-hero__meta-item">
                <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                <span>{event.subtitle}</span>
              </div>
            )}
          </div>
        )}

        {/* Descripción */}
        {event.description && (
          <div className="evento-detail__section">
            <div className="evento-detail__section-header">
              <h2>Sobre el evento</h2>
              <div className="evento-detail__section-line" />
            </div>
            <div className="evento-detail__description">
              <div
                className="evento-detail__rich-text"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          </div>
        )}

        {/* Compra de tickets */}
        <TicketPurchase event={event} />

        {/* Ubicación */}
        {event.subtitle && (
          <div className="evento-detail__section">
            <div className="evento-detail__section-header">
              <h2>Ubicación</h2>
              <div className="evento-detail__section-line" />
            </div>
            <div className="evento-detail__map-wrapper">
              {generateMapIframe(event.location || event.subtitle)}
            </div>
            <div className="evento-detail__address">
              <FontAwesomeIcon icon={['fas', 'location-dot']} />
              <span>{event.subtitle}</span>
            </div>
          </div>
        )}

        {/* Enlaces */}
        {socialLinks.length > 0 && (
          <div className="evento-detail__section">
            <div className="evento-detail__section-header">
              <h2>Enlaces</h2>
              <div className="evento-detail__section-line" />
            </div>
            <div className="evento-detail__social-grid">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evento-social-card"
                  style={{ '--social-color': item.color }}
                  aria-label={`${event.title} en ${item.label}`}
                >
                  <div className="evento-social-card__icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <span className="evento-social-card__label">{item.label}</span>
                  <FontAwesomeIcon icon={['fas', 'arrow-right']} className="evento-social-card__arrow" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventoDetalle
