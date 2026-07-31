import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import Footer from '../components/Footer/Footer'
import GlassSurface from '../components/GlassSurface'
import './Landing.css'

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
    a: 'Por el formulario de contacto o por email a justsomeotherpeople@gmail.com, con un enlace para escuchar la música (Spotify, YouTube, SoundCloud o Drive). Escuchamos todo lo que llega, aunque tardemos.'
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

function DiscograficaBarcelona () {
  usePageMeta({
    title: 'Discográfica en Barcelona — Sello independiente de música urbana',
    description: 'Somos un sello discográfico independiente en Barcelona especializado en música urbana. Producción, distribución, promoción y booking para artistas de trap, rap y drill.',
    url: '/discografica-barcelona'
  })

  useJsonLd(JSONLD)

  return (
    <>
      <article className="seo-landing">
        <span className="seo-landing__eyebrow">Sello discográfico</span>
        <h1>Discográfica en Barcelona para artistas urbanos</h1>
        <p className="seo-landing__lead">
          Other People Records es un sello discográfico independiente con base en Igualada,
          provincia de Barcelona. Desde 2020 firmamos, producimos y lanzamos proyectos de
          trap, rap, drill y R&amp;B, y acompañamos a nuestros artistas también en el
          directo.
        </p>

        <h2>Qué hace por ti un sello independiente</h2>
        <p>
          Una discográfica no es solo un logo en la portada. Lo que cambia de verdad es
          quién se ocupa de todo lo que no es hacer música. Esto es lo que asumimos
          nosotros cuando firmamos un proyecto:
        </p>
        <ul>
          <li>
            <strong>Producción y estudio.</strong> Grabación de voces, mezcla y mastering en{' '}
            <Link to="/estudios">nuestro estudio</Link>, además de producción de
            instrumentales a medida.
          </li>
          <li>
            <strong>Distribución digital.</strong> Publicamos en Spotify, Apple Music,
            YouTube Music, Deezer, Amazon Music y Tidal, con fecha de lanzamiento,
            metadatos y códigos ISRC bien puestos.
          </li>
          <li>
            <strong>Promoción y pitching.</strong> Preparamos el lanzamiento con
            antelación para optar a playlists editoriales y trabajamos la prensa y las
            redes del artista.
          </li>
          <li>
            <strong>Booking y directo.</strong> Gestionamos conciertos y festivales
            —lo contamos en detalle en{' '}
            <Link to="/booking-artistas">booking de artistas</Link>—.
          </li>
          <li>
            <strong>Contratos claros.</strong> Porcentajes, duración y derechos por
            escrito antes de empezar, sin cláusulas raras.
          </li>
        </ul>

        <h2>Por qué en Barcelona</h2>
        <p>
          Barcelona concentra buena parte de la escena urbana del país, pero también
          concentra la prisa. Nosotros estamos a 45 minutos, en Igualada, y eso nos
          permite trabajar con calma: sesiones largas, sin reloj y sin compartir el
          estudio con otros tres proyectos el mismo día. Los artistas del roster son en su
          mayoría del área metropolitana de Barcelona y de la Anoia, y tocan por toda
          Cataluña.
        </p>
        <p>
          Puedes ver a quién llevamos en la página de{' '}
          <Link to="/artistas">artistas</Link> y escuchar lo que hemos publicado en la{' '}
          <Link to="/discografia">discografía</Link>.
        </p>

        <h2>Cómo firmamos</h2>
        <h3>1. Nos mandas tu música</h3>
        <p>
          Un enlace con dos o tres temas. Nada de dossieres: escuchamos primero y
          preguntamos después.
        </p>
        <h3>2. Nos vemos</h3>
        <p>
          Si encaja, quedamos en el estudio. Queremos saber dónde quieres estar en dos
          años antes de hablar de porcentajes.
        </p>
        <h3>3. Plan y contrato</h3>
        <p>
          Definimos qué se lanza, cuándo y con qué presupuesto, y lo firmamos. A partir de
          ahí, a trabajar.
        </p>

        <h2>Preguntas frecuentes</h2>
        <div className="seo-faq">
          {FAQ.map(({ q, a }) => (
            <div className="seo-faq__item" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>

        <GlassSurface as="section" className="seo-cta" borderRadius={16}>
          <h2>¿Buscas sello para tu proyecto?</h2>
          <p>
            Mándanos tu música. Escuchamos todo lo que llega y respondemos a lo que nos
            interesa.
          </p>
          <Link to="/contacto" className="seo-cta__button">
            Enviar mi maqueta
          </Link>
        </GlassSurface>
      </article>

      <Footer />
    </>
  )
}

export default DiscograficaBarcelona
