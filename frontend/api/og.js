/**
 * Vercel Serverless Function — HTML para crawlers en las páginas de detalle.
 *
 * La web es una SPA: sin JavaScript, /artistas/:id devuelve un <div id="root">
 * vacío. Vercel reescribe aquí las peticiones de bots (ver vercel.json) y
 * nosotros devolvemos HTML ya montado con los datos de la API.
 *
 * Hay dos modos, porque un buscador y un crawler social no quieren lo mismo:
 *
 *   mode=social  Tarjeta mínima con og:/twitter: y un meta refresh a la URL
 *                real. Es lo que necesitan WhatsApp, Telegram, Discord…
 *   mode=index   Página completa e indexable: <h1>, texto, imagen, enlaces
 *                internos, canonical y JSON-LD. SIN meta refresh — para
 *                Googlebot un refresh a la misma URL es un bucle de
 *                redirecciones y la página nunca llega a indexarse.
 *
 * Los usuarios normales nunca llegan aquí: la reescritura filtra por
 * User-Agent.
 */

const API_URL = process.env.VITE_API_URL

const SITE_NAME = 'Other People Records'
const SITE_URL = 'https://www.otherpeople.es'

/** Escape HTML special chars to avoid breaking the meta tags. */
function esc (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Make sure the image URL is absolute. */
function toAbsoluteUrl (url, baseUrl) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Relative path — prefix with baseUrl
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Cabeceras og:/twitter: comunes a los dos modos. */
function metaTags ({ title, description, image, url, ogType }) {
  const safeTitle = esc(title)
  const safeDesc = esc(description)
  const safeImage = esc(image)
  const safeUrl = esc(url)

  return `  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="es_ES" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />`
}

/** Tarjeta mínima para crawlers sociales (con redirección para humanos). */
function buildSocialHtml ({ title, description, image, url, ogType }) {
  const fullTitle = `${esc(title)} | ${SITE_NAME}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${fullTitle}</title>
${metaTags({ title, description, image, url, ogType })}
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />

  <!-- Redirect human visitors who somehow reach this page -->
  <meta http-equiv="refresh" content="0;url=${esc(url)}" />
</head>
<body></body>
</html>`
}

/** Página completa e indexable para buscadores. */
function buildIndexableHtml ({ title, description, image, url, ogType, body, jsonLd, breadcrumb }) {
  const fullTitle = `${esc(title)} | ${SITE_NAME}`
  const blocks = [jsonLd, breadcrumb].filter(Boolean)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
${metaTags({ title, description, image, url, ogType })}
${blocks.map(b => `  <script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n')}
</head>
<body>
  <main>
    <h1>${esc(title)}</h1>
    ${image ? `<img src="${esc(image)}" alt="${esc(title)}" width="600" />` : ''}
    <p>${esc(description)}</p>
${body}
  </main>
  <nav>
    <a href="${SITE_URL}/">${SITE_NAME}</a> ·
    <a href="${SITE_URL}/artistas">Artistas</a> ·
    <a href="${SITE_URL}/eventos">Eventos</a> ·
    <a href="${SITE_URL}/beats">Beats</a> ·
    <a href="${SITE_URL}/discografica-barcelona">Discográfica en Barcelona</a> ·
    <a href="${SITE_URL}/booking-artistas">Booking de artistas</a>
  </nav>
</body>
</html>`
}

/** Migas de pan comunes a las tres fichas. */
function buildBreadcrumb ({ listName, listPath, title, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: listName, item: `${SITE_URL}${listPath}` },
      { '@type': 'ListItem', position: 3, name: title, item: url }
    ]
  }
}

/** Construye título, descripción, cuerpo y JSON-LD según el tipo de ficha. */
function describe (type, data, id, baseUrl) {
  switch (type) {
    case 'artists': {
      const title = data.name || 'Artista'
      const url = `${SITE_URL}/artistas/${id}`
      const image = toAbsoluteUrl(data.img, baseUrl)
      const facts = [data.artistType, data.genre, data.location].filter(Boolean).join(' · ')
      const description = facts
        ? `${title} — ${facts}. Artista de ${SITE_NAME}, sello discográfico independiente en Barcelona.`
        : `${title}, artista de ${SITE_NAME}, sello discográfico independiente en Barcelona.`

      const links = [
        ['Spotify', data.spotifyLink],
        ['YouTube', data.youtubeLink],
        ['Apple Music', data.appleMusicLink],
        ['Instagram', data.instagramLink],
        ['SoundCloud', data.soundCloudLink]
      ].filter(([, href]) => href)

      const body = `    <p>Escucha su música y consulta sus próximos conciertos. Para contratar a ${esc(title)}, escríbenos a través de <a href="${SITE_URL}/booking-artistas">booking de artistas</a>.</p>
    ${links.length ? `<ul>${links.map(([label, href]) => `<li><a href="${esc(href)}" rel="noopener">${label}</a></li>`).join('')}</ul>` : ''}`

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MusicGroup',
        name: title,
        url,
        image: image || undefined,
        genre: data.genre || undefined,
        recordLabel: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
        sameAs: links.map(([, href]) => href)
      }

      return {
        title,
        description,
        image,
        url,
        ogType: 'profile',
        body,
        jsonLd,
        breadcrumb: buildBreadcrumb({ listName: 'Artistas', listPath: '/artistas', title, url })
      }
    }

    case 'events': {
      const title = data.name || 'Evento'
      const url = `${SITE_URL}/eventos/${id}`
      const image = toAbsoluteUrl(data.img || data.poster || data.image, baseUrl)
      const dateLabel = data.date
        ? new Date(data.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
        : null
      const description = data.description ||
        [data.location, data.eventType, dateLabel].filter(Boolean).join(' · ') ||
        `Evento de ${SITE_NAME}`

      const body = `    <p>${[dateLabel && `Fecha: ${esc(dateLabel)}`, data.location && `Lugar: ${esc(data.location)}`].filter(Boolean).join('. ')}</p>
    <p>Organiza <a href="${SITE_URL}/">${SITE_NAME}</a>. Consulta el resto de la agenda en <a href="${SITE_URL}/eventos">eventos</a>.</p>`

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MusicEvent',
        name: title,
        url,
        image: image || undefined,
        description,
        startDate: data.date || undefined,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: data.location
          ? { '@type': 'Place', name: data.location, address: data.location }
          : undefined,
        organizer: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` }
      }

      // Solo declaramos oferta si de verdad se venden entradas.
      if (data.ticketsEnabled && data.ticketPrice > 0) {
        jsonLd.offers = {
          '@type': 'Offer',
          url: data.externalTicketUrl || url,
          price: String(data.ticketPrice),
          priceCurrency: data.ticketCurrency || 'EUR',
          availability: data.availableTickets > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut'
        }
      }

      return {
        title,
        description,
        image,
        url,
        ogType: 'article',
        body,
        jsonLd,
        breadcrumb: buildBreadcrumb({ listName: 'Eventos', listPath: '/eventos', title, url })
      }
    }

    case 'beats': {
      const title = data.title || data.name || 'Beat'
      const url = `${SITE_URL}/beats/${id}`
      const image = toAbsoluteUrl(data.coverUrl || data.img, baseUrl)
      const producerName = typeof data.producer === 'object' ? data.producer?.name : data.producer
      const facts = [
        producerName ? `Prod. ${producerName}` : null,
        data.genre,
        data.bpm ? `${data.bpm} BPM` : null,
        data.key
      ].filter(Boolean).join(' · ')
      const description = `${title}${facts ? ` — ${facts}` : ''}. Beat disponible con licencia en ${SITE_NAME}.`

      const body = `    <p>Instrumental de ${esc(data.genre || 'música urbana')} disponible para licenciar. Escucha el resto del catálogo en <a href="${SITE_URL}/beats">beats</a>.</p>`

      // El precio de referencia es el de la licencia más barata.
      const prices = Array.isArray(data.licenses) && data.licenses.length
        ? data.licenses.map(l => l.price).filter(p => typeof p === 'number')
        : (typeof data.price === 'number' ? [data.price] : [])
      const lowPrice = prices.length ? Math.min(...prices) : null

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        url,
        image: image || undefined,
        description,
        category: data.genre || 'Beat',
        brand: { '@type': 'Organization', name: SITE_NAME },
        offers: lowPrice != null
          ? {
              '@type': 'Offer',
              url,
              price: String(lowPrice),
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock'
            }
          : undefined
      }

      return {
        title,
        description,
        image,
        url,
        ogType: 'music.song',
        body,
        jsonLd,
        breadcrumb: buildBreadcrumb({ listName: 'Beats', listPath: '/beats', title, url })
      }
    }

    default:
      return null
  }
}

export default async function handler (req, res) {
  const { type, id, mode } = req.query

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

    const payload = await response.json()
    // Según el endpoint, la entidad viene suelta o envuelta en { data }.
    const data = payload?.data ?? payload

    // Detect base URL from Vercel env or request host
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = `${protocol}://${host}`

    const meta = describe(type, data, id, baseUrl)
    if (!meta) {
      res.status(404).send('Not found')
      return
    }

    const html = mode === 'index'
      ? buildIndexableHtml(meta)
      : buildSocialHtml(meta)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch (err) {
    console.error('[og] Error fetching entity:', err.message)
    res.status(404).send('Not found')
  }
}
