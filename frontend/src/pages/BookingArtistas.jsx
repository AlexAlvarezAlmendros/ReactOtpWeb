import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import Footer from '../components/Footer/Footer'
import GlassSurface from '../components/GlassSurface'
import './Landing.css'

const URL = 'https://www.otherpeople.es/booking-artistas'

const FAQ = [
  {
    q: '¿Con cuánta antelación hay que reservar un artista?',
    a: 'Lo cómodo son entre cuatro y ocho semanas. Con menos también se puede cerrar, pero depende de la agenda del artista y del margen para preparar el directo.'
  },
  {
    q: '¿Cuánto cuesta contratar a un artista urbano?',
    a: 'Depende del artista, del formato (solo con DJ o con banda), de la duración del show y de si hay desplazamiento y alojamiento. Te pasamos un presupuesto cerrado por escrito antes de confirmar nada.'
  },
  {
    q: '¿Tocáis fuera de Barcelona?',
    a: 'Sí. Trabajamos habitualmente en Barcelona y Cataluña, y nos movemos al resto de España y a festivales fuera si las fechas cuadran.'
  },
  {
    q: '¿Qué necesitáis del promotor?',
    a: 'Rider técnico cubierto (PA, monitores, micrófonos y mesa), un espacio para cambiarse y la hora de prueba de sonido. Te enviamos el rider completo al confirmar la fecha.'
  },
  {
    q: '¿Podéis montar el evento entero?',
    a: 'Sí. Además de ceder artistas, organizamos showcases y fiestas propias: cartel, sonido, venta de entradas y difusión. Puedes ver el formato en nuestra página de eventos.'
  }
]

const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${URL}#service`,
      name: 'Booking de artistas urbanos',
      serviceType: 'Booking y contratación de artistas',
      url: URL,
      provider: { '@id': 'https://www.otherpeople.es/#organization' },
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Barcelona' },
        { '@type': 'AdministrativeArea', name: 'Cataluña' },
        { '@type': 'Country', name: 'España' }
      ],
      audience: { '@type': 'Audience', audienceType: 'Promotores, salas, festivales y ayuntamientos' }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.otherpeople.es/' },
        { '@type': 'ListItem', position: 2, name: 'Booking de artistas', item: URL }
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

function BookingArtistas () {
  usePageMeta({
    title: 'Booking de artistas urbanos en Barcelona',
    description: 'Contrata artistas de trap, rap y drill para tu sala, festival o fiesta. Booking en Barcelona, Cataluña y toda España con presupuesto cerrado y rider claro.',
    url: '/booking-artistas'
  })

  useJsonLd(JSONLD)

  return (
    <>
      <article className="seo-landing">
        <span className="seo-landing__eyebrow">Booking</span>
        <h1>Booking de artistas urbanos en Barcelona</h1>
        <p className="seo-landing__lead">
          Gestionamos la contratación de los artistas de Other People Records para salas,
          festivales, fiestas mayores y eventos privados. Trap, rap y drill, con
          presupuesto cerrado y rider por escrito antes de confirmar la fecha.
        </p>

        <h2>Para quién trabajamos</h2>
        <ul>
          <li>
            <strong>Salas y clubs</strong> que programan música urbana entre semana o fin
            de semana.
          </li>
          <li>
            <strong>Festivales</strong> que necesitan cerrar un escenario urbano con
            artistas emergentes contrastados.
          </li>
          <li>
            <strong>Ayuntamientos y fiestas mayores</strong> de Barcelona y comarcas, con
            la facturación y los seguros en regla.
          </li>
          <li>
            <strong>Marcas y eventos privados</strong> que buscan un directo corto y
            potente.
          </li>
        </ul>

        <h2>Cómo funciona</h2>
        <h3>1. Nos cuentas la fecha</h3>
        <p>
          Ciudad, aforo, tipo de evento y presupuesto orientativo. Con eso ya te decimos
          qué artistas del roster encajan y cuáles tienen la fecha libre.
        </p>
        <h3>2. Presupuesto cerrado</h3>
        <p>
          Un solo número que incluye caché, desplazamiento y técnico si hace falta. Sin
          extras de última hora.
        </p>
        <h3>3. Contrato, rider y confirmación</h3>
        <p>
          Firmamos, te enviamos el rider técnico y el material de promoción, y anunciamos
          la fecha desde nuestros canales para ayudarte a vender entradas.
        </p>

        <h2>Qué artistas puedes contratar</h2>
        <p>
          Todo el roster está en la página de <Link to="/artistas">artistas</Link>, con su
          música para que escuches antes de decidir. Si quieres hacerte una idea del tipo
          de directo que montamos, echa un vistazo a los{' '}
          <Link to="/eventos">eventos</Link> que ya hemos hecho. Y si además del directo te
          interesa la parte de sello, lo explicamos en{' '}
          <Link to="/discografica-barcelona">discográfica en Barcelona</Link>.
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
          <h2>¿Tienes una fecha en mente?</h2>
          <p>
            Escríbenos con la ciudad y el día y te decimos en 48 horas qué artistas están
            disponibles y por cuánto.
          </p>
          <Link to="/contacto" className="seo-cta__button">
            Pedir presupuesto de booking
          </Link>
        </GlassSurface>
      </article>

      <Footer />
    </>
  )
}

export default BookingArtistas
