import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SeoPage from '../components/SeoPage/SeoPage'
import { SeoFeatures, SeoProse, SeoSection, SeoSteps } from '../components/SeoPage/SeoBlocks'
import GlassSurface from '../components/GlassSurface'
import { trackEvent } from '../utils/analytics'

const API_URL = import.meta.env.VITE_API_URL

const FAQ = [
  {
    q: '¿Qué tengo que mandar?',
    a: 'Dos o tres temas terminados o casi terminados, con un enlace donde se puedan escuchar sin descargar nada: Spotify, SoundCloud, YouTube o una carpeta de Drive. No hace falta dossier ni nota de prensa.'
  },
  {
    q: '¿Aceptáis maquetas de toda España?',
    a: 'Sí. El estudio está en la Masia Agullons (Sant Joan de Mediona, Barcelona), pero la firma, la distribución, la promoción y el booking se pueden llevar a distancia. Escuchamos música de cualquier ciudad.'
  },
  {
    q: '¿Qué estilos escucháis?',
    a: 'Sobre todo música urbana: trap, rap, drill, R&B, reggaetón, hoodtrap y jerk. Si tu proyecto se sale un poco de ahí pero crees que encaja con lo que hacemos, mándalo igualmente.'
  },
  {
    q: '¿Cuánto tardáis en responder?',
    a: 'Escuchamos todo lo que llega, pero no siempre al momento. Si nos interesa, te escribimos nosotros al correo que nos dejes. Si no encaja ahora, no es un no para siempre: vuelve a mandarnos música cuando tengas temas nuevos.'
  },
  {
    q: '¿Tengo que pagar algo?',
    a: 'No. Enviar una maqueta es gratis y firmar con un sello no se paga. Desconfía de cualquier discográfica que te pida dinero por escucharte o por firmar.'
  }
]

const EMPTY = { artistName: '', realName: '', email: '', city: '', genres: '', link1: '', link2: '', link3: '', instagram: '', message: '', consent: false, website: '' }

function EnviarMaqueta () {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState(null)

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const links = [form.link1, form.link2, form.link3].map(l => l.trim()).filter(Boolean)
    if (!links.length) {
      setError('Añade al menos un enlace a tu música.')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(`${API_URL}/demos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: form.artistName,
          realName: form.realName,
          email: form.email,
          city: form.city,
          genres: form.genres,
          links,
          instagram: form.instagram,
          message: form.message,
          consent: form.consent,
          website: form.website
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body.details?.join('. ') || body.message || 'No hemos podido enviar tu maqueta.')
      }
      setStatus('sent')
      setForm(EMPTY)
      trackEvent('maqueta-enviada', { genres: form.genres.slice(0, 60) || 'sin-genero' })
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <SeoPage
      path="/enviar-maqueta"
      title="Enviar maqueta a una discográfica de trap y música urbana"
      description="Envía tu maqueta a Other People Records, sello independiente de trap, rap, drill y música urbana. Escuchamos todo lo que llega, de toda España, y es gratis."
      eyebrow="Maquetas"
      h1="Envía tu maqueta"
      lead="Somos un sello independiente de trap y música urbana y buscamos artistas nuevos con música propia e identidad clara. Rellena el formulario con dos o tres temas y los escuchamos. Es gratis y no hace falta tener números."
      crumbs={[{ label: 'Discográfica', to: '/discografica' }, { label: 'Enviar maqueta' }]}
      actions={[{ label: 'Ir al formulario', href: '#formulario', icon: 'arrow-right' }]}
      faq={FAQ}
    >
      <SeoSection title="Qué buscamos">
        <SeoFeatures
          items={[
            { icon: 'compact-disc', title: 'Música terminada', text: 'Mejor tres temas que digan algo que diez bocetos.' },
            { icon: 'microphone', title: 'Identidad', text: 'Que se te reconozca: tu forma de escribir, tu voz, tu estética.' },
            { icon: 'user-group', title: 'Ganas de trabajar en equipo', text: 'Un sello es un proyecto a medio plazo, no un single suelto.' }
          ]}
        />
        <SeoProse>
          <p>
            No miramos los seguidores antes que la música. Si quieres saber cómo trabajamos con los artistas que
            firmamos, lo contamos en <Link to="/nuevos-talentos">nuevos talentos</Link> y en{' '}
            <Link to="/discografica">qué hace el sello</Link>.
          </p>
        </SeoProse>
      </SeoSection>

      <SeoSection
        id="formulario"
        title="Mándanos tu música"
        intro="Con el nombre, un email y un enlace es suficiente. El resto nos ayuda a escucharte con contexto."
      >
        {status === 'sent'
          ? (
            <div className="seo-form__success" role="status">
              <h3>¡Maqueta recibida!</h3>
              <p>Te hemos mandado un correo de confirmación. Si encaja con lo que buscamos, te escribiremos nosotros.</p>
              <p>Mientras tanto, escucha lo que hemos publicado en la <Link to="/discografia">discografía</Link>.</p>
            </div>
            )
          : (
            <GlassSurface as="form" className="seo-form" onSubmit={onSubmit} noValidate={false}>
              <div className="seo-form__row">
                <Field label="Nombre artístico" required>
                  <input name="artistName" value={form.artistName} onChange={onChange} required maxLength={100} autoComplete="nickname" placeholder="Cómo firmas tus temas" />
                </Field>
                <Field label="Email" required>
                  <input type="email" name="email" value={form.email} onChange={onChange} required maxLength={120} autoComplete="email" placeholder="tu@email.com" />
                </Field>
              </div>
              <div className="seo-form__row">
                <Field label="Ciudad">
                  <input name="city" value={form.city} onChange={onChange} maxLength={100} placeholder="Barcelona, Madrid, Valencia…" />
                </Field>
                <Field label="Estilos">
                  <input name="genres" value={form.genres} onChange={onChange} maxLength={120} placeholder="trap, drill, R&B…" />
                </Field>
              </div>
              <Field label="Enlace a tu música" required>
                <input type="url" name="link1" value={form.link1} onChange={onChange} required placeholder="https://open.spotify.com/… o SoundCloud, YouTube, Drive" />
              </Field>
              <div className="seo-form__row">
                <Field label="Otro enlace">
                  <input type="url" name="link2" value={form.link2} onChange={onChange} placeholder="https://…" />
                </Field>
                <Field label="Otro enlace">
                  <input type="url" name="link3" value={form.link3} onChange={onChange} placeholder="https://…" />
                </Field>
              </div>
              <div className="seo-form__row">
                <Field label="Instagram">
                  <input name="instagram" value={form.instagram} onChange={onChange} maxLength={200} placeholder="@tuusuario" />
                </Field>
                <Field label="Nombre real">
                  <input name="realName" value={form.realName} onChange={onChange} maxLength={100} autoComplete="name" />
                </Field>
              </div>
              <Field label="Cuéntanos algo de ti">
                <textarea name="message" value={form.message} onChange={onChange} rows={5} maxLength={2000} placeholder="Desde cuándo haces música, con quién trabajas, qué tienes preparado…" />
              </Field>
              {/* Campo trampa para bots: no lo rellenes. */}
              <label className="seo-form__trap" aria-hidden="true">
                Web
                <input name="website" value={form.website} onChange={onChange} tabIndex={-1} autoComplete="off" />
              </label>
              <label className="seo-form__check">
                <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} required />
                <span>
                  Acepto que Other People Records guarde estos datos para valorar mi música y contactarme. Más
                  información en la <Link to="/privacidad">política de privacidad</Link>.
                  <span className="seo-form__required"> *</span>
                </span>
              </label>
              {error && <p className="seo-form__error" role="alert">{error}</p>}
              <div className="seo-form__footer">
                <button type="submit" className="seo-button" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Enviando…' : 'Enviar mi maqueta'}
                  {status !== 'sending' && <FontAwesomeIcon icon={['fas', 'paper-plane']} className="seo-button__icon" aria-hidden="true" />}
                </button>
                <p className="seo-form__hint">Los campos con * son obligatorios.</p>
              </div>
            </GlassSurface>
            )}
      </SeoSection>

      <SeoSection title="Qué pasa después">
        <SeoSteps
          items={[
            { title: 'Te llega un correo', text: 'Una confirmación con lo que acabas de enviar, para que sepas que ha llegado.' },
            { title: 'Escuchamos tu música', text: 'Lo hace alguien del equipo, no un filtro automático.' },
            { title: 'Si encaja, te escribimos', text: 'Para conocerte, en el estudio o por videollamada si estás lejos.' }
          ]}
        />
      </SeoSection>
    </SeoPage>
  )
}

/** Campo con su etiqueta en el estilo del formulario de Contacto. */
function Field ({ label, required = false, children }) {
  return (
    <label className="seo-form__field">
      <span className="seo-form__label">
        {label}
        {required && <span className="seo-form__required"> *</span>}
      </span>
      {children}
    </label>
  )
}

export default EnviarMaqueta
