import './Header.css'

function Header ({ children }) {
  return (
    <header className='header'>
      <img
        src='/img/logoLowRes.webp'
        alt='Logo'
        className='logo'
      />
      <button>Inicio</button>
      <button>Artistas</button>
      <button>Eventos</button>
      <button>Estudios</button>
      <button>Contacto</button>
      {children}
    </header>
  )
}

export default Header
