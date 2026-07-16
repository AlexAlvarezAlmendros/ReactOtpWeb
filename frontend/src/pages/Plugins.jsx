import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'motion/react'
import GlassSurface from '../components/GlassSurface'
import Footer from '../components/Footer/Footer'
import { useTilt } from '../hooks/useTilt'
import { usePageMeta } from '../hooks/usePageMeta'
import { PLUGINS } from '../data/plugins'
import './Plugins.css'

function DownloadMenu ({ plugin }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown (event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown (event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="plugin-dl" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        className="plugin-btn plugin-btn--primary"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <FontAwesomeIcon icon={['fas', 'download']} />
        <span>Descargar</span>
        <FontAwesomeIcon
          icon={['fas', 'chevron-down']}
          className={`plugin-dl__chevron ${open ? 'plugin-dl__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <div className="plugin-dl__menu">
          {plugin.downloads.map(download => (
            download.available
              ? (
                <a
                  key={download.platform}
                  className="plugin-dl__item"
                  href={download.url}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={download.icon} />
                  <span>{download.platform}</span>
                </a>
                )
              : (
                <span
                  key={download.platform}
                  className="plugin-dl__item plugin-dl__item--disabled"
                >
                  <FontAwesomeIcon icon={download.icon} />
                  <span>{download.platform}</span>
                  <span className="plugin-dl__soon">{download.note}</span>
                </span>
                )
          ))}
        </div>
      )}
    </div>
  )
}

function PluginShowcase ({ plugin }) {
  const tilt = useTilt({ rotateAmplitude: 8, scaleOnHover: 1.03 })

  return (
    <GlassSurface as="article" className="plugin-showcase">
      <motion.div className="plugin-showcase__preview" {...tilt}>
        <img src={plugin.image} alt={`Interfaz de ${plugin.name}`} loading="lazy" />
      </motion.div>

      <div className="plugin-showcase__info">
        <div className="plugin-showcase__meta">
          <span className="plugin-chip plugin-chip--red">{plugin.version}</span>
          <span className="plugin-chip">{plugin.formats}</span>
          <span className="plugin-chip">{plugin.license}</span>
        </div>

        <h2 className="plugin-showcase__name">{plugin.name}</h2>
        <p className="plugin-showcase__tagline">{plugin.tagline}</p>
        <p className="plugin-showcase__desc">{plugin.description}</p>

        <div className="plugin-showcase__actions">
          <DownloadMenu plugin={plugin} />
          <Link to={plugin.detailPath} className="plugin-btn plugin-btn--ghost">
            <FontAwesomeIcon icon={['fas', 'info-circle']} />
            <span>Información</span>
          </Link>
        </div>

        <p className="plugin-showcase__platforms">
          Windows y Linux · macOS próximamente
        </p>
      </div>
    </GlassSurface>
  )
}

function Plugins () {
  usePageMeta({
    title: 'Plugins',
    description: 'Plugins de audio VST3/AU de Other People Records: gratuitos y de código abierto.'
  })

  return (
    <>
      <div className="plugins-page">
        <header className="plugins-hero">
          <div className="plugins-hero__inner">
            <span className="plugins-hero__eyebrow">Other People Records</span>
            <h1 className="plugins-hero__title">Plugins</h1>
            <p className="plugins-hero__sub">Efectos de audio VST3/AU, gratuitos y de código abierto</p>
          </div>
        </header>

        <div className="plugins-list">
          {PLUGINS.map(plugin => (
            <PluginShowcase key={plugin.id} plugin={plugin} />
          ))}

          <p className="plugins-more">Más plugins en camino.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Plugins
