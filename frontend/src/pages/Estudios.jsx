import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Estudios.css'
import './ListingPage.css'
import ReservaModal from '../components/ReservaModal/ReservaModal'
import { useReserva } from '../hooks/useReserva'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import Footer from '../components/Footer/Footer'
import GlassSurface from '../components/GlassSurface'

/**
 * Catálogo de servicios del estudio en JSON-LD. Cuelga del nodo
 * EntertainmentBusiness (#estudio) que ya declara index.html.
 */
const ESTUDIO_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EntertainmentBusiness',
      '@id': 'https://www.otherpeople.es/#estudio',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de estudio',
        itemListElement: [
          'Grabación de voces',
          'Mezcla',
          'Mastering',
          'Producción de beats',
          'Sesiones de composición',
          'Pulido de vocales'
        ].map((name) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name,
            areaServed: { '@type': 'AdministrativeArea', name: 'Barcelona' },
            provider: { '@id': 'https://www.otherpeople.es/#organization' }
          }
        }))
      }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.otherpeople.es/' },
        { '@type': 'ListItem', position: 2, name: 'Estudio de grabación', item: 'https://www.otherpeople.es/estudios' }
      ]
    }
  ]
}

function Estudios () {
  usePageMeta({
    title: 'Estudio de grabación en Barcelona — Mezcla y mastering',
    description: 'Estudio de grabación profesional en Sant Joan de Mediona: grabación de voces, mezcla, mastering, producción de beats y sesiones de composición. Reserva tu sesión.'
  })

  useJsonLd(ESTUDIO_JSONLD)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { enviarReserva, isLoading, error } = useReserva()

  const services = [
    {
      id: 1,
      title: 'Grabación',
      description: 'Captura profesional de audio en estudio',
      type: 'icon',
      icon: 'microphone'
    },
    {
      id: 2,
      title: 'Mezcla',
      description: 'Balance y procesamiento de pistas',
      type: 'icon',
      icon: 'mixer'
    },
    {
      id: 3,
      title: 'Mastering',
      description: 'Mejoramiento final de sonido',
      type: 'icon',
      icon: 'waveform'
    },
    {
      id: 4,
      title: 'Producción de Beats',
      description: 'Creación de instrumentales personalizadas',
      type: 'image',
      image: '/img/studio/prod.png'
    },
    {
      id: 5,
      title: 'Sesiones de Composición',
      description: 'Espacios creativos para desarrollar tus ideas musicales',
      type: 'image',
      image: '/img/studio/comp.png'
    },
    {
      id: 6,
      title: 'Pulido de Volcales Pro',
      description: 'Mejora de la calidad vocal en grabaciones',
      type: 'image',
      image: '/img/studio/vocal.png'
    }
  ]

  const MicrophoneIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Micrófono">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )

  const MixerIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Mesa de mezclas">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M7 7h.01"/>
      <path d="M11 7h.01"/>
      <path d="M15 7h.01"/>
      <path d="M7 11v4"/>
      <path d="M11 11v4"/>
      <path d="M15 11v4"/>
      <circle cx="7" cy="17" r="1"/>
      <circle cx="11" cy="17" r="1"/>
      <circle cx="15" cy="17" r="1"/>
    </svg>
  )

  const WaveformIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Forma de onda">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12h8"/>
      <path d="M12 8v8"/>
      <path d="M9 9l6 6"/>
      <path d="M15 9l-6 6"/>
    </svg>
  )

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'microphone':
        return <MicrophoneIcon />
      case 'mixer':
        return <MixerIcon />
      case 'waveform':
        return <WaveformIcon />
      default:
        return null
    }
  }

  const handleReservaClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitReserva = async (datosReserva) => {
    try {
      await enviarReserva(datosReserva)
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  return (
    <>
      <section className="estudios-section">
      <div className="estudios-container">
        {/* Encabezado de sección */}
        <header className="estudios-header">
          <h1 className="estudios-title">ESTUDIO DE GRABACIÓN</h1>
          <div className="estudios-underline"></div>
          <p className="estudios-intro">
            Grabamos, mezclamos y masterizamos en nuestro estudio de Sant Joan de Mediona, a 1 hora
            de Barcelona en la Masia {' '}
            <Link to="https://www.google.com/maps/place/Masia+Agullons/@41.4786912,1.5878298,827m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12a46c2fa4d3840d:0x2f99fa16b0f0a188!8m2!3d41.4786872!4d1.5904047!16s%2Fg%2F11ckqr7mm9?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D">Ales Agullons</Link>{' '}situada en un entorno natural 
            que ayuda a crear un ambiente propicio para la creatividad. Si además buscas{' '}
            <Link to="/discografica-barcelona">sello</Link> o{' '}
            <Link to="/booking-artistas">booking</Link>, lo hablamos en la misma sesión.
          </p>
        </header>

        {/* Grid de servicios */}
        <div className="services-grid">
          {services.map((service) => (
            <GlassSurface
              key={service.id}
              className={`service-card ${service.type}`}
              onClick={handleReservaClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleReservaClick()
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {service.type === 'icon' ? (
                <>
                  <div className="service-icon">
                    {renderIcon(service.icon)}
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </>
              ) : (
                <div className="service-image-container">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="service-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="service-image-placeholder" style={{ display: 'none' }}>
                    <div className="placeholder-icon">
                      {service.title === 'Producción de Beats' ? '�️' : '�🎵'}
                    </div>
                    <p className="placeholder-text">Imagen: {service.title}</p>
                  </div>
                  <div className="service-image-overlay">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                  </div>
                </div>
              )}
            </GlassSurface>
          ))}
          <GlassSurface
              as="button"
              className="cta-button cta-card"
              aria-haspopup="dialog"
              onClick={handleReservaClick}
            >
              Reserva una Sesión
            </GlassSurface>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <div className="success-text">
              <h3>¡Reserva enviada correctamente!</h3>
              <p>Te contactaremos pronto para confirmar tu sesión de estudio.</p>
            </div>
            <button 
              className="success-close"
              onClick={() => setShowSuccessMessage(false)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de reserva */}
      <ReservaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReserva}
      />
    </section>
    <Footer />
    </>
  )
}

export default Estudios
