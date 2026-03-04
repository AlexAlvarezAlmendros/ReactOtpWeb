import './MobileNavPanel.css'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../../hooks/useAuth'
import LoginButton from '../Auth/LoginButton'
import LogoutButton from '../Auth/LogoutButton'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: ['fas', 'house'] },
  { to: '/artistas', label: 'Artistas', icon: ['fas', 'microphone'] },
  { to: '/eventos', label: 'Eventos', icon: ['fas', 'calendar'] },
  { to: '/discografia', label: 'Discografía', icon: ['fas', 'compact-disc'] },
  { to: '/beats', label: 'Beats', icon: ['fas', 'headphones'] },
  { to: '/estudios', label: 'Estudios', icon: ['fas', 'music'] },
  { to: '/contacto', label: 'Contacto', icon: ['fas', 'envelope'] },
]

const SOCIAL_LINKS = [
  { href: 'https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=ba612b6413ea40ad', icon: ['fab', 'spotify'], label: 'Spotify' },
  { href: 'https://www.instagram.com/otprecords/', icon: ['fab', 'instagram'], label: 'Instagram' },
  { href: 'https://www.youtube.com/@otherpeoplerecords', icon: ['fab', 'youtube'], label: 'YouTube' },
]

function MobileNavPanel ({ isOpen, onClose }) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className={`mobile-nav-panel ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>

      {/* Línea decorativa superior */}
      <div className="mobile-nav-accent-bar" />

      {/* Header */}
      <div className="mobile-nav-header">
        <img
          src="/img/otpLogo2.png"
          alt="Other People Records"
          className="mobile-nav-logo"
        />
        <button
          className="mobile-nav-close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <FontAwesomeIcon icon={['fas', 'times']} />
        </button>
      </div>

      {/* Enlaces principales */}
      <div className="mobile-nav-links">
        {NAV_ITEMS.map(({ to, label, icon }, i) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active' : ''}`
            }
            style={{ '--i': i }}
            end={to === '/'}
          >
            <span className="mobile-nav-link__icon">
              <FontAwesomeIcon icon={icon} />
            </span>
            <span className="mobile-nav-link__label">{label}</span>
            <FontAwesomeIcon className="mobile-nav-link__arrow" icon={['fas', 'chevron-right']} />
          </NavLink>
        ))}
      </div>

      {/* Footer: auth + redes */}
      <div className="mobile-nav-footer">
        <div className="mobile-nav-social">
          {SOCIAL_LINKS.map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-social__link"
              aria-label={label}
            >
              <FontAwesomeIcon icon={icon} />
            </a>
          ))}
        </div>

        <div className="mobile-nav-auth">
          {isLoading ? (
            <div className="mobile-auth-loading">Cargando...</div>
          ) : isAuthenticated ? (
            <LogoutButton />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>

    </nav>
  )
}

export default MobileNavPanel
