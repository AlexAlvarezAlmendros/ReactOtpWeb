import './Header.css'
import { NavLink } from 'react-router'

function Header ({ children }) {
  return (
    <header className='header'>
      <img
        src='/img/logoLowRes.webp'
        alt='Logo'
        className='logo'
      />
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/artistas">Artistas</NavLink>
      <NavLink to="/eventos">Eventos</NavLink>
      <NavLink to="/estudios">Estudios</NavLink>
      <NavLink to="/contacto">Contacto</NavLink>
      {children}
    </header>
  )
}

export default Header
