import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { SeoLayout } from '../components/SeoPage/SeoPage'
import { SeoChips, SeoFeatures, SeoProse, SeoSection, SeoSteps } from '../components/SeoPage/SeoBlocks'
import { useEvents } from '../hooks/useEvents'
import { useArtists } from '../hooks/useArtists'
import { artistPath } from '../utils/paths'
import { trackEvent } from '../utils/analytics'

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
  const { artists } = useArtists()
  const { events } = useEvents({ count: 50, sortBy: 'date', sortOrder: 'desc' })
  // Salas y ciudades donde ya ha tocado el roster (sale de los eventos reales).
  const venues = [...new Set(events.map(e => (e.subtitle || '').trim()).filter(Boolean))].slice(0, 12)

  usePageMeta({
    title: 'Booking de artistas de trap y rap en toda España',
    description: 'Contrata artistas de trap, rap y drill para tu sala, festival o fiesta. Booking en Barcelona, Cataluña y toda España con presupuesto cerrado y rider claro.',
    url: '/booking-artistas'
  })

  useJsonLd(JSONLD)

  return (
    <SeoLayout
      eyebrow="Booking"
      h1="Booking de artistas de trap y música urbana"
      lead="Gestionamos la contratación de los artistas de Other People Records para salas, festivales, fiestas mayores y eventos privados de toda España. Trap, rap, drill y reggaetón, con presupuesto cerrado y rider por escrito antes de confirmar la fecha."
      crumbs={[{ label: 'Booking de artistas' }]}
      actions={[
        { label: 'Pedir presupuesto', to: '/contacto', icon: 'arrow-right', onClick: () => trackEvent('booking-presupuesto') },
        { label: 'Ver el roster', to: '/artistas', variant: 'secondary' }
      ]}
      faq={FAQ}
      cta={{
        title: '¿Tienes una fecha en mente?',
        text: 'Escríbenos con la ciudad y el día y te decimos en 48 horas qué artistas están disponibles y por cuánto.',
        to: '/contacto',
        label: 'Pedir presupuesto de booking',
        onClick: () => trackEvent('booking-presupuesto')
      }}
    >
      <SeoSection title="Para quién trabajamos">
        <SeoFeatures
          items={[
            { icon: 'music', title: 'Salas y clubs', text: 'Que programan música urbana entre semana o en fin de semana.' },
            { icon: 'campground', title: 'Festivales', text: 'Que necesitan cerrar un escenario urbano con artistas emergentes contrastados.' },
            { icon: 'users', title: 'Ayuntamientos y fiestas mayores', text: 'De Barcelona y comarcas, con la facturación y los seguros en regla.' },
            { icon: 'martini-glass-citrus', title: 'Marcas y eventos privados', text: 'Que buscan un directo corto y potente.' }
          ]}
        />
      </SeoSection>

      <SeoSection title="Cómo funciona">
        <SeoSteps
          items={[
            { title: 'Nos cuentas la fecha', text: 'Ciudad, aforo, tipo de evento y presupuesto orientativo. Con eso ya te decimos qué artistas del roster encajan y cuáles tienen la fecha libre.' },
            { title: 'Presupuesto cerrado', text: 'Un solo número que incluye caché, desplazamiento y técnico si hace falta. Sin extras de última hora.' },
            { title: 'Contrato, rider y confirmación', text: 'Firmamos, te enviamos el rider técnico y el material de promoción, y anunciamos la fecha desde nuestros canales para ayudarte a vender entradas.' }
          ]}
        />
      </SeoSection>

      {venues.length > 0 && (
        <SeoSection title="Dónde hemos tocado" intro="Algunas de las salas y ciudades de los últimos eventos del sello.">
          <SeoChips items={venues.map(venue => ({ label: venue }))} />
        </SeoSection>
      )}

      <SeoSection title="Qué artistas puedes contratar">
        {artists.length > 0 && (
          <SeoChips
            round
            items={artists.map(artist => ({
              key: artist.id,
              to: artistPath(artist),
              label: artist.title,
              meta: artist.artistType || artist.genre,
              img: artist.img
            }))}
          />
        )}
        <SeoProse>
          <p>
            Todo el roster está en la página de <Link to="/artistas">artistas</Link>, con su música para que escuches
            antes de decidir. Si quieres hacerte una idea del tipo de directo que montamos, echa un vistazo a los{' '}
            <Link to="/eventos">eventos</Link> que ya hemos hecho. Y si además del directo te interesa la parte de
            sello, lo explicamos en <Link to="/discografica">qué hace el sello</Link>.
          </p>
        </SeoProse>
      </SeoSection>
    </SeoLayout>
  )
}

export default BookingArtistas
