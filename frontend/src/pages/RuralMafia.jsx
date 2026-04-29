import { useState } from 'react'
import { useContact } from '../hooks/useContact'
import { usePageMeta } from '../hooks/usePageMeta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Footer from '../components/Footer/Footer'
import './RuralMafia.css'

const FORM_SUBJECT = 'rural-mafia-invitation'

function RuralMafia () {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram: '',
    companionsCount: '0',
    companionsNames: '',
    reason: ''
  })

  const { sendMessage, loading, success, error, reset } = useContact()

  usePageMeta({
    title: 'Rural Mafia',
    description: 'Evento privado de Other People Records · Showcases y sesiones DJ',
    image: '/img/logoruralmafia.png'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error || success) reset()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = [
      'Solicitud de invitación · OTP! Rural Mafia',
      '',
      `Instagram: ${formData.instagram.trim() || '—'}`,
      `Acompañantes: ${formData.companionsCount || '0'}`,
      `Nombres acompañantes: ${formData.companionsNames.trim() || '—'}`,
      '',
      '¿Por qué quieres asistir?',
      formData.reason.trim() || '—'
    ].join('\n')

    try {
      await sendMessage({
        name: formData.name,
        email: formData.email,
        subject: FORM_SUBJECT,
        message
      })
      setFormData({
        name: '',
        email: '',
        instagram: '',
        companionsCount: '0',
        companionsNames: '',
        reason: ''
      })
    } catch {
      // El hook ya gestiona el toast/estado de error
    }
  }

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
            <a href="#solicitar" className="rm-hero__cta">
              Solicitar invitación
              <FontAwesomeIcon icon={['fas', 'arrow-right']} />
            </a>
          </div>
        </header>

        <article className="rm-block">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">El evento</span>
            <h2 className="rm-block__title">Una noche, una masía, una mafia.</h2>
          </div>
          <p className="rm-block__lead">
            <strong>OTP! Rural Mafia</strong> es una fiesta privada organizada por Other People
            Records. Una noche que reúne <em>showcases y sesiones DJ</em> de los artistas más
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
              </div>
            </div>
            <div className="rm-poster__divider" aria-hidden="true" />
            <div className="rm-poster__section">
              <span className="rm-poster__label">DJs:</span>
              <div className="rm-poster__acts">
                <span className="rm-poster__act">OGYBORY · EXTA6IX</span>
              </div>
            </div>
          </div>
        </article>

        <article className="rm-block">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Actividades & servicios</span>
            <h2 className="rm-block__title">Más que música.</h2>
          </div>
          <div className="rm-grid rm-grid--3">
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'shop']} className="rm-card__icon" />
              <h3>Pop-up stores</h3>
              <p>Marcas y proyectos afines con sus productos en el recinto.</p>
            </div>
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'palette']} className="rm-card__icon" />
              <h3>Arte urbano</h3>
              <p>Exposiciones de artistas locales repartidas por el espacio.</p>
            </div>
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'beer-mug-empty']} className="rm-card__icon" />
              <h3>Cerveza artesana</h3>
              <p>Barra principal con cerveza elaborada en la propia masía.</p>
            </div>
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'utensils']} className="rm-card__icon" />
              <h3>Gastronomía</h3>
              <p>Puesto de comida disponible durante un periodo limitado.</p>
            </div>
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'campground']} className="rm-card__icon" />
              <h3>Camping</h3>
              <p>Zona habilitada para quien quiera pasar la noche en el recinto.</p>
            </div>
            <div className="rm-card">
              <FontAwesomeIcon icon={['fas', 'martini-glass-citrus']} className="rm-card__icon" />
              <h3>Barra premium</h3>
              <p>Cubatas y combinados disponibles en horario limitado.</p>
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

        <article className="rm-block" id="solicitar">
          <div className="rm-block__head">
            <span className="rm-block__eyebrow">Solicitar invitación</span>
            <h2 className="rm-block__title">Cuéntanos quién eres.</h2>
          </div>
          <p className="rm-block__lead">
            Si tu perfil encaja con la línea del evento, te confirmaremos la invitación por email
            con todos los detalles de acceso.
          </p>

          <form className="rm-form" onSubmit={handleSubmit}>
            <div className="rm-form__row">
              <div className="rm-form__group">
                <label htmlFor="rm-name">Nombre completo *</label>
                <input
                  id="rm-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </div>
              <div className="rm-form__group">
                <label htmlFor="rm-email">Email *</label>
                <input
                  id="rm-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="rm-form__row">
              <div className="rm-form__group">
                <label htmlFor="rm-instagram">Instagram (opcional)</label>
                <input
                  id="rm-instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@usuario"
                />
              </div>
              <div className="rm-form__group">
                <label htmlFor="rm-companions">Nº de acompañantes</label>
                <input
                  id="rm-companions"
                  name="companionsCount"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.companionsCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="rm-form__group">
              <label htmlFor="rm-companions-names">Nombres de los acompañantes</label>
              <input
                id="rm-companions-names"
                name="companionsNames"
                value={formData.companionsNames}
                onChange={handleChange}
                placeholder="Ej. María García, Luis Martín"
              />
            </div>

            <div className="rm-form__group">
              <label htmlFor="rm-reason">¿Por qué quieres asistir? (opcional)</label>
              <textarea
                id="rm-reason"
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className={`rm-form__submit ${loading ? 'is-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>

            {success && (
              <div className="rm-form__status rm-form__status--success" role="status">
                <FontAwesomeIcon icon={['fas', 'check']} />
                Solicitud enviada. Te contactaremos pronto.
              </div>
            )}
            {error && (
              <div className="rm-form__status rm-form__status--error" role="alert">
                <FontAwesomeIcon icon={['fas', 'circle-exclamation']} />
                {error}
              </div>
            )}
          </form>
        </article>
      </section>
      <Footer />
    </>
  )
}

export default RuralMafia
