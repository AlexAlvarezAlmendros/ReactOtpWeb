import './Hero.css'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useArtists } from '../../hooks/useArtists'
import { useEvents } from '../../hooks/useEvents'
import GlassSurface from '../GlassSurface'
import { eventPath } from '../../utils/paths'

/**
 * ¿Merece la pena cargar el vídeo? No con ahorro de datos, conexiones lentas
 * ni movimiento reducido: ahí se queda el póster, que ya es el LCP.
 */
function canPlayHeroVideo () {
  if (typeof window === 'undefined') return false
  const connection = navigator.connection
  if (connection?.saveData) return false
  if (/(^|-)2g$/.test(connection?.effectiveType || '')) return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

/** El vídeo entra cuando el navegador queda libre, sin competir con el LCP. */
function useDeferredHeroVideo () {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    if (!canPlayHeroVideo()) return
    const enable = () => setEnabled(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enable, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(enable, 1200)
    return () => window.clearTimeout(id)
  }, [])
  return enabled
}

export function Hero () {
  const videoEnabled = useDeferredHeroVideo()
  const [videoPlaying, setVideoPlaying] = useState(false)

  const { artists } = useArtists()
  const tags = artists.length > 0
    ? artists.map((a) => a.title.toUpperCase())
    : ['TRAP', 'RAP', 'DRILL', 'BOOKING', 'RELEASES', 'PRODUCCIÓN']

  const [nowIso] = useState(() => new Date().toISOString())

  const { events: upcomingEvents } = useEvents({
    dateMin: nowIso,
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
        {/* Póster: es el LCP, así que va como imagen ligera y con prioridad alta. */}
        <picture>
          <source
            type="image/avif"
            srcSet="/img/hero/portada1-828.avif 828w, /img/hero/portada1-1280.avif 1280w, /img/hero/portada1-1920.avif 1920w"
            sizes="100vw"
          />
          <img
            src="/img/hero/portada1-1280.webp"
            srcSet="/img/hero/portada1-828.webp 828w, /img/hero/portada1-1280.webp 1280w, /img/hero/portada1-1920.webp 1920w"
            sizes="100vw"
            width="1920"
            height="1080"
            alt=""
            fetchPriority="high"
            className='hero-video hero-poster'
          />
        </picture>
        {videoEnabled && (
          <video
            loop
            muted
            autoPlay
            playsInline
            preload="auto"
            aria-hidden="true"
            className={`hero-video hero-video--live${videoPlaying ? ' is-playing' : ''}`}
            onPlaying={() => setVideoPlaying(true)}
          >
            <source src="/video/hero1-720.webm" type="video/webm" />
            <source src="/video/hero1-720.mp4" type="video/mp4" />
          </video>
        )}
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
              href={nextEvent.externalTicketUrl || eventPath(nextEvent)}
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

        <img src="/img/logo-anim.webp" alt="Other People Records" width="220" height="220" className='hero-logo' />

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
            <GlassSurface
              as={NavLink}
              target="_blank"
              className='hero-cta hero-cta--primary'
              borderRadius={999}
              tint="rgba(255, 0, 60, 0.62)"
              to="https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=ba612b6413ea40ad"
            >
              <FontAwesomeIcon icon={['fab', 'spotify']} />
              <span>Escuchar ahora</span>
            </GlassSurface>
            <GlassSurface as={NavLink} className='hero-cta hero-cta--ghost' borderRadius={999} to="/contacto">
              <span>Booking</span>
              <FontAwesomeIcon icon={['fas', 'arrow-right']} />
            </GlassSurface>
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
    </section>
  )
}
