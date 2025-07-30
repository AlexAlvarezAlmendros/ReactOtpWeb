import './Header.css'
import { NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import LoginButton from '../Auth/LoginButton'
import LogoutButton from '../Auth/LogoutButton'
import MobileNav from '../MobileNav/MobileNav'

function Header ({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <header className='header'>
      <div className='header-content'>
        <div className='logo-section'>
          <img
            src='/img/otpLogo2.png'
            alt='Logo'
            className='logo'
          />
        </div>
        
        <nav className='nav-links'>
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/artistas">Artistas</NavLink>
          <NavLink to="/eventos">Eventos</NavLink>
          <NavLink to="/discografia">Discografía</NavLink>
          <NavLink to="/estudios">Estudios</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
        
        <div className="auth-section">
          {isLoading
            ? (
              <div className="auth-loading">Cargando...</div>
              )
            : isAuthenticated
              ? (
                <LogoutButton />
                )
              : (
                <LoginButton />
                )}
        </div>
        <MobileNav />
      </div>
      {children}
    </header>
  )
}

export default Header
