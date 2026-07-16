import { useEffect } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Footer from '../components/Footer/Footer'
import { IsoShop, IsoSpray, IsoBeer, IsoHam, IsoTent } from './RuralMafiaIcons'
import './RuralMafia.css'
import './ListingPage.css'

function RuralMafia () {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageMeta({
    title: 'Rural Mafia',
    description: 'Evento privado de Other People Records · Showcases y sesiones DJ',
    image: '/img/logoruralmafia.png'
  })

  return (
    <>
      <section className="rm-page">
        <header className="rm-hero">
          <div className="rm-hero__glow" aria-hidden="true" />
          <div className="rm-hero__inner">
            <span className="rm-hero__org">
              <span className="rm-hero__org-dot" /> Other People Records presenta
            </span>
            <img
              src="/img/logoruralmafia.png"
              alt="OTP! Rural Mafia"
              className="rm-hero__logo"
            />
            <p className="rm-hero__tagline">
              Showcases y sesiones DJ underground en un entorno rural.
            </p>
            <div className="rm-hero__meta">
              <div className="rm-hero__meta-item">
                <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                <span>16 May 2026</span>
              </div>
              <div className="rm-hero__meta-divider" aria-hidden="true" />
              <div className="rm-hero__meta-item">
                <FontAwesomeIcon icon={['fas', 'lock']} />
                <span>Sólo invitación</span>
              </div>
            </div>
          </div>
        </header>

        <article className="rm-block">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">El evento</span>
            <h2 className="rm-block__title">OTP! Rural Mafia</h2>
          </div>
          <p className="rm-block__lead">
            <strong>OTP! Rural Mafia</strong> es una fiesta privada organizada por Other People
            Records con la ayuda de FrameWorks. Una noche que reúne <em>showcases y sesiones DJ</em> de los artistas más
            relevantes del under, en un entorno rural único donde música,
            cultura y comunidad se cruzan.
          </p>
        </article>

        <article className="rm-block">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Programación</span>
            <h2 className="rm-block__title">Lo que sonará.</h2>
          </div>
          <div className="rm-poster">
            <div className="rm-poster__section">
              <span className="rm-poster__label">Showcases:</span>
              <div className="rm-poster__acts">
                <span className="rm-poster__act rm-poster__act--fit">STRESS KIDD + YNXEF + LILBRU</span>
                <span className="rm-poster__act rm-poster__act--inline">
                  DAMNCANDY · <span className="rm-poster__act-group-inline">
                    <span className="rm-poster__act-sub">notsoberfortheweekend</span>
                    BLACKFACE
                  </span>
                </span>
                <span className="rm-poster__act">PLUGBOY + VERN ALDER</span>
                <span className="rm-poster__act">LILJLAYY</span>
              </div>
            </div>
            <div className="rm-poster__divider" aria-hidden="true" />
            <div className="rm-poster__section">
              <span className="rm-poster__label">DJs:</span>
              <div className="rm-poster__acts">
                <span className="rm-poster__act">OGYBORY · EXTA6IX</span>
                <span className="rm-poster__act">SANTAMARIA</span>
              </div>
            </div>
            <div className="rm-poster__tba">+ Nombres por confirmar</div>
          </div>
        </article>

        <article className="rm-block">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Actividades & servicios</span>
            <h2 className="rm-block__title">Más que música.</h2>
          </div>
          <div className="rm-grid rm-grid--3">
            <div className="rm-card">
              <div className="rm-card__icon"><IsoShop /></div>
              <h3>Pop-up stores</h3>
              <p>Marcas y proyectos independientes con productos propios.</p>
            </div>
            <div className="rm-card">
              <div className="rm-card__icon"><IsoSpray /></div>
              <h3>Arte urbano</h3>
              <p>Exposiciones de artistas locales repartidas por el espacio.</p>
            </div>
            <div className="rm-card">
              <div className="rm-card__icon"><IsoBeer /></div>
              <h3>Cerveza artesana</h3>
              <p>Barra con cerveza artesana gracias a Ales Agullons.</p>
            </div>
            <div className="rm-card">
              <div className="rm-card__icon"><IsoHam /></div>
              <h3>Gastronomía</h3>
              <p>Puesto de comida disponible durante un periodo limitado.</p>
            </div>
            <div className="rm-card">
              <div className="rm-card__icon"><IsoTent /></div>
              <h3>Camping</h3>
              <p>Zona habilitada para quien quiera pasar la noche en el recinto.</p>
            </div>
          </div>
        </article>

        <article className="rm-block rm-block--accent">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Acceso</span>
            <h2 className="rm-block__title">Cómo entrar.</h2>
          </div>
          <ul className="rm-list">
            <li>
              <FontAwesomeIcon icon={['fas', 'envelope-open-text']} />
              <span>Acceso estrictamente privado, sólo con invitación confirmada.</span>
            </li>
            <li>
              <FontAwesomeIcon icon={['fas', 'user-group']} />
              <span>Cada invitado puede traer acompañantes registrándolos previamente.</span>
            </li>
            <li>
              <FontAwesomeIcon icon={['fas', 'list-check']} />
              <span>Los acompañantes deben comunicarse con antelación para control de aforo.</span>
            </li>
            <li>
              <FontAwesomeIcon icon={['fas', 'circle-exclamation']} />
              <span>Sin invitación o acompañante registrado, no se garantiza el acceso.</span>
            </li>
          </ul>
          <p className="rm-block__note">
            La ubicación exacta y los detalles de logística sólo se comparten con invitados
            confirmados.
          </p>
        </article>

        <article className="rm-block rm-colabs">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Colaboradores</span>
            <h2 className="rm-block__title">Con el apoyo de.</h2>
          </div>
          <div className="rm-colabs__grid">
            <div className="rm-colabs__item">
              <img src="/img/colabs/frameworksclub.png" alt="FrameWorks Club" />
            </div>
            <div className="rm-colabs__item">
              <img src="/img/colabs/logoagullons.svg" alt="Ales Agullons" />
            </div>
            <div className="rm-colabs__item">
              <img src="/img/colabs/logoinvertido.png" alt="Colaborador" />
            </div>
            <div className="rm-colabs__item">
              <img src="/img/colabs/estraperlologp.svg" alt="Estraperlologp" />
            </div>
          </div>
        </article>
      </section>
      <Footer />
    </>
  )
}

export default RuralMafia
