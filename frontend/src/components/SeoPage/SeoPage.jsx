import { usePageMeta } from '../../hooks/usePageMeta'
import { useJsonLd } from '../../hooks/useJsonLd'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import Footer from '../Footer/Footer'
import { SeoButton, SeoCta, SeoFaq, SeoSection } from './SeoBlocks'
import '../../pages/Landing.css'

const SITE_URL = 'https://www.otherpeople.es'

/**
 * Plantilla de las páginas de contenido (pilares y servicios): cabecera
 * centrada como la de Estudio o Contacto, migas de pan, cuerpo hecho con los
 * bloques de SeoBlocks, preguntas frecuentes, llamada a la acción y JSON-LD
 * (WebPage + BreadcrumbList + FAQPage + lo que añada la página).
 *
 * `actions`: botones bajo la entradilla ({ label, to | href, variant, icon }).
 * `hero`: algo más dentro de la cabecera, como la franja de cifras.
 *
 * Las FAQ ya no dan resultado enriquecido en Google (solo webs de gobierno y
 * salud desde 2023), pero siguen sirviendo como contenido y para la búsqueda
 * con IA.
 */
export default function SeoPage ({
  path,
  title,
  description,
  eyebrow,
  h1,
  lead,
  crumbs = [],
  actions = [],
  hero,
  faq = [],
  cta,
  jsonLd = [],
  image,
  children
}) {
  usePageMeta({ title, description, url: path, image })

  const url = `${SITE_URL}${path}`
  useJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: 'es-ES',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [{ label: 'Inicio', to: '/' }, ...crumbs].map((crumb, i, all) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
          item: `${SITE_URL}${i === all.length - 1 ? path : crumb.to}`
        }))
      },
      ...(faq.length
        ? [{
            '@type': 'FAQPage',
            mainEntity: faq.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a }
            }))
          }]
        : []),
      ...jsonLd
    ]
  })

  return (
    <SeoLayout
      eyebrow={eyebrow}
      h1={h1}
      lead={lead}
      crumbs={crumbs}
      actions={actions}
      hero={hero}
      faq={faq}
      cta={cta}
    >
      {children}
    </SeoLayout>
  )
}

/**
 * Solo la parte visual de SeoPage, para las páginas que ya montan sus propios
 * metadatos y JSON-LD (discográfica en Barcelona, booking).
 */
export function SeoLayout ({ eyebrow, h1, lead, crumbs = [], actions = [], hero, faq = [], cta, children }) {
  return (
    <>
      <article className="seo-page">
        <header className="seo-hero">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, ...crumbs]} align="center" />
          {eyebrow && <span className="seo-eyebrow">{eyebrow}</span>}
          <h1 className="seo-hero__title">{h1}</h1>
          <div className="seo-accent seo-accent--hero" aria-hidden="true" />
          {lead && <p className="seo-hero__lead">{lead}</p>}
          {actions.length > 0 && (
            <div className="seo-actions">
              {actions.map(({ label, ...action }) => (
                <SeoButton key={label} {...action}>{label}</SeoButton>
              ))}
            </div>
          )}
          {hero}
        </header>

        <div className="seo-body">
          {children}

          {faq.length > 0 && (
            <SeoSection title="Preguntas frecuentes">
              <SeoFaq items={faq} />
            </SeoSection>
          )}

          {cta && <SeoCta {...cta} />}
        </div>
      </article>
      <Footer />
    </>
  )
}
