import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useBeats } from '../hooks/useBeats'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { Cards } from '../components/CardList/CardList'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import { SeoButton, SeoChips, SeoSection } from '../components/SeoPage/SeoBlocks'
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
        <header className="beats-category__header">
          <Breadcrumbs
            align="center"
            items={[
              { label: 'Inicio', to: '/' },
              { label: 'Beats', to: '/beats' },
              { label: category.name }
            ]}
          />
          <span className="seo-eyebrow">Catálogo de beats</span>
          <h1 className="beats-category__title">{category.title}</h1>
          <div className="seo-accent" aria-hidden="true" />
          <div className="beats-category__intro">
            {category.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {!loading && beats.length > 0 && (
            <ul className="beats-category__facts" aria-label="Resumen de la categoría">
              <li><strong>{beats.length}</strong> {beats.length === 1 ? 'beat' : 'beats'}</li>
              {range && <li><strong>{range[0]}–{range[1]}</strong> BPM</li>}
              {producers.length > 0 && <li>Prod. <strong>{producers.join(', ')}</strong></li>}
            </ul>
          )}
        </header>

        {!loading && beats.length === 0
          ? (
            <div className="beats-category__empty">
              <p>Todavía no hay beats en esta categoría.</p>
              <div className="seo-actions">
                <SeoButton to="/beats" variant="secondary">Ver todo el catálogo</SeoButton>
                <SeoButton to="/estudio/beats-a-medida" icon="arrow-right">Pedir un beat a medida</SeoButton>
              </div>
            </div>
            )
          : <Cards cards={beats} type="beat" loading={loading} />}

        <div className="beats-category__others">
          <SeoSection title="Otros estilos" intro="¿No es lo que buscas? Hay más sonidos en el catálogo, o te hacemos uno a medida.">
            <SeoChips
              items={[
                ...others.map(c => ({ key: c.slug, to: categoryPath(c), label: c.title })),
                { key: 'todos', to: '/beats', label: 'Todos los beats' },
                { key: 'a-medida', to: '/estudio/beats-a-medida', label: 'Beats a medida' }
              ]}
            />
          </SeoSection>
        </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default BeatsCategoria
