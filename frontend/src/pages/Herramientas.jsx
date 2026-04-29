import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QRGenerator from '../components/Tools/QRGenerator/QRGenerator.jsx'
import AudioAnalyzer from '../components/Tools/AudioAnalyzer/AudioAnalyzer.jsx'
import { Cards } from '../components/CardList/CardList.jsx'
import LazyImage from '../components/LazyImage/LazyImage.jsx'
import { useReleases } from '../hooks/useReleases.js'
import { useBeats } from '../hooks/useBeats.js'
import Footer from '../components/Footer/Footer'
import './Herramientas.css'

const TOOLS = [
  {
    id: 'qr-generator',
    label: 'Generador QR',
    description: 'Crea códigos QR para URLs, textos o contactos con colores y tamaño personalizados.',
    icon: 'qrcode',
    component: QRGenerator,
  },
  {
    id: 'audio-analyzer',
    label: 'Detector BPM / Tono',
    description: 'Analiza el BPM y la tonalidad de cualquier canción directamente desde tu dispositivo.',
    icon: 'gauge-high',
    component: AudioAnalyzer,
  },
]

const STREAM_LINKS = [
  { key: 'spotifyLink',    icon: ['fab', 'spotify'],   label: 'Spotify'      },
  { key: 'youtubeLink',    icon: ['fab', 'youtube'],   label: 'YouTube'      },
  { key: 'appleMusicLink', icon: ['fab', 'apple'],     label: 'Apple Music'  },
  { key: 'soundCloudLink', icon: ['fab', 'soundcloud'],label: 'SoundCloud'   },
  { key: 'instagramLink',  icon: ['fab', 'instagram'], label: 'Instagram'    },
]

function ReleasePromo ({ release }) {
  if (!release) return null
  const links = STREAM_LINKS.filter(l => release[l.key])

  return (
    <div className="tools-release">
      <p className="tools-release__label">
        <FontAwesomeIcon icon={['fas', 'compact-disc']} />
        Último lanzamiento
      </p>

      <div className="tools-release__cover">
        <LazyImage src={release.img} alt={release.title} />
      </div>

      <div className="tools-release__info">
        <span className="tools-release__new">NUEVO</span>
        <h3 className="tools-release__title">{release.title}</h3>
        {release.subtitle && <p className="tools-release__sub">{release.subtitle}</p>}
      </div>

      {links.length > 0 && (
        <div className="tools-release__links">
          {links.map(l => (
            <a
              key={l.key}
              href={release[l.key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={l.label}
              className="tools-release__link"
            >
              <FontAwesomeIcon icon={l.icon} />
            </a>
          ))}
        </div>
      )}

      <Link to="/discografia" className="tools-release__cta">
        Ver discografía
        <FontAwesomeIcon icon={['fas', 'arrow-right']} />
      </Link>
    </div>
  )
}

function Herramientas () {
  const [activeTool, setActiveTool] = useState(TOOLS[0].id)
  const { releases, loading: relLoading } = useReleases({ count: 1, sortBy: 'date', sortOrder: 'desc' })
  const { beats,    loading: bLoading   } = useBeats({    count: 3, sortBy: 'createdAt', sortOrder: 'desc' })

  const active          = TOOLS.find(t => t.id === activeTool)
  const ActiveComponent = active?.component
  const latestRelease   = releases?.[0] ?? null

  return (
    <>
      <div className="tools-page">
        <header className="tools-hero">
          <div className="tools-hero__inner">
            <span className="tools-hero__eyebrow">Other People Records</span>
            <h1 className="tools-hero__title">Herramientas</h1>
            <p className="tools-hero__sub">Utilidades gratuitas para tus proyectos</p>
          </div>
        </header>

        <div className="tools-body">
          {/* ── Tool list sidebar ── */}
          <aside className="tools-sidebar">
            <p className="tools-sidebar__label">Disponibles</p>
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                className={`tools-sidebar__item ${activeTool === tool.id ? 'tools-sidebar__item--active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <span className="tools-sidebar__icon">
                  <FontAwesomeIcon icon={['fas', tool.icon]} />
                </span>
                <span className="tools-sidebar__info">
                  <span className="tools-sidebar__name">{tool.label}</span>
                  <span className="tools-sidebar__desc">{tool.description}</span>
                </span>
              </button>
            ))}
          </aside>

          {/* ── Active tool ── */}
          <main className="tools-content">
            <div className="tools-content__header">
              <FontAwesomeIcon icon={['fas', active.icon]} className="tools-content__icon" />
              <div>
                <h2 className="tools-content__title">{active.label}</h2>
                <p className="tools-content__desc">{active.description}</p>
              </div>
            </div>
            <div className="tools-content__body">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </main>

          {/* ── Latest release promo ── */}
          {!relLoading && <ReleasePromo release={latestRelease} />}
        </div>

        {/* ── Latest beats promo ── */}
        <div className="tools-beats">
          <div className="tools-beats__header">
            <span className="tools-beats__label">
              <FontAwesomeIcon icon={['fas', 'music']} />
              Últimos Beats
            </span>
            <Link to="/beats" className="tools-beats__cta">
              Ver todos <FontAwesomeIcon icon={['fas', 'arrow-right']} />
            </Link>
          </div>
          <div className="tools-beats__grid">
            <Cards cards={beats} type="beat" loading={bLoading} skeletonCount={3} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Herramientas
