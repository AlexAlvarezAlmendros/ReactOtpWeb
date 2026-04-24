import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../hooks/useAuth.js'
import ReleaseForm from '../components/Forms/ReleaseForm.jsx'
import ArtistForm from '../components/Forms/ArtistForm.jsx'
import EventForm from '../components/Forms/EventForm.jsx'
import BeatForm from '../components/Forms/BeatForm.jsx'
import NewsletterForm from '../components/Forms/NewsletterForm.jsx'
import ManageCards from '../components/ManageCards/ManageCards.jsx'
import QRGenerator from '../components/Tools/QRGenerator/QRGenerator.jsx'
import './Create.css'

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
  ],
  tools: [
    { type: 'qr-generator', label: 'Generador QR', icon: 'qrcode' },
  ],
}

const ALL_ITEMS = [
  ...NAV.create.map(i => ({ ...i, key: `create:${i.type}` })),
  ...NAV.manage.map(i => ({ ...i, key: `manage:${i.type}` })),
  ...NAV.tools.map(i => ({ ...i, key: `tools:${i.type}` })),
]

function Create () {
  const { isAuthenticated } = useAuth()
  const [activeView, setActiveView] = useState('create:release')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleNavClick = (key) => {
    setActiveView(key)
    setSidebarOpen(false)
    setSuccessMessage('')
  }

  const handleSuccess = (msg) => {
    setSuccessMessage(msg || '¡Creado correctamente!')
    setTimeout(() => setSuccessMessage(''), 4000)
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
          <p className="dashboard__nav-label">Crear nuevo</p>
          {NAV.create.map(item => {
            const key = `create:${item.type}`
            return (
              <button
                key={key}
                className={`dashboard__nav-item ${activeView === key ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => handleNavClick(key)}
              >
                <FontAwesomeIcon icon={['fas', item.icon]} />
                {item.label}
              </button>
            )
          })}

          <p className="dashboard__nav-label">Gestionar</p>
          {NAV.manage.map(item => {
            const key = `manage:${item.type}`
            return (
              <button
                key={key}
                className={`dashboard__nav-item ${activeView === key ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => handleNavClick(key)}
              >
                <FontAwesomeIcon icon={['fas', item.icon]} />
                {item.label}
              </button>
            )
          })}

          <p className="dashboard__nav-label">Herramientas</p>
          {NAV.tools.map(item => {
            const key = `tools:${item.type}`
            return (
              <button
                key={key}
                className={`dashboard__nav-item ${activeView === key ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => handleNavClick(key)}
              >
                <FontAwesomeIcon icon={['fas', item.icon]} />
                {item.label}
              </button>
            )
          })}
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
          </button>

          <div className="dashboard__main-header-text">
            <span className="dashboard__breadcrumb">
              {section === 'create' ? 'Crear nuevo' : section === 'tools' ? 'Herramientas' : 'Gestionar'}
            </span>
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
