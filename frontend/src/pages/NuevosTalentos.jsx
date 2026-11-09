import { Link } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { useEvents } from '../hooks/useEvents'
import { CONVOCATORIA_ACTUAL } from '../data/convocatorias'
import { eventPath } from '../utils/paths'

const FAQ = [
  {
    q: '¿Qué es una convocatoria?',
    a: 'Un periodo con fecha límite en el que buscamos proyectos concretos (por ejemplo, tres artistas para grabar un EP). Los seleccionados trabajan en el estudio y presentan su música en directo en un evento del sello. Fuera de convocatoria, las maquetas siguen abiertas todo el año.'
  },
  {
    q: '¿Hace falta tener temas publicados?',
    a: 'No. Hace falta tener música propia, aunque sea en maqueta, y ganas de trabajarla. Muchos artistas llegan con temas grabados en casa.'
  },
  {
    q: '¿Cuánto cuesta entrar en el programa?',
    a: 'Nada. Si firmamos un proyecto, el sello invierte en él y lo recupera con un porcentaje de lo que genera la música, siempre pactado por escrito antes de empezar.'
  },
  {
    q: '¿Puedo participar si no vivo cerca de Barcelona?',
    a: 'Sí. Las sesiones de estudio se pueden concentrar en pocos días para quien viene de lejos, y el resto del trabajo se lleva a distancia.'
  }
]

function formatDate (value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function NuevosTalentos () {
  const { events } = useEvents({ count: 4, sortBy: 'date', sortOrder: 'desc' })
  const call = CONVOCATORIA_ACTUAL
  const open = call && new Date(call.cierre) >= new Date(new Date().toDateString())

  return (
    <SeoPage
      path="/nuevos-talentos"
      title="Discográfica para nuevos talentos de trap y música urbana"
      description="Programa de desarrollo de artistas de Other People Records: estudio, producción, lanzamiento y primeros directos para nuevos talentos de trap, rap, drill y R&B. Convocatorias y maquetas abiertas."
      eyebrow="Nuevos talentos"
      h1="Una discográfica para artistas que están empezando"
      lead="Buscamos artistas nuevos de trap, rap, drill, R&B y música urbana con música propia y algo que contar. No pedimos números: pedimos temas. Si encajas, te acompañamos desde el primer tema grabado hasta el primer escenario."
      crumbs={[{ label: 'Discográfica', to: '/discografica' }, { label: 'Nuevos talentos' }]}
      faq={FAQ}
      cta={{
        title: open ? `${call.nombre}: abierta` : 'Las maquetas están abiertas',
        text: open
          ? `Puedes presentarte hasta el ${formatDate(call.cierre)}.`
          : 'Mándanos tu música cuando quieras. Escuchamos todo lo que llega.',
        to: '/enviar-maqueta',
        label: open ? 'Presentarme a la convocatoria' : 'Enviar mi maqueta'
      }}
    >
      {open && (
        <section className="seo-cta" aria-label="Convocatoria abierta">
          <span className="seo-landing__eyebrow">Convocatoria abierta</span>
          <h2>{call.nombre}</h2>
          <p>{call.texto}</p>
          <p><strong>Fecha límite:</strong> {formatDate(call.cierre)}{call.showcase && <><br /><strong>Showcase:</strong> {call.showcase}</>}</p>
          <Link to="/enviar-maqueta" className="seo-cta__button">Presentarme</Link>
        </section>
      )}

      <h2>Cómo es el programa de desarrollo</h2>
      <ol className="seo-steps">
        <li>
          <strong>Escucha y primera reunión.</strong> Escuchamos tu maqueta y, si encaja, nos vemos para hablar de tu
          música y de hacia dónde quieres llevarla.
        </li>
        <li>
          <strong>Estudio.</strong> Sesiones en el <Link to="/estudio">estudio del sello</Link> para grabar, producir y
          terminar los temas con <Link to="/estudio/produccion-musical">producción</Link> y{' '}
          <Link to="/estudio/mezcla-y-mastering">mezcla y mastering</Link> profesionales.
        </li>
        <li>
          <strong>Plan de lanzamiento.</strong> Qué sale primero, cuándo y cómo: portada, fechas, distribución y
          promoción, para que cada tema llegue preparado a las plataformas.
        </li>
        <li>
          <strong>Directo.</strong> Los primeros conciertos en los eventos del sello, con público de la escena, y después{' '}
          <Link to="/booking-artistas">booking</Link> en salas y festivales.
        </li>
      </ol>

      <h2>Convocatorias</h2>
      <p>
        Varias veces al año abrimos convocatorias con fecha límite para proyectos concretos. Los seleccionados trabajan en
        el estudio y presentan su música en un showcase dentro de un evento del sello. Se anuncian en la{' '}
        <Link to="/revista">revista</Link>, en la <Link to="/newsletters">newsletter</Link> y en Instagram.
        {!open && ' Ahora mismo no hay ninguna abierta, pero las maquetas siguen abiertas todo el año.'}
      </p>

      {events.length > 0 && (
        <>
          <h2>Dónde tocan los artistas del sello</h2>
          <p>Algunos de los últimos eventos que hemos organizado:</p>
          <ul>
            {events.map(event => (
              <li key={event.id}>
                <Link to={eventPath(event)}>{event.title}</Link>
                {event.subtitle && <span> · {event.subtitle}</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Qué necesitas para empezar</h2>
      <ul>
        <li>Dos o tres temas propios, aunque estén grabados en casa.</li>
        <li>Un enlace donde escucharlos: Spotify, SoundCloud, YouTube o Drive.</li>
        <li>Ganas de trabajar en equipo y a medio plazo.</li>
      </ul>
      <p>
        Si quieres saber qué mirar antes de firmar con cualquier sello, en la <Link to="/revista">revista</Link>{' '}
        publicamos guías para artistas. Y si lo que necesitas es solo producir un tema, mira los{' '}
        <Link to="/estudio">servicios del estudio</Link>.
      </p>
    </SeoPage>
  )
}

export default NuevosTalentos
