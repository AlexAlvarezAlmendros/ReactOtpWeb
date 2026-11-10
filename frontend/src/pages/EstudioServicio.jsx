import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { SeoChips, SeoFeatures, SeoLocation, SeoProse, SeoSection, SeoSteps } from '../components/SeoPage/SeoBlocks'
import { useReleases } from '../hooks/useReleases'
import { STUDIO_SERVICES, STUDIO_LOCATION, findStudioService, studioServicePath } from '../data/studioServices'
import { BEAT_CATEGORIES, categoryPath } from '../data/beatCategories'
import { releasePath } from '../utils/paths'
import { trackEvent } from '../utils/analytics'
import NotFound from './NotFound'

const SITE_URL = 'https://www.otherpeople.es'

const LOCATION_H2 = 'Dónde estamos'

/** Bloque de contenido de un servicio: texto, tarjetas (list) o pasos (steps). */
function Section ({ section }) {
  return (
    <SeoSection title={section.h2}>
      {section.list && (
        <SeoFeatures items={section.list.map(([title, text, icon]) => ({ title, text, icon: icon || 'check' }))} />
      )}
      {section.steps && (
        <SeoSteps items={section.steps.map(([title, text]) => ({ title, text }))} />
      )}
      {section.text && <SeoProse><p>{section.text}</p></SeoProse>}
    </SeoSection>
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
  const locationNote = service.sections.find(section => section.h2 === LOCATION_H2)?.text
  const budget = () => trackEvent('estudio-presupuesto', { servicio: service.slug })

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
        onClick: budget
      }}
      actions={[
        { label: 'Pedir presupuesto', to: '/estudio?reservar=1', icon: 'arrow-right', onClick: budget },
        { label: 'Ver el estudio', to: '/estudio', variant: 'secondary' }
      ]}
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
      {service.sections
        .filter(section => section.h2 !== LOCATION_H2)
        .map(section => <Section key={section.h2} section={section} />)}

      {service.slug === 'beats-a-medida' && (
        <SeoSection title="Catálogo por estilos" intro="Si prefieres empezar hoy, cualquier beat del catálogo se licencia al momento.">
          <SeoChips items={BEAT_CATEGORIES.map(c => ({ key: c.slug, to: categoryPath(c), label: c.name }))} />
        </SeoSection>
      )}

      {portfolio.length > 0 && (
        <SeoSection title="Trabajos hechos en el estudio">
          <SeoChips
            items={portfolio.map(release => ({
              key: release.id,
              to: releasePath(release),
              label: release.title,
              meta: release.subtitle,
              img: release.img
            }))}
          />
        </SeoSection>
      )}

      <SeoSection title={LOCATION_H2}>
        <SeoLocation
          name={STUDIO_LOCATION.name}
          place={`${STUDIO_LOCATION.town} (${STUDIO_LOCATION.province}), a una hora de Barcelona.`}
          mapsUrl={STUDIO_LOCATION.mapsUrl}
          note={locationNote}
        />
        <SeoProse>
          <p>
            {service.online && 'Para artistas de fuera, el servicio funciona igual online. '}
            Más detalles en la página del <Link to="/estudio">estudio</Link>.
          </p>
        </SeoProse>
      </SeoSection>

      <SeoSection title="Otros servicios del estudio">
        <SeoFeatures
          more="Ver servicio"
          items={others.map(s => ({ icon: s.icon, title: s.name, text: s.short, to: studioServicePath(s) }))}
        />
      </SeoSection>
    </SeoPage>
  )
}

export default EstudioServicio
