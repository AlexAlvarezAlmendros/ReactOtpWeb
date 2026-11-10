import { Link } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { SeoChips, SeoCta, SeoFeatures, SeoProse, SeoSection, SeoSteps } from '../components/SeoPage/SeoBlocks'
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
      actions={[
        { label: open ? 'Presentarme a la convocatoria' : 'Enviar mi maqueta', to: '/enviar-maqueta', icon: 'arrow-right' },
        { label: 'Qué hace el sello', to: '/discografica', variant: 'secondary' }
      ]}
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
        <SeoCta eyebrow="Convocatoria abierta" title={call.nombre} text={call.texto} to="/enviar-maqueta" label="Presentarme">
          <p className="seo-cta__details">
            <span><strong>Fecha límite</strong>{formatDate(call.cierre)}</span>
            {call.showcase && <span><strong>Showcase</strong>{call.showcase}</span>}
          </p>
        </SeoCta>
      )}

      <SeoSection
        title="Cómo es el programa de desarrollo"
        intro="Cuatro pasos, siempre con el mismo equipo: de la primera escucha al primer escenario."
      >
        <SeoSteps
          items={[
            {
              title: 'Escucha y primera reunión',
              text: 'Escuchamos tu maqueta y, si encaja, nos vemos para hablar de tu música y de hacia dónde quieres llevarla.'
            },
            {
              title: 'Estudio',
              text: (
                <>
                  Sesiones en el <Link to="/estudio">estudio del sello</Link> para grabar, producir y terminar los temas
                  con <Link to="/estudio/produccion-musical">producción</Link> y{' '}
                  <Link to="/estudio/mezcla-y-mastering">mezcla y mastering</Link> profesionales.
                </>
              )
            },
            {
              title: 'Plan de lanzamiento',
              text: 'Qué sale primero, cuándo y cómo: portada, fechas, distribución y promoción, para que cada tema llegue preparado a las plataformas.'
            },
            {
              title: 'Directo',
              text: (
                <>
                  Los primeros conciertos en los eventos del sello, con público de la escena, y después{' '}
                  <Link to="/booking-artistas">booking</Link> en salas y festivales.
                </>
              )
            }
          ]}
        />
      </SeoSection>

      <SeoSection title="Convocatorias">
        <SeoProse>
          <p>
            Varias veces al año abrimos convocatorias con fecha límite para proyectos concretos. Los seleccionados
            trabajan en el estudio y presentan su música en un showcase dentro de un evento del sello. Se anuncian en
            la <Link to="/revista">revista</Link>, en la <Link to="/newsletters">newsletter</Link> y en Instagram.
            {!open && ' Ahora mismo no hay ninguna abierta, pero las maquetas siguen abiertas todo el año.'}
          </p>
        </SeoProse>
      </SeoSection>

      {events.length > 0 && (
        <SeoSection title="Dónde tocan los artistas del sello" intro="Algunos de los últimos eventos que hemos organizado.">
          <SeoChips
            items={events.map(event => ({
              key: event.id,
              to: eventPath(event),
              label: event.title,
              meta: [event.subtitle, event.date && formatDate(event.date)].filter(Boolean).join(' · '),
              img: event.img
            }))}
          />
        </SeoSection>
      )}

      <SeoSection title="Qué necesitas para empezar">
        <SeoFeatures
          items={[
            { icon: 'music', title: 'Dos o tres temas', text: 'Propios, aunque estén grabados en casa. Mejor pocos y terminados que muchos bocetos.' },
            { icon: 'link', title: 'Un enlace', text: 'Donde escucharlos: Spotify, SoundCloud, YouTube o una carpeta de Drive.' },
            { icon: 'user-group', title: 'Ganas de equipo', text: 'Un sello es un proyecto a medio plazo: trabajamos juntos, no de single en single.' }
          ]}
        />
        <SeoProse>
          <p>
            Si quieres saber qué mirar antes de firmar con cualquier sello, en la <Link to="/revista">revista</Link>{' '}
            publicamos guías para artistas. Y si lo que necesitas es solo producir un tema, mira los{' '}
            <Link to="/estudio">servicios del estudio</Link>.
          </p>
        </SeoProse>
      </SeoSection>
    </SeoPage>
  )
}

export default NuevosTalentos
