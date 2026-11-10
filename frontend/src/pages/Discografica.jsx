import { Link } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { SeoChips, SeoFeatures, SeoProse, SeoSection, SeoStats, SeoSteps } from '../components/SeoPage/SeoBlocks'
import { useArtists } from '../hooks/useArtists'
import { useReleases } from '../hooks/useReleases'
import { useEvents } from '../hooks/useEvents'
import { artistPath } from '../utils/paths'

/**
 * Pilar nacional «discográfica de trap y música urbana» (Fase 4.2 del plan
 * SEO). /discografica-barcelona es la variante local y enlaza aquí.
 */
const FAQ = [
  {
    q: '¿Qué diferencia hay entre una discográfica independiente y una multinacional?',
    a: 'Una multinacional firma pocos proyectos y busca resultados rápidos. Un sello independiente como el nuestro firma menos artistas, trabaja cada lanzamiento de cerca y se implica en el desarrollo a medio plazo: producción, estudio, distribución, promoción y directo bajo el mismo techo.'
  },
  {
    q: '¿Cómo gana dinero el sello?',
    a: 'Invertimos en la producción, el lanzamiento y la promoción y lo recuperamos con un porcentaje de lo que genera la música. Los porcentajes, la duración y los derechos se pactan por escrito antes de empezar. El artista no paga por firmar.'
  },
  {
    q: '¿Firmáis a artistas sin experiencia?',
    a: 'Sí. Lo que pedimos es música propia terminada e identidad; la experiencia en estudio y en directo se gana trabajando. Lo contamos en la página de nuevos talentos.'
  },
  {
    q: '¿Trabajáis con artistas de fuera de Cataluña?',
    a: 'Sí. El estudio está en la provincia de Barcelona, pero la distribución, la promoción y el booking funcionan igual desde cualquier ciudad, y las sesiones de estudio se pueden concentrar en pocos días para quien viene de lejos.'
  },
  {
    q: '¿Qué estilos lleváis?',
    a: 'Música urbana: trap, rap, drill, R&B, reggaetón, hoodtrap y jerk, sobre todo la escena underground y los artistas que están empezando a despuntar.'
  }
]

const SERVICES = [
  {
    icon: 'sliders',
    title: 'Producción y estudio',
    text: 'Beats, grabación, mezcla y mastering en nuestro propio estudio, con productores que conocen el género.',
    to: '/estudio/produccion-musical'
  },
  {
    icon: 'globe',
    title: 'Distribución digital',
    text: 'Spotify, Apple Music, YouTube Music, Deezer, Amazon Music y Tidal, con metadatos, ISRC y fechas bien puestos.',
    to: '/discografia'
  },
  {
    icon: 'newspaper',
    title: 'Promoción',
    text: 'Lanzamientos preparados con tiempo para optar a playlists editoriales, prensa y redes.',
    to: '/revista'
  },
  {
    icon: 'ticket-alt',
    title: 'Booking y directo',
    text: 'Conciertos, showcases y fiestas propias: el directo es parte del desarrollo, no un extra.',
    to: '/booking-artistas'
  }
]

function Discografica () {
  const { artists } = useArtists()
  const { pagination: releasesPage } = useReleases({ count: 1 })
  const { pagination: eventsPage } = useEvents({ count: 1 })

  const stats = [
    { value: '2020', label: 'en activo desde' },
    artists.length > 0 && { value: artists.length, label: 'artistas' },
    releasesPage?.total > 0 && { value: releasesPage.total, label: 'lanzamientos' },
    eventsPage?.total > 0 && { value: eventsPage.total, label: 'eventos' }
  ].filter(Boolean)

  return (
    <SeoPage
      path="/discografica"
      title="Discográfica independiente de trap y música urbana en España"
      description="Other People Records es una discográfica independiente de trap, rap, drill y música urbana. Firmamos y desarrollamos nuevos talentos: producción, estudio, distribución, promoción y booking."
      eyebrow="Sello discográfico"
      h1="Discográfica independiente de trap y música urbana"
      lead="Other People Records es un sello joven que firma, produce y lanza a artistas de trap, rap, drill y música urbana. Llevamos desde 2020 trabajando con talento nuevo: del primer tema grabado al primer escenario."
      crumbs={[{ label: 'Discográfica' }]}
      actions={[
        { label: 'Enviar mi maqueta', to: '/enviar-maqueta', icon: 'arrow-right' },
        { label: 'Escuchar el catálogo', to: '/discografia', variant: 'secondary' }
      ]}
      hero={<SeoStats stats={stats} label="El sello en cifras" />}
      faq={FAQ}
      cta={{
        title: '¿Buscas sello para tu música?',
        text: 'Mándanos dos o tres temas. Escuchamos todo lo que llega, de cualquier ciudad.',
        to: '/enviar-maqueta',
        label: 'Enviar mi maqueta'
      }}
    >
      <SeoSection
        title="Qué hace el sello por un artista"
        intro="Firmar con un sello tiene sentido cuando alguien se ocupa de todo lo que no es hacer música y lo hace mejor que tú solo. Esto es lo que asumimos cuando firmamos un proyecto."
      >
        <SeoFeatures items={SERVICES} />
      </SeoSection>

      <SeoSection title="Un sello pensado para nuevos talentos">
        <SeoProse>
          <p>
            No esperamos a que un artista tenga números para trabajar con él: firmamos por la música. Somos un equipo
            pequeño y eso se nota en el día a día, porque el artista trabaja siempre con las mismas personas en la
            producción, el estudio, el lanzamiento y el directo. Lo explicamos paso a paso en{' '}
            <Link to="/nuevos-talentos">nuevos talentos</Link>.
          </p>
        </SeoProse>
      </SeoSection>

      {artists.length > 0 && (
        <SeoSection title="El roster" intro="Los artistas y productores que trabajan hoy con el sello.">
          <SeoChips
            round
            items={artists.map(artist => ({
              key: artist.id,
              to: artistPath(artist),
              label: artist.title,
              meta: artist.genre,
              img: artist.img
            }))}
          />
          <SeoProse>
            <p>
              Puedes escuchar todo lo que han publicado en la <Link to="/discografia">discografía</Link> y ver dónde tocan
              en <Link to="/eventos">conciertos y eventos</Link>.
            </p>
          </SeoProse>
        </SeoSection>
      )}

      <SeoSection title="Cómo firmamos">
        <SeoSteps
          items={[
            { title: 'Nos mandas tu música', text: <>Un enlace con dos o tres temas por el <Link to="/enviar-maqueta">formulario de maquetas</Link>. Nada de dossieres.</> },
            { title: 'Nos conocemos', text: 'Si encaja, quedamos en el estudio o por videollamada. Queremos saber dónde quieres estar en dos años antes de hablar de porcentajes.' },
            { title: 'Plan y contrato', text: 'Qué se lanza, cuándo y con qué presupuesto, por escrito y sin letra pequeña.' },
            { title: 'A trabajar', text: 'Producción, lanzamiento, promoción y directo con el mismo equipo.' }
          ]}
        />
      </SeoSection>

      <SeoSection title="¿Estás en Barcelona?">
        <SeoProse>
          <p>
            El estudio está en la Masia Agullons, en Sant Joan de Mediona, a una hora de Barcelona, y buena parte del
            roster es del área metropolitana y de la Anoia. Si buscas un sello cerca, lo contamos en{' '}
            <Link to="/discografica-barcelona">discográfica en Barcelona</Link>.
          </p>
        </SeoProse>
      </SeoSection>
    </SeoPage>
  )
}

export default Discografica
