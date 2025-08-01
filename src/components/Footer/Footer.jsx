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
            <a href='https://www.instagram.com/otherpeople.records/' target='_blank' rel='noopener noreferrer' aria-label='Instagram'>
              <InstagramIcon />
            </a>
            <a href='https://www.threads.com/@otherpeople.records' target='_blank' rel='noopener noreferrer' aria-label='Threads'>
              <ThreadsIcon />
            </a>
            <a href='https://www.youtube.com/@otherpeoplerecords' target='_blank' rel='noopener noreferrer' aria-label='YouTube'>
              <YouTubeIcon />
            </a>
            <a href='https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=be554054525c4510' target='_blank' rel='noopener noreferrer' aria-label='Spotify'>
              <SpotifyIcon />
            </a>
          </div>
        </div>

        {/* Copyright y enlaces legales */}
        <div className='footer-bottom'>
          <div className='footer-copyright'>
            <p>&copy; {year} Other People Records. Todos los derechos reservados.</p>
          </div>
          <div className='footer-copyright'>
            <p>Diseñado y programado por <a href='https://github.com/AlexAlvarezAlmendros' target='_blank' rel='noopener noreferrer'>Alex Alvarez Almendros</a></p>
          </div>
          <div className='footer-legal'>
            <NavLink to='/privacidad'>Política de Privacidad</NavLink>
            <NavLink to='/terminos'>Términos de Uso</NavLink>
            <NavLink to='/cookies'>Política de Cookies</NavLink>
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

const ThreadsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 640 640" fill="currentColor">
    <path d="M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z"/>
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
