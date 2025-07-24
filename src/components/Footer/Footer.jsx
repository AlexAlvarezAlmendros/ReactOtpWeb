import './Footer.css'
import { NavLink } from 'react-router'

function Footer () {
  const year = new Date().getFullYear()
  
  return (
    <footer className='footer'>
      <div className='footer-content'>
        {/* Sección principal */}
        <div className='footer-main'>
          {/* Logo y descripción */}
          <div className='footer-brand'>
            <img
              src='/img/otpLogo2.png'
              alt='Other People Records Logo'
              className='footer-logo'
            />
            <h3>Other People Records</h3>
            <p>Discográfica independiente dedicada a impulsar el talento musical emergente. Desde Igualada, conectamos artistas con el mundo.</p>
          </div>

          {/* Enlaces rápidos */}
          <div className='footer-section'>
            <h4>Navegación</h4>
            <nav className='footer-nav'>
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/artistas">Artistas</NavLink>
              <NavLink to="/eventos">Eventos</NavLink>
              <NavLink to="/discografia">Discografía</NavLink>
              <NavLink to="/estudios">Estudios</NavLink>
              <NavLink to="/contacto">Contacto</NavLink>
            </nav>
          </div>

          {/* Servicios */}
          <div className='footer-section'>
            <h4>Servicios</h4>
            <ul className='footer-links'>
              <li>Grabación Profesional</li>
              <li>Mezcla y Mastering</li>
              <li>Producción de Beats</li>
              <li>Sesiones de Composición</li>
              <li>Booking de Artistas</li>
              <li>Distribución Digital</li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className='footer-section'>
            <h4>Contacto</h4>
            <div className='footer-contact'>
              <div className='contact-item'>
                <EmailIcon />
                <span>justsomeotherpeople@gmail.com</span>
              </div>
              <div className='contact-item'>
                <PhoneIcon />
                <span>+34 656 852 437</span>
              </div>
              <div className='contact-item'>
                <LocationIcon />
                <div className='address'>
                  <span>Av Europa, Carrer de Dinamarca, 35</span>
                  <span>08700 Igualada, Barcelona</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className='footer-social'>
          <h4>Síguenos</h4>
          <div className='social-links'>
            <a href='https://instagram.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='Instagram'>
              <InstagramIcon />
            </a>
            <a href='https://facebook.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='Facebook'>
              <FacebookIcon />
            </a>
            <a href='https://twitter.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='Twitter'>
              <TwitterIcon />
            </a>
            <a href='https://youtube.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='YouTube'>
              <YouTubeIcon />
            </a>
            <a href='https://soundcloud.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='SoundCloud'>
              <SoundCloudIcon />
            </a>
            <a href='https://spotify.com/otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='Spotify'>
              <SpotifyIcon />
            </a>
          </div>
        </div>

        {/* Copyright y enlaces legales */}
        <div className='footer-bottom'>
          <div className='footer-copyright'>
            <p>&copy; {year} Other People Records. Todos los derechos reservados.</p>
          </div>
          <div className='footer-legal'>
            <a href='/privacidad'>Política de Privacidad</a>
            <a href='/terminos'>Términos de Uso</a>
            <a href='/cookies'>Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Iconos SVG
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Email">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Teléfono">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Ubicación">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48"/>
  </svg>
)

const SoundCloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

const SpotifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

export default Footer
