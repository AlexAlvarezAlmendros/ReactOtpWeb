import { useState } from 'react'
import { NavLink } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNewsletter } from '../../hooks/useNewsletter'
import './Footer.css'

function Footer () {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const { subscribe, loading } = useNewsletter()

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const result = await subscribe(email, 'footer')
    if (result?.success) setEmail('')
  }

  return (
    <footer className="footer">
      {/* Animated red orbs */}
      <div className="footer-orb footer-orb--1" aria-hidden="true" />
      <div className="footer-orb footer-orb--2" aria-hidden="true" />
      <div className="footer-orb footer-orb--3" aria-hidden="true" />

      <div className="footer-content">
        {/* Brand block */}
        <div className="footer-brand">
          <img
            src="/img/otpLogo2.png"
            alt="Other People Records"
            className="footer-brand__logo"
          />
          <h2 className="footer-brand__name">Other People Records</h2>
          <div className="footer-brand__accent" />
          <p className="footer-brand__desc">
            Discográfica independiente desde Igualada. Conectamos talento musical emergente con el mundo.
          </p>
        </div>

        {/* Newsletter — featured glass card */}
        <section className="footer-newsletter glass">
          <div className="footer-newsletter__head">
            <span className="footer-newsletter__tag">Newsletter</span>
            <h3 className="footer-newsletter__title">No te pierdas nada</h3>
            <p className="footer-newsletter__sub">
              Drops, eventos y noticias del sello directamente en tu inbox.
            </p>
          </div>
          <form className="footer-newsletter__form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className="footer-newsletter__input"
              aria-label="Email"
            />
            <button
              type="submit"
              disabled={loading}
              className="footer-newsletter__btn"
            >
              {loading ? 'Enviando…' : (
                <>
                  Suscribirse <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                </>
              )}
            </button>
          </form>
        </section>

        {/* 4-column glass grid */}
        <div className="footer-grid">
          <div className="footer-card glass">
            <h4 className="footer-card__title">Explorar</h4>
            <nav className="footer-card__nav">
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/artistas">Artistas</NavLink>
              <NavLink to="/eventos">Eventos</NavLink>
              <NavLink to="/discografia">Discografía</NavLink>
              <NavLink to="/beats">Beats</NavLink>
              <NavLink to="/newsletters">Newsletters</NavLink>
              <NavLink to="/estudios">Estudios</NavLink>
              <NavLink to="/herramientas">Herramientas</NavLink>
            </nav>
          </div>

          <div className="footer-card glass">
            <h4 className="footer-card__title">Servicios</h4>
            <ul className="footer-card__list">
              <li>Grabación profesional</li>
              <li>Mezcla y mastering</li>
              <li>Producción de beats</li>
              <li>Sesiones de composición</li>
              <li>Booking de artistas</li>
              <li>Distribución digital</li>
            </ul>
          </div>

          <div className="footer-card glass">
            <h4 className="footer-card__title">Contacto</h4>
            <div className="footer-card__contact">
              <a href="mailto:justsomeotherpeople@gmail.com" className="footer-contact__line">
                <span className="footer-contact__icon">
                  <FontAwesomeIcon icon={['fas', 'envelope']} />
                </span>
                <span>justsomeotherpeople@gmail.com</span>
              </a>
              <a href="tel:+34625029056" className="footer-contact__line">
                <span className="footer-contact__icon">
                  <FontAwesomeIcon icon={['fas', 'paper-plane']} />
                </span>
                <span>+34 625 02 90 56</span>
              </a>
              <NavLink to="/contacto" className="footer-contact__cta">
                Formulario <FontAwesomeIcon icon={['fas', 'arrow-right']} />
              </NavLink>
            </div>
          </div>

          <div className="footer-card glass">
            <h4 className="footer-card__title">Síguenos</h4>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/otherpeople.records/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social__link"
              >
                <FontAwesomeIcon icon={['fab', 'instagram']} />
              </a>
              <a
                href="https://www.threads.com/@otherpeople.records"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                className="footer-social__link"
              >
                <ThreadsIcon />
              </a>
              <a
                href="https://www.youtube.com/@otherpeoplerecords"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="footer-social__link"
              >
                <FontAwesomeIcon icon={['fab', 'youtube']} />
              </a>
              <a
                href="https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=be554054525c4510"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Spotify"
                className="footer-social__link"
              >
                <FontAwesomeIcon icon={['fab', 'spotify']} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="footer-bottom">
          <span className="footer-bottom__item">© {year} Other People Records</span>
          <span className="footer-bottom__item footer-bottom__author">
            Diseño + código por{' '}
            <a href="https://alexalvarez.dev" target="_blank" rel="noopener noreferrer">
              alexalvarez.dev
            </a>
          </span>
          <div className="footer-legal">
            <NavLink to="/privacidad">Privacidad</NavLink>
            <span className="footer-legal__sep">·</span>
            <NavLink to="/terminos">Términos</NavLink>
            <span className="footer-legal__sep">·</span>
            <NavLink to="/cookies">Cookies</NavLink>
          </div>
        </div>
      </div>
    </footer>
  )
}

const ThreadsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true">
    <path d="M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z"/>
  </svg>
)

export default Footer
