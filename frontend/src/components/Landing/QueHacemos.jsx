import { Link } from 'react-router-dom'
import GlassSurface from '../GlassSurface'
import { useArtists } from '../../hooks/useArtists'
import { useReleases } from '../../hooks/useReleases'
import { useEvents } from '../../hooks/useEvents'
import './QueHacemos.css'

const PILLARS = [
  {
    to: '/discografica',
    title: 'Discográfica',
    text: 'Firmamos, lanzamos y distribuimos música de trap, rap, drill y R&B en todas las plataformas.'
  },
  {
    to: '/nuevos-talentos',
    title: 'Nuevos talentos',
    text: 'Buscamos artistas que están empezando. Escuchamos todas las maquetas que nos llegan.'
  },
  {
    to: '/estudio',
    title: 'Estudio y producción',
    text: 'Producción musical, grabación de voces, mezcla y mastering, en el estudio u online.'
  },
  {
    to: '/beats',
    title: 'Beats',
    text: 'Beats de trap, reggaetón, hoodtrap y jerk con licencia al momento, o hechos a medida.'
  }
]

/**
 * Bloque «Qué hacemos» de la home (Fase 4.1 del plan SEO): la propuesta de
 * valor en texto indexable, enlaces a las páginas pilar y cifras reales.
 */
export function QueHacemos () {
  const { artists } = useArtists()
  const { pagination: releasesPage } = useReleases({ count: 1 })
  const { pagination: eventsPage } = useEvents({ count: 1 })

  const stats = [
    artists.length > 0 && { value: artists.length, label: 'artistas' },
    releasesPage?.total > 0 && { value: releasesPage.total, label: 'lanzamientos' },
    eventsPage?.total > 0 && { value: eventsPage.total, label: 'eventos' },
    { value: '2020', label: 'desde' }
  ].filter(Boolean)

  return (
    <section className='que-hacemos' aria-labelledby='que-hacemos-title'>
      <h2 id='que-hacemos-title' className='que-hacemos__title'>Sello independiente de trap y música urbana</h2>
      <p className='que-hacemos__lead'>
        Other People Records firma, produce y mueve a nuevos talentos de la escena urbana: del primer tema grabado en
        nuestro estudio al lanzamiento en plataformas y al primer escenario. Trabajamos con artistas de toda España
        desde la provincia de Barcelona.
      </p>

      <ul className='que-hacemos__grid'>
        {PILLARS.map(pillar => (
          <li key={pillar.to}>
            <GlassSurface as={Link} to={pillar.to} className='que-hacemos__card'>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <span className='que-hacemos__more' aria-hidden='true'>Ver más →</span>
            </GlassSurface>
          </li>
        ))}
      </ul>

      {stats.length > 1 && (
        <ul className='que-hacemos__stats' aria-label='El sello en cifras'>
          {stats.map(s => (
            <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
          ))}
        </ul>
      )}

      <p className='que-hacemos__cta'>
        ¿Haces música? <Link to='/enviar-maqueta'>Envíanos tu maqueta</Link>.
      </p>
    </section>
  )
}
