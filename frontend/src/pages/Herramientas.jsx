import { Link, useLocation } from 'react-router-dom'
import { useJsonLd } from '../hooks/useJsonLd'
import { TOOL_PAGES, findToolPage, toolPagePath } from '../data/toolPages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QRGenerator from '../components/Tools/QRGenerator/QRGenerator.jsx'
import AudioAnalyzer from '../components/Tools/AudioAnalyzer/AudioAnalyzer.jsx'
import { Cards } from '../components/CardList/CardList.jsx'
import LazyImage from '../components/LazyImage/LazyImage.jsx'
import { useReleases } from '../hooks/useReleases.js'
import { useBeats } from '../hooks/useBeats.js'
import Footer from '../components/Footer/Footer'
import { usePageMeta } from '../hooks/usePageMeta'
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
    description: 'Detección profesional de BPM y tonalidad (con notación Camelot), 100% local en tu dispositivo.',
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
  // /herramientas es el hub; /herramientas/<slug> es la página de cada herramienta.
  const { pathname } = useLocation()
  const slug = pathname.split('/')[2]
  const toolPage = slug ? findToolPage(slug) : null

  usePageMeta({
    title: toolPage ? toolPage.title : 'Herramientas gratis para productores: BPM, tonalidad y QR',
    description: toolPage
      ? toolPage.description
      : 'Herramientas gratuitas para productores: detecta el BPM y la tonalidad de cualquier canción desde el navegador y genera códigos QR para tus lanzamientos.',
    url: toolPage ? toolPagePath(toolPage) : '/herramientas'
  })

  useJsonLd(toolPage
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            name: `${toolPage.name} — Other People Records`,
            url: `https://www.otherpeople.es${toolPagePath(toolPage)}`,
            description: toolPage.description,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Cualquiera (navegador)',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            publisher: { '@id': 'https://www.otherpeople.es/#organization' }
          },
          {
            '@type': 'FAQPage',
            mainEntity: toolPage.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.otherpeople.es/' },
              { '@type': 'ListItem', position: 2, name: 'Herramientas', item: 'https://www.otherpeople.es/herramientas' },
              { '@type': 'ListItem', position: 3, name: toolPage.name, item: `https://www.otherpeople.es${toolPagePath(toolPage)}` }
            ]
          }
        ]
      }
    : null)

  const activeTool = toolPage ? toolPage.tool : 'audio-analyzer'
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
            <h1 className="tools-hero__title">{toolPage ? toolPage.h1 : 'Herramientas para productores'}</h1>
            <p className="tools-hero__sub">
              {toolPage
                ? toolPage.intro
                : 'Detector de BPM y tonalidad y generador de QR. Gratis, sin registro y sin subir tus archivos a ningún servidor.'}
            </p>
          </div>
        </header>

        <div className="tools-body">
          {/* ── Tool list sidebar ── */}
          <aside className="tools-sidebar">
            <p className="tools-sidebar__label">Disponibles</p>
            {/* Enlaces (no botones): cada herramienta tiene su propia URL. */}
            {TOOL_PAGES.map(page => {
              const tool = TOOLS.find(t => t.id === page.tool)
              const isActive = toolPage ? toolPage.slug === page.slug : page.slug === 'detector-bpm'
              return (
                <Link
                  key={page.slug}
                  to={toolPagePath(page)}
                  className={`tools-sidebar__item ${isActive ? 'tools-sidebar__item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="tools-sidebar__icon">
                    <FontAwesomeIcon icon={['fas', tool.icon]} />
                  </span>
                  <span className="tools-sidebar__info">
                    <span className="tools-sidebar__name">{page.name}</span>
                    <span className="tools-sidebar__desc">{tool.description}</span>
                  </span>
                </Link>
              )
            })}
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

        {/* ── Guía y preguntas de la herramienta ── */}
        {toolPage && (
          <section className="tools-guide">
            {toolPage.guide.map(block => (
              <div key={block.h2}>
                <h2>{block.h2}</h2>
                <p>{block.p}</p>
              </div>
            ))}
            <h2>Preguntas frecuentes</h2>
            {toolPage.faq.map(({ q, a }) => (
              <div key={q} className="tools-guide__faq">
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
            <p>
              ¿Produces? Prueba también nuestro <Link to="/plugins/opr-w1">plugin gratuito OPR-W1</Link> o mira los{' '}
              <Link to="/estudio/mezcla-y-mastering">servicios de mezcla y mastering</Link>.
            </p>
          </section>
        )}

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
