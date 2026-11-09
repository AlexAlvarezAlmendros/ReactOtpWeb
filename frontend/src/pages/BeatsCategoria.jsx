import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBeats } from '../hooks/useBeats'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { Cards } from '../components/CardList/CardList'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Footer from '../components/Footer/Footer'
import { BEAT_CATEGORIES, MIN_INDEXABLE, categoryPath, findCategory, inCategory } from '../data/beatCategories'
import { beatPath } from '../utils/paths'
import NotFound from './NotFound'
import './ListingPage.css'
import './Beats.css'

const SITE_URL = 'https://www.otherpeople.es'

/** Rango de BPM ignorando valores imposibles (hay algún 984 por error de tecleo). */
function bpmRange (beats) {
  const values = beats.map(b => Number(b.bpm)).filter(n => n >= 50 && n <= 220)
  if (!values.length) return null
  return [Math.min(...values), Math.max(...values)]
}

function BeatsCategoria () {
  const { pathname } = useLocation()
  const category = findCategory(pathname.split('/')[2])

  // El catálogo entero cabe en una página (≈80 beats): filtramos aquí por
  // género exacto, porque el filtro de la API es por «contiene».
  const { beats: allBeats, loading } = useBeats({ count: 100, sortBy: 'createdAt', sortOrder: 'desc' })
  const beats = useMemo(
    () => (category ? allBeats.filter(beat => beat.active !== false && inCategory(beat, category)) : []),
    [allBeats, category]
  )

  const range = bpmRange(beats)
  const producers = [...new Set(beats.map(b => (typeof b.producer === 'object' ? b.producer?.name : b.producer)).filter(Boolean))]
  const indexable = beats.length >= MIN_INDEXABLE

  usePageMeta({
    title: category ? `${category.title} — Comprar instrumentales` : undefined,
    description: category
      ? `${category.title}${range ? ` de ${range[0]} a ${range[1]} BPM` : ''}, producidos por el equipo de Other People Records. Escúchalos enteros y compra tu licencia (MP3, WAV o stems) al momento.`
      : undefined,
    url: category ? categoryPath(category) : undefined,
    // Mientras haya pocos beats, la página es pobre: fuera del índice.
    noindex: !loading && !indexable
  })

  useJsonLd(category && beats.length
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: category.title,
            url: `${SITE_URL}${categoryPath(category)}`,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: beats.length,
              itemListElement: beats.slice(0, 30).map((beat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE_URL}${beatPath(beat)}`,
                name: beat.title
              }))
            }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Beats', item: `${SITE_URL}/beats` },
              { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}${categoryPath(category)}` }
            ]
          }
        ]
      }
    : null)

  if (!category) return <NotFound />

  const others = BEAT_CATEGORIES.filter(c => c.slug !== category.slug)

  return (
    <>
      <section className="listing-page beats-category">
        <div className="listing-content">
        <div className="beats-page-header beats-category__header">
          <Breadcrumbs items={[
            { label: 'Inicio', to: '/' },
            { label: 'Beats', to: '/beats' },
            { label: category.name }
          ]} />
          <h1>{category.title}</h1>
          <div className="beats-category__intro">
            {category.intro.map((p, i) => <p key={i}>{p}</p>)}
            {!loading && beats.length > 0 && (
              <p className="beats-category__facts">
                {beats.length} {beats.length === 1 ? 'beat' : 'beats'}
                {range && ` · de ${range[0]} a ${range[1]} BPM`}
                {producers.length > 0 && ` · prod. ${producers.join(', ')}`}
              </p>
            )}
          </div>
        </div>

        {!loading && beats.length === 0
          ? (
            <p className="beats-category__empty">
              Todavía no hay beats en esta categoría. Mira el <Link to="/beats">catálogo completo</Link> o{' '}
              <Link to="/estudio/beats-a-medida">pide un beat a medida</Link>.
            </p>
            )
          : <Cards cards={beats} type="beat" loading={loading} />}

        <nav className="beats-category__others" aria-label="Otras categorías de beats">
          <h2>Otros estilos</h2>
          <ul>
            {others.map(c => (
              <li key={c.slug}><Link to={categoryPath(c)}>{c.title}</Link></li>
            ))}
            <li><Link to="/beats">Todos los beats</Link></li>
            <li><Link to="/estudio/beats-a-medida">Beats a medida</Link></li>
          </ul>
        </nav>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default BeatsCategoria
