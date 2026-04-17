import { useEffect } from 'react'

const SITE_NAME = 'Other People Records'
const DEFAULT_IMAGE = '/img/logoLowRes.webp'

/**
 * Hook to update <head> meta tags (document title + Open Graph + Twitter Card)
 * for the current page.  Cleans up on unmount so tags don't leak.
 *
 * @param {{ title?: string, description?: string, image?: string, url?: string }} meta
 */
export function usePageMeta ({ title, description, image, url } = {}) {
  useEffect(() => {
    if (!title) return

    // --- document title ---
    const prevTitle = document.title
    document.title = `${title} | ${SITE_NAME}`

    // --- helper: upsert a <meta> tag ---
    const created = []
    const previous = []

    function setMeta (attr, key, content) {
      if (!content) return
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (el) {
        previous.push({ el, attr, key, old: el.getAttribute('content') })
        el.setAttribute('content', content)
      } else {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        el.setAttribute('content', content)
        document.head.appendChild(el)
        created.push(el)
      }
    }

    const pageUrl = url || window.location.href
    const pageImage = image || DEFAULT_IMAGE

    // Open Graph
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description || '')
    setMeta('property', 'og:image', pageImage)
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
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
    }
  }, [title, description, image, url])
}
