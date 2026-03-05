/**
 * Vercel Serverless Function — Open Graph meta tags for social sharing.
 *
 * When a social-media crawler (WhatsApp, Twitter, Facebook, Discord, etc.)
 * requests a detail page, Vercel rewrites the request here.
 * We fetch the entity from the backend API and return a minimal HTML page
 * with the correct og: / twitter: meta tags so the crawler renders a rich card.
 *
 * Regular users never hit this endpoint (the rewrite has a User-Agent condition).
 */

const API_URL = process.env.VITE_API_URL

const SITE_NAME = 'Other People Records'

/** Escape HTML special chars to avoid breaking the meta tags. */
function esc (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Build a full HTML page with Open Graph + Twitter Card meta tags. */
function buildOgHtml ({ title, description, image, url }) {
  const safeTitle = esc(title)
  const safeDesc = esc(description)
  const fullTitle = `${safeTitle} | ${SITE_NAME}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${fullTitle}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${esc(image)}" />

  <!-- Redirect human visitors who somehow reach this page -->
  <meta http-equiv="refresh" content="0;url=${esc(url)}" />
</head>
<body></body>
</html>`
}

export default async function handler (req, res) {
  const { type, id } = req.query

  if (!type || !id || !API_URL) {
    res.status(404).send('Not found')
    return
  }

  const endpoints = {
    artists: `${API_URL}/artists/${id}`,
    events: `${API_URL}/events/${id}`,
    beats: `${API_URL}/beats/${id}`
  }

  const endpoint = endpoints[type]
  if (!endpoint) {
    res.status(404).send('Not found')
    return
  }

  try {
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error(`API ${response.status}`)

    const data = await response.json()

    // Detect base URL from Vercel env or request host
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = `${protocol}://${host}`

    let title, description, image, url

    switch (type) {
      case 'artists':
        title = data.name || 'Artista'
        description = [data.genre, data.artistType, data.location]
          .filter(Boolean).join(' · ') || `Descubre a ${title} en ${SITE_NAME}`
        image = data.img || ''
        url = `${baseUrl}/artistas/${id}`
        break

      case 'events':
        title = data.name || 'Evento'
        description = [
          data.location,
          data.eventType,
          data.date
            ? new Date(data.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            : null
        ].filter(Boolean).join(' · ') || `Evento en ${SITE_NAME}`
        image = data.img || ''
        url = `${baseUrl}/eventos/${id}`
        break

      case 'beats': {
        title = data.title || data.name || 'Beat'
        const producerName = typeof data.producer === 'object'
          ? data.producer?.name
          : data.producer
        description = [
          producerName ? `Prod. ${producerName}` : null,
          data.genre,
          data.bpm ? `${data.bpm} BPM` : null,
          data.key
        ].filter(Boolean).join(' · ') || `Beat en ${SITE_NAME}`
        image = data.coverUrl || data.img || ''
        url = `${baseUrl}/beats/${id}`
        break
      }
    }

    const html = buildOgHtml({ title, description, image, url })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch (err) {
    console.error('[og] Error fetching entity:', err.message)
    res.status(404).send('Not found')
  }
}
