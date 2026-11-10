import { useArtists } from '../../hooks/useArtists'
import { useReleases } from '../../hooks/useReleases'
import { useEvents } from '../../hooks/useEvents'
import { SeoButton, SeoFeatures, SeoStats } from '../SeoPage/SeoBlocks'
import './QueHacemos.css'

const PILLARS = [
  {
    to: '/discografica',
    icon: 'compact-disc',
    title: 'Discográfica',
    text: 'Firmamos, lanzamos y distribuimos música de trap, rap, drill y R&B en todas las plataformas.'
  },
  {
    to: '/nuevos-talentos',
    icon: 'user-group',
    title: 'Nuevos talentos',
    text: 'Buscamos artistas que están empezando. Escuchamos todas las maquetas que nos llegan.'
  },
  {
    to: '/estudio',
    icon: 'microphone',
    title: 'Estudio y producción',
    text: 'Producción musical, grabación de voces, mezcla y mastering, en el estudio u online.'
  },
  {
    to: '/beats',
    icon: 'music',
    title: 'Beats',
    text: 'Beats de trap, reggaetón, hoodtrap y jerk con licencia al momento, o hechos a medida.'
  }
]

/**
 * Bloque «Qué hacemos» de la home (Fase 4.1 del plan SEO): la propuesta de
 * valor en texto indexable, enlaces a las páginas pilar y cifras reales.
 * Usa los mismos bloques que las landings (SeoBlocks).
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
      <header className='que-hacemos__header'>
        <span className='seo-eyebrow'>Other People Records</span>
        <h2 id='que-hacemos-title' className='que-hacemos__title'>Sello independiente de trap y música urbana</h2>
        <div className='seo-accent' aria-hidden='true' />
        <p className='que-hacemos__lead'>
          Firmamos, producimos y movemos a nuevos talentos de la escena urbana: del primer tema grabado en nuestro
          estudio al lanzamiento en plataformas y al primer escenario. Trabajamos con artistas de toda España desde la
          provincia de Barcelona.
        </p>
      </header>

      <SeoFeatures items={PILLARS} />

      <SeoStats stats={stats} label='El sello en cifras' />

      <div className='que-hacemos__cta'>
        <p>¿Haces música? Escuchamos todo lo que nos llega.</p>
        <SeoButton to='/enviar-maqueta' icon='arrow-right'>Envíanos tu maqueta</SeoButton>
      </div>
    </section>
  )
}
