import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { useReleases } from '../hooks/useReleases'
import { STUDIO_SERVICES, STUDIO_LOCATION, findStudioService, studioServicePath } from '../data/studioServices'
import { BEAT_CATEGORIES, categoryPath } from '../data/beatCategories'
import { releasePath } from '../utils/paths'
import { trackEvent } from '../utils/analytics'
import NotFound from './NotFound'

const SITE_URL = 'https://www.otherpeople.es'

/** Bloque de contenido de un servicio: texto, lista con título o pasos. */
function Section ({ section }) {
  return (
    <>
      <h2>{section.h2}</h2>
      {section.text && <p>{section.text}</p>}
      {section.list && (
        <ul>
          {section.list.map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}
        </ul>
      )}
      {section.steps && (
        <ol className="seo-steps">
          {section.steps.map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}
        </ol>
      )}
    </>
  )
}

/**
 * Página de un servicio del estudio (/estudio/produccion-musical, …). El
 * contenido sale de src/data/studioServices.js.
 */
function EstudioServicio () {
  const { pathname } = useLocation()
  const service = findStudioService(pathname.split('/')[2])
  const { releases } = useReleases({ count: 50, sortBy: 'date', sortOrder: 'desc' })

  // Portfolio: lanzamientos con un crédito de este servicio hecho en casa.
  const portfolio = useMemo(() => {
    if (!service) return []
    return releases
      .filter(r => (r.credits || []).some(c => c.inHouse && service.creditRoles.includes(c.role)))
      .slice(0, 8)
  }, [releases, service])

  if (!service) return <NotFound />

  const others = STUDIO_SERVICES.filter(s => s.slug !== service.slug)

  return (
    <SeoPage
      path={studioServicePath(service)}
      title={service.title}
      description={service.description}
      eyebrow="Estudio"
      h1={service.h1}
      lead={service.lead}
      crumbs={[{ label: 'Estudio', to: '/estudio' }, { label: service.name }]}
      faq={service.faq}
      cta={{
        title: 'Pide presupuesto',
        text: 'Cuéntanos qué necesitas y te pasamos un presupuesto cerrado antes de empezar.',
        to: '/estudio?reservar=1',
        label: 'Reservar o pedir presupuesto',
        onClick: () => trackEvent('estudio-presupuesto', { servicio: service.slug })
      }}
      jsonLd={[{
        '@type': 'Service',
        name: service.name,
        serviceType: service.serviceType,
        description: service.description,
        url: `${SITE_URL}${studioServicePath(service)}`,
        provider: { '@id': `${SITE_URL}/#estudio` },
        areaServed: service.online
          ? { '@type': 'Country', name: 'España' }
          : [
              { '@type': 'AdministrativeArea', name: 'Anoia' },
              { '@type': 'AdministrativeArea', name: 'Alt Penedès' },
              { '@type': 'AdministrativeArea', name: 'Barcelona' }
            ],
        availableChannel: service.online
          ? { '@type': 'ServiceChannel', serviceUrl: `${SITE_URL}${studioServicePath(service)}`, name: 'Online y en el estudio' }
          : undefined
      }]}
    >
      {service.sections.map(section => <Section key={section.h2} section={section} />)}

      {service.slug === 'beats-a-medida' && (
        <p>
          Catálogo por estilos:{' '}
          {BEAT_CATEGORIES.map((c, i) => (
            <span key={c.slug}>{i > 0 && ' · '}<Link to={categoryPath(c)}>{c.name}</Link></span>
          ))}.
        </p>
      )}

      {portfolio.length > 0 && (
        <>
          <h2>Trabajos hechos en el estudio</h2>
          <ul>
            {portfolio.map(release => (
              <li key={release.id}>
                <Link to={releasePath(release)}>{release.title}</Link>
                {release.subtitle && <span> · {release.subtitle}</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Dónde estamos</h2>
      <p>
        El estudio está en la{' '}
        <a href={STUDIO_LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer">{STUDIO_LOCATION.name}</a>, en{' '}
        {STUDIO_LOCATION.town} ({STUDIO_LOCATION.province}), a una hora de Barcelona.
        {service.online && ' Para artistas de fuera, el servicio funciona igual online.'}{' '}
        Más detalles en la página del <Link to="/estudio">estudio</Link>.
      </p>

      <h2>Otros servicios del estudio</h2>
      <ul className="seo-cards">
        {others.map(s => (
          <li key={s.slug}>
            <Link to={studioServicePath(s)} className="seo-card">
              <strong>{s.name}</strong>
              <span>{s.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SeoPage>
  )
}

export default EstudioServicio
