import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { SeoLayout } from '../components/SeoPage/SeoPage'
import { SeoFeatures, SeoProse, SeoSection, SeoSteps } from '../components/SeoPage/SeoBlocks'

const URL = 'https://www.otherpeople.es/discografica-barcelona'

const FAQ = [
  {
    q: '¿Qué pide una discográfica para firmar a un artista?',
    a: 'Nos fijamos sobre todo en que haya música terminada y una identidad clara. No hace falta que tengas números grandes: nos interesa más escuchar tres temas que nos digan algo que ver un perfil con muchos seguidores y ninguna canción propia.'
  },
  {
    q: '¿Hay que pagar algo por firmar con el sello?',
    a: 'No. Un sello no cobra por firmar. Nosotros invertimos en la producción y el lanzamiento y recuperamos esa inversión con un porcentaje de lo que genera la música, siempre acordado por escrito antes de empezar.'
  },
  {
    q: '¿Trabajáis solo con artistas de Barcelona?',
    a: 'Estamos en Igualada y la mayoría de nuestro roster es del área de Barcelona, pero trabajamos con artistas de toda España. El estudio es presencial; el resto —distribución, promoción, booking— se puede llevar a distancia.'
  },
  {
    q: '¿Qué géneros lleváis?',
    a: 'Sobre todo música urbana: trap, rap, drill y R&B. Si tu proyecto se sale de ahí pero encaja con lo que hacemos, mándalo igualmente.'
  },
  {
    q: '¿Cómo os envío mi maqueta?',
    a: 'Por el formulario de maquetas de la web (otherpeople.es/enviar-maqueta), con un enlace para escuchar la música (Spotify, YouTube, SoundCloud o Drive). Escuchamos todo lo que llega, aunque tardemos.'
  }
]

const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': URL,
      url: URL,
      name: 'Discográfica en Barcelona — Other People Records',
      inLanguage: 'es-ES',
      about: { '@id': 'https://www.otherpeople.es/#organization' },
      isPartOf: { '@id': 'https://www.otherpeople.es/#website' }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.otherpeople.es/' },
        { '@type': 'ListItem', position: 2, name: 'Discográfica en Barcelona', item: URL }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    }
  ]
}

const LEAD = 'Other People Records es un sello discográfico independiente con base en Igualada, provincia de Barcelona. Desde 2020 firmamos, producimos y lanzamos proyectos de trap, rap, drill y R&B, y acompañamos a nuestros artistas también en el directo.'

const SERVICES = [
  {
    icon: 'sliders',
    title: 'Producción y estudio',
    text: 'Grabación de voces, mezcla y mastering en nuestro estudio, además de producción de instrumentales a medida.',
    to: '/estudio'
  },
  {
    icon: 'globe',
    title: 'Distribución digital',
    text: 'Spotify, Apple Music, YouTube Music, Deezer, Amazon Music y Tidal, con fecha, metadatos e ISRC bien puestos.',
    to: '/discografia'
  },
  {
    icon: 'newspaper',
    title: 'Promoción y pitching',
    text: 'Lanzamientos preparados con antelación para optar a playlists editoriales, y trabajo de prensa y redes.'
  },
  {
    icon: 'ticket-alt',
    title: 'Booking y directo',
    text: 'Gestionamos conciertos y festivales para los artistas del sello.',
    to: '/booking-artistas'
  },
  {
    icon: 'file',
    title: 'Contratos claros',
    text: 'Porcentajes, duración y derechos por escrito antes de empezar, sin cláusulas raras.'
  }
]

function DiscograficaBarcelona () {
  usePageMeta({
    title: 'Discográfica en Barcelona — Sello independiente de música urbana',
    description: 'Somos un sello discográfico independiente en Barcelona especializado en música urbana. Producción, distribución, promoción y booking para artistas de trap, rap y drill.',
    url: '/discografica-barcelona'
  })

  useJsonLd(JSONLD)

  return (
    <SeoLayout
      eyebrow="Sello discográfico"
      h1="Discográfica en Barcelona para artistas urbanos"
      lead={LEAD}
      crumbs={[{ label: 'Discográfica en Barcelona' }]}
      actions={[
        { label: 'Enviar mi maqueta', to: '/enviar-maqueta', icon: 'arrow-right' },
        { label: 'Ver el roster', to: '/artistas', variant: 'secondary' }
      ]}
      faq={FAQ}
      cta={{
        title: '¿Buscas sello para tu proyecto?',
        text: 'Mándanos tu música. Escuchamos todo lo que llega y respondemos a lo que nos interesa.',
        to: '/enviar-maqueta',
        label: 'Enviar mi maqueta'
      }}
    >
      <SeoSection
        title="Qué hace por ti un sello independiente"
        intro="Una discográfica no es solo un logo en la portada. Lo que cambia de verdad es quién se ocupa de todo lo que no es hacer música. Esto es lo que asumimos nosotros cuando firmamos un proyecto."
      >
        <SeoFeatures items={SERVICES} />
      </SeoSection>

      <SeoSection title="Por qué en Barcelona">
        <SeoProse>
          <p>
            Barcelona concentra buena parte de la escena urbana del país, pero también concentra la prisa. Nosotros
            estamos a 45 minutos, en Igualada, y eso nos permite trabajar con calma: sesiones largas, sin reloj y sin
            compartir el estudio con otros tres proyectos el mismo día. Los artistas del roster son en su mayoría del
            área metropolitana de Barcelona y de la Anoia, y tocan por toda Cataluña.
          </p>
          <p>
            Puedes ver a quién llevamos en la página de <Link to="/artistas">artistas</Link> y escuchar lo que hemos
            publicado en la <Link to="/discografia">discografía</Link>. ¿No estás en Barcelona? Trabajamos con
            artistas de toda España: te lo contamos en{' '}
            <Link to="/discografica">discográfica independiente de trap y música urbana</Link>.
          </p>
        </SeoProse>
      </SeoSection>

      <SeoSection title="Cómo firmamos">
        <SeoSteps
          items={[
            { title: 'Nos mandas tu música', text: 'Un enlace con dos o tres temas. Nada de dossieres: escuchamos primero y preguntamos después.' },
            { title: 'Nos vemos', text: 'Si encaja, quedamos en el estudio. Queremos saber dónde quieres estar en dos años antes de hablar de porcentajes.' },
            { title: 'Plan y contrato', text: 'Definimos qué se lanza, cuándo y con qué presupuesto, y lo firmamos. A partir de ahí, a trabajar.' }
          ]}
        />
      </SeoSection>
    </SeoLayout>
  )
}

export default DiscograficaBarcelona
