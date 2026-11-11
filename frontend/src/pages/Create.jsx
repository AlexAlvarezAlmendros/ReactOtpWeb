import { Fragment, useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../hooks/useAuth.js'
import { usePermissions } from '../hooks/usePermissions'
import ReleaseForm from '../components/Forms/ReleaseForm.jsx'
import ArtistForm from '../components/Forms/ArtistForm.jsx'
import EventForm from '../components/Forms/EventForm.jsx'
import BeatForm from '../components/Forms/BeatForm.jsx'
import NewsletterForm from '../components/Forms/NewsletterForm.jsx'
import ManageCards from '../components/ManageCards/ManageCards.jsx'
import QRGenerator from '../components/Tools/QRGenerator/QRGenerator.jsx'
import PostsManager from '../components/Admin/PostsManager.jsx'
import DemosManager from '../components/Admin/DemosManager.jsx'
import SpotifyDrafts from '../components/Admin/SpotifyDrafts.jsx'
import SpotifySyncSettings from '../components/Admin/SpotifySyncSettings.jsx'
import { useSpotifySyncApi } from '../components/Admin/useSpotifySyncApi'
import './Create.css'
import { usePageMeta } from '../hooks/usePageMeta'

const NAV = {
  create: [
    { type: 'release',    label: 'Release',    icon: 'compact-disc' },
    { type: 'artist',     label: 'Artista',    icon: 'user' },
    { type: 'event',      label: 'Evento',     icon: 'calendar' },
    { type: 'beat',       label: 'Beat',       icon: 'music' },
    { type: 'newsletter', label: 'Newsletter', icon: 'envelope' },
  ],
  manage: [
    { type: 'releases',     label: 'Releases',     icon: 'compact-disc' },
    { type: 'artists',      label: 'Artistas',     icon: 'users' },
    { type: 'events',       label: 'Eventos',      icon: 'calendar-alt' },
    { type: 'beats',        label: 'Beats',        icon: 'music' },
    { type: 'newsletters',  label: 'Newsletters',  icon: 'envelope-open' },
    { type: 'files',        label: 'Archivos',     icon: 'folder' },
    { type: 'posts',        label: 'Revista',      icon: 'newspaper' },
    { type: 'demos',        label: 'Maquetas',     icon: 'inbox' },
  ],
  // Solo administradores: la API de /spotify-sync exige admin:all.
  spotify: [
    { type: 'drafts', label: 'Borradores',     icon: 'list-check' },
    { type: 'sync',   label: 'Sincronización', icon: 'gear' },
  ],
  tools: [
    { type: 'qr-generator', label: 'Generador QR', icon: 'qrcode' },
  ],
}

const SECTIONS = [
  { key: 'create',  label: 'Crear nuevo' },
  { key: 'manage',  label: 'Gestionar' },
  { key: 'spotify', label: 'Spotify', adminOnly: true },
  { key: 'tools',   label: 'Herramientas' },
]

const ALL_ITEMS = SECTIONS.flatMap(section =>
  NAV[section.key].map(i => ({ ...i, key: `${section.key}:${i.type}` }))
)

function Create () {
  usePageMeta({ title: 'Panel de gestión', noindex: true })

  const { isAuthenticated } = useAuth()
  const { isAdmin } = usePermissions()
  const spotifyApi = useSpotifySyncApi()
  const [activeView, setActiveView] = useState('create:release')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [draftCount, setDraftCount] = useState(0)
  const [draftsArtistId, setDraftsArtistId] = useState('')

  // Contador de borradores pendientes para el menú.
  const refreshDraftCount = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return
    try {
      const body = await spotifyApi('/releases?status=draft&count=1')
      setDraftCount(body.pagination?.total || 0)
    } catch {
      // Sin contador no pasa nada: la cola se ve igual al entrar.
    }
  }, [isAuthenticated, isAdmin, spotifyApi])

  useEffect(() => { refreshDraftCount() }, [refreshDraftCount])

  if (!isAuthenticated) {
    return (
      <div className="dashboard__restricted">
        <FontAwesomeIcon icon={['fas', 'lock']} />
        <h2>Acceso restringido</h2>
        <p>Debes estar autenticado para acceder a esta página.</p>
      </div>
    )
  }

  const [section, type] = activeView.split(':')
  const activeItem = ALL_ITEMS.find(i => i.key === activeView)
  const activeSection = SECTIONS.find(s => s.key === section)

  const handleNavClick = (key) => {
    setActiveView(key)
    setSidebarOpen(false)
    setSuccessMessage('')
  }

  const handleSuccess = (msg) => {
    setSuccessMessage(msg || '¡Creado correctamente!')
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const openDrafts = (artistId = '') => {
    setDraftsArtistId(artistId)
    handleNavClick('spotify:drafts')
  }

  const renderContent = () => {
    if (section === 'create') {
      switch (type) {
        case 'release':    return <ReleaseForm onSuccess={handleSuccess} />
        case 'artist':     return <ArtistForm onSuccess={handleSuccess} />
        case 'event':      return <EventForm onSuccess={handleSuccess} />
        case 'beat':       return <BeatForm onSuccess={handleSuccess} />
        case 'newsletter': return <NewsletterForm onSuccess={handleSuccess} />
        default:           return null
      }
    }
    if (section === 'tools') {
      switch (type) {
        case 'qr-generator': return <QRGenerator />
        default:             return null
      }
    }
    if (section === 'spotify') {
      return type === 'drafts'
        ? <SpotifyDrafts artistId={draftsArtistId} onArtistChange={setDraftsArtistId} onChanged={refreshDraftCount} />
        : <SpotifySyncSettings onOpenDrafts={openDrafts} onChanged={refreshDraftCount} />
    }
    if (type === 'posts') return <PostsManager />
    if (type === 'demos') return <DemosManager />
    return <ManageCards activeTab={type} />
  }

  return (
    <div className="dashboard">
      {sidebarOpen && (
        <div className="dashboard__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`dashboard__sidebar ${sidebarOpen ? 'dashboard__sidebar--open' : ''}`}>
        <div className="dashboard__sidebar-brand">
          <FontAwesomeIcon icon={['fas', 'sliders']} />
          <span>Panel de control</span>
        </div>

        <nav className="dashboard__nav">
          {SECTIONS.filter(s => !s.adminOnly || isAdmin).map(group => (
            <Fragment key={group.key}>
              <p className="dashboard__nav-label">{group.label}</p>
              {NAV[group.key].map(item => {
                const key = `${group.key}:${item.type}`
                const badge = key === 'spotify:drafts' && draftCount > 0 ? draftCount : null
                return (
                  <button
                    key={key}
                    className={`dashboard__nav-item ${activeView === key ? 'dashboard__nav-item--active' : ''}`}
                    onClick={() => (key === 'spotify:drafts' ? openDrafts() : handleNavClick(key))}
                  >
                    <FontAwesomeIcon icon={['fas', item.icon]} />
                    {item.label}
                    {badge !== null && (
                      <span className="dashboard__nav-badge" aria-label={`${badge} pendientes`}>{badge > 99 ? '99+' : badge}</span>
                    )}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </nav>
      </aside>

      <main className="dashboard__main">
        <div className="dashboard__main-header">
          <button
            className="dashboard__mobile-toggle"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Abrir menú"
          >
            <FontAwesomeIcon icon={['fas', 'bars']} />
            {draftCount > 0 && isAdmin && <span className="dashboard__toggle-dot" aria-hidden="true" />}
          </button>

          <div className="dashboard__main-header-text">
            <span className="dashboard__breadcrumb">{activeSection?.label}</span>
            <h1 className="dashboard__main-title">
              {section === 'create' ? `Nuevo ${activeItem?.label}` : activeItem?.label}
            </h1>
          </div>

          {successMessage && (
            <div className="dashboard__success">
              <FontAwesomeIcon icon={['fas', 'check-circle']} />
              {successMessage}
            </div>
          )}
        </div>

        <div className="dashboard__content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default Create
