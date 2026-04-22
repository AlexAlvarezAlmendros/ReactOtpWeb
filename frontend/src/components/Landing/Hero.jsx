import './Hero.css'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useArtists } from '../../hooks/useArtists'
import { useEvents } from '../../hooks/useEvents'

export function Hero () {
  const { artists } = useArtists()
  const tags = artists.length > 0
    ? artists.map((a) => a.title.toUpperCase())
    : ['TRAP', 'RAP', 'DRILL', 'BOOKING', 'RELEASES', 'PRODUCCIÓN']

  const { events: upcomingEvents } = useEvents({
    dateMin: new Date().toISOString(),
    count: 1,
    sortBy: 'date',
    sortOrder: 'asc'
  })
  const nextEvent = upcomingEvents[0] ?? null

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
  }

  return (
    <section className='hero-section'>
      <div className='hero-video-container'>
        <video
          loop
          muted
          autoPlay
          playsInline
          poster="/img/hero/portada1.png"
          className='hero-video'
        >
          <source src="/video/hero1.mp4" type="video/mp4" />
        </video>
        <div className='hero-overlay'></div>
        <div className='hero-vignette'></div>
        <div className='hero-grid'></div>
      </div>

      <aside className='hero-side hero-side--left' aria-hidden="true">
        <span className='hero-side__text'>EST · 2020</span>
      </aside>
      <aside className='hero-side hero-side--right' aria-hidden="true">
        <span className='hero-side__text'>OTHER · PEOPLE · RECORDS</span>
      </aside>

      <div className='hero-content'>
        {nextEvent
          ? (
            <a
              className='hero-badge'
              href={nextEvent.externalTicketUrl || `/eventos/${nextEvent.id}`}
              target={nextEvent.externalTicketUrl ? '_blank' : undefined}
              rel={nextEvent.externalTicketUrl ? 'noopener noreferrer' : undefined}
            >
              <span className='hero-badge__dot'></span>
              <span className='hero-badge__text'>PRÓXIMO EVENTO · {nextEvent.title} · {formatEventDate(nextEvent.date)}</span>
            </a>
          )
          : (
            <></>
          )}

        <img src="/img/logo.gif" alt="Other People Records" className='hero-logo' />

        <div className='hero-text'>
          <h1 className='hero-title'>
            <span className='hero-title__line'>OTHER PEOPLE</span>
            <span className='hero-title__line hero-title__line--accent'>RECORDS</span>
          </h1>
          <div className='hero-divider' aria-hidden="true"></div>
          <p className='hero-subtitle'>
            Sello independiente · Producción · Distribución · Booking
          </p>

          <div className='hero-buttons'>
            <NavLink
              target="_blank"
              className='hero-cta hero-cta--primary'
              to="https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=ba612b6413ea40ad"
            >
              <FontAwesomeIcon icon={['fab', 'spotify']} />
              <span>Escuchar ahora</span>
            </NavLink>
            <NavLink className='hero-cta hero-cta--ghost' to="/contacto">
              <span>Booking</span>
              <FontAwesomeIcon icon={['fas', 'arrow-right']} />
            </NavLink>
          </div>
        </div>
      </div>

      <div className='hero-marquee' aria-hidden="true">
        <div className='hero-marquee__track'>
          {[...tags, ...tags, ...tags].map((tag, idx) => (
            <span key={idx} className='hero-marquee__item'>
              <span className='hero-marquee__dot'></span>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <a href="#contenido" className='hero-scroll' aria-label="Desplazar hacia abajo">
        <span className='hero-scroll__text'>SCROLL</span>
        <span className='hero-scroll__line'></span>
      </a>
    </section>
  )
}
