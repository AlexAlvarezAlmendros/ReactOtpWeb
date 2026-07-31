import './Header.css'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../../hooks/useAuth'
import LoginButton from '../Auth/LoginButton'
import LogoutButton from '../Auth/LogoutButton'
import MobileNavToggle from '../MobileNav/MobileNavToggle'
import { useMobileNavContext } from '../../contexts/MobileNavContext'
import GlassSurface from '../GlassSurface'

function Header ({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOpen, togglePanel } = useMobileNavContext()

  return (
    <GlassSurface as='header' className='header' borderRadius={20} backdropBlur={3}>
      <div className='header-content'>
        <NavLink to="/" className='logo-section' aria-label='Other People Records — inicio'>
          <img
            src='/img/otpLogo2.png'
            alt='Other People Records'
            className='logo'
          />
        </NavLink>
        
        <nav className='nav-links'>
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/artistas">Artistas</NavLink>
          <NavLink to="/eventos">Eventos</NavLink>
          <NavLink to="/discografia">Discografía</NavLink>
          <NavLink to="/beats">Beats</NavLink>
          <NavLink to="/estudios">Estudios</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
        
        <div className="auth-section">
          <NavLink
            to="/herramientas"
            className="tools-link"
            aria-label="Herramientas"
            title="Herramientas"
          >
            <FontAwesomeIcon icon={['fas', 'gear']} />
          </NavLink>

          {isLoading
            ? (
              <div className="auth-loading">Cargando...</div>
              )
            : isAuthenticated
              ? (
                <div className="auth-links">
                  <NavLink to="/perfil" className="profile-link">Mi Perfil</NavLink>
                  <LogoutButton />
                </div>
                )
              : (
                <LoginButton />
                )}
        </div>
        
        <MobileNavToggle isOpen={isOpen} onToggle={togglePanel} />
      </div>
      {children}
    </GlassSurface>
  )
}

export default Header
