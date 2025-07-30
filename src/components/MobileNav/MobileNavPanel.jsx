import './MobileNavPanel.css'
import { NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import LoginButton from '../Auth/LoginButton'
import LogoutButton from '../Auth/LogoutButton'

/**
 * Panel de navegación móvil deslizante
 * @param {boolean} isOpen - Estado del panel
 * @param {function} onClose - Función para cerrar el panel
 */
function MobileNavPanel ({ isOpen, onClose }) {
  const { isAuthenticated, isLoading } = useAuth()

  const handleLinkClick = () => {
    // Cerrar el panel cuando se hace clic en un enlace
    onClose()
  }

  return (
    <nav className={`mobile-nav-panel ${isOpen ? 'open' : ''}`}>
      {/* Header del panel */}
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
          <span className="close-icon">×</span>
        </button>
      </div>

      {/* Enlaces de navegación */}
      <div className="mobile-nav-links">
        <NavLink 
          to="/" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Inicio
        </NavLink>
        <NavLink 
          to="/artistas" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Artistas
        </NavLink>
        <NavLink 
          to="/eventos" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Eventos
        </NavLink>
        <NavLink 
          to="/discografia" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Discografía
        </NavLink>
        <NavLink 
          to="/estudios" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Estudios
        </NavLink>
        <NavLink 
          to="/contacto" 
          onClick={handleLinkClick}
          className="mobile-nav-link"
        >
          Contacto
        </NavLink>
      </div>

      {/* Sección de autenticación */}
      <div className="mobile-nav-auth">
        {isLoading ? (
          <div className="mobile-auth-loading">Cargando...</div>
        ) : isAuthenticated ? (
          <LogoutButton />
        ) : (
          <LoginButton />
        )}
      </div>
    </nav>
  )
}

export default MobileNavPanel
