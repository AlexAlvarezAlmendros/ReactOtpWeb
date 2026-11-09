import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useJsonLd } from '../../hooks/useJsonLd'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'
import Footer from '../Footer/Footer'
import GlassSurface from '../GlassSurface'
import '../../pages/Landing.css'

const SITE_URL = 'https://www.otherpeople.es'

/**
 * Plantilla de las páginas de contenido (pilares y servicios): cabecera,
 * migas de pan, cuerpo, preguntas frecuentes, llamada a la acción y JSON-LD
 * (WebPage + BreadcrumbList + FAQPage + lo que añada la página).
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
    <>
      <article className="seo-landing">
        <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, ...crumbs]} />
        {eyebrow && <span className="seo-landing__eyebrow">{eyebrow}</span>}
        <h1>{h1}</h1>
        {lead && <p className="seo-landing__lead">{lead}</p>}

        {children}

        {faq.length > 0 && (
          <>
            <h2>Preguntas frecuentes</h2>
            <div className="seo-faq">
              {faq.map(({ q, a }) => (
                <div className="seo-faq__item" key={q}>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {cta && (
          <GlassSurface as="section" className="seo-cta" borderRadius={16}>
            <h2>{cta.title}</h2>
            {cta.text && <p>{cta.text}</p>}
            {cta.href
              ? <a href={cta.href} className="seo-cta__button" onClick={cta.onClick}>{cta.label}</a>
              : <Link to={cta.to} className="seo-cta__button" onClick={cta.onClick}>{cta.label}</Link>}
          </GlassSurface>
        )}
      </article>
      <Footer />
    </>
  )
}
