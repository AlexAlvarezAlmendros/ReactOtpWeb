import './Estudios.css'

function Estudios () {
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

  return (
    <section className="estudios-section">
      <div className="estudios-container">
        {/* Encabezado de sección */}
        <header className="estudios-header">
          <h1 className="estudios-title">SERVICIOS DE<br />ESTUDIO</h1>
          <div className="estudios-underline"></div>
        </header>

        {/* Grid de servicios */}
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className={`service-card ${service.type}`}>
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
            </div>
          ))}
          <button 
              className="cta-button cta-card"
              role="button"
              aria-haspopup="dialog"
              onClick={() => alert('Funcionalidad de reserva próximamente')}
            >
              Reserva una Sesión
            </button>
        </div>
      </div>
    </section>
  )
}

export default Estudios
