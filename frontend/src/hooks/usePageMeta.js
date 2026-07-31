import { useEffect } from 'react'

const SITE_NAME = 'Other People Records'
const SITE_URL = 'https://www.otherpeople.es'
const DEFAULT_IMAGE = '/img/hero/portada1.png'

/** Convierte una ruta relativa en URL absoluta del sitio. */
function absolute (path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Hook to update <head> meta tags (document title, canonical, Open Graph,
 * Twitter Card and robots) for the current page.  Cleans up on unmount so
 * tags don't leak between routes.
 *
 * @param {object}  meta
 * @param {string}  meta.title           Título de la página (sin el nombre del sitio).
 * @param {string} [meta.description]    Meta description.
 * @param {string} [meta.image]          Imagen para OG/Twitter (relativa o absoluta).
 * @param {string} [meta.url]            URL canónica; por defecto la actual.
 * @param {string} [meta.type]           og:type ('website', 'article', 'music.song'…).
 * @param {boolean}[meta.noindex]        Si true, marca la página como noindex,nofollow.
 * @param {boolean}[meta.appendSiteName] Si false, usa el título tal cual.
 */
export function usePageMeta ({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
  appendSiteName = true
} = {}) {
  useEffect(() => {
    if (!title) return

    // --- document title ---
    const prevTitle = document.title
    document.title = appendSiteName ? `${title} | ${SITE_NAME}` : title

    // --- helper: upsert a <meta> tag ---
    const created = []
    const previous = []

    function setMeta (attr, key, content) {
      if (!content) return
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (el) {
        previous.push({ el, old: el.getAttribute('content') })
        el.setAttribute('content', content)
      } else {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        el.setAttribute('content', content)
        document.head.appendChild(el)
        created.push(el)
      }
    }

    // La URL canónica nunca lleva query ni hash: son la misma página para Google.
    const pageUrl = url
      ? absolute(url)
      : `${SITE_URL}${window.location.pathname}`
    const pageImage = absolute(image || DEFAULT_IMAGE)

    // --- canonical ---
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    const prevCanonical = canonicalEl ? canonicalEl.getAttribute('href') : null
    const canonicalCreated = !canonicalEl
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', pageUrl)

    // --- robots ---
    setMeta(
      'name',
      'robots',
      // 'follow' aunque sea noindex: los enlaces internos de estas páginas
      // (p. ej. /l/:slug apuntando a la ficha del artista) siguen sumando.
      noindex
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )

    // Open Graph
    setMeta('property', 'og:title', document.title)
    setMeta('property', 'og:description', description || '')
    setMeta('property', 'og:image', pageImage)
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'es_ES')

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', document.title)
    setMeta('name', 'twitter:description', description || '')
    setMeta('name', 'twitter:image', pageImage)

    // Standard description
    setMeta('name', 'description', description || '')

    // --- cleanup: restore previous values or remove created tags ---
    return () => {
      document.title = prevTitle
      created.forEach(el => el.remove())
      previous.forEach(({ el, old }) => {
        if (old != null) el.setAttribute('content', old)
      })
      if (canonicalCreated) {
        canonicalEl.remove()
      } else if (prevCanonical != null) {
        canonicalEl.setAttribute('href', prevCanonical)
      }
    }
  }, [title, description, image, url, type, noindex, appendSiteName])
}

export { SITE_NAME, SITE_URL, absolute as absoluteUrl }
