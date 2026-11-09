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
 * Estados HTTP (importan: Google los usa para decidir qué indexa):
 *
 *   200  ficha encontrada.
 *   404  la API dice que no existe (o el id no es válido).
 *   410  beat desactivado: ya no está a la venta.
 *   503  la API ha fallado. NO es un 404: un fallo pasajero no debe hacer
 *        que Google dé la ficha por borrada.
 *
 * Los beats sin descripción propia se sirven con noindex (ver
 * BeatDetalle.jsx y api/sitemap.js, que aplican la misma regla).
 *
 * Los usuarios normales nunca llegan aquí: la reescritura filtra por
 * User-Agent.
 */

const API_URL = process.env.VITE_API_URL

const SITE_NAME = 'Other People Records'
const SITE_URL = 'https://www.otherpeople.es'
const LABEL_TAGLINE = 'sello independiente de trap y música urbana'

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1'
const ROBOTS_NOINDEX = 'noindex, follow'

/* -------------------------------------------------------------------------- */
/* Texto                                                                      */
/* -------------------------------------------------------------------------- */

/** Escape HTML special chars to avoid breaking the meta tags. */
function esc (str) {
  if (str == null || str === '') return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities (str) {
  return String(str || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

/**
 * HTML de Tiptap → texto plano, conservando párrafos y saltos de línea.
 * Antes se escapaba el HTML tal cual y Google leía «&lt;p style=…&gt;».
 */
function htmlToText (html) {
  if (!html) return ''
  const text = String(html)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6]|blockquote)\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
  return decodeEntities(text)
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Texto en una línea, cortado por palabra (para meta description). */
function excerpt (text, max = 155) {
  const flat = String(text || '').replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, '')}…`
}

/** Texto plano → párrafos HTML escapados (los saltos simples, como <br>). */
function paragraphsHtml (text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `    <p>${p.split('\n').map(esc).join('<br />')}</p>`)
    .join('\n')
}

/** «Hoodtrap, Reggaeton» → «hoodtrap y reggaeton». */
function genreLabel (genre) {
  const parts = String(genre || '').split(',').map(g => g.trim().toLowerCase()).filter(Boolean)
  if (parts.length <= 1) return parts[0] || ''
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`
}

/** Igual que beatSeoTitle de src/utils/seoText.js. */
function beatSeoTitle ({ title, genre, bpm, producerName }) {
  const genres = genreLabel(genre)
  const kind = `Beat${genres ? ` de ${genres}` : ''}${bpm ? ` ${bpm} BPM` : ''}`
  return `${title} — ${kind}${producerName ? ` (prod. ${producerName})` : ''}`
}

function formatDate (value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })
}

function formatPrice (value) {
  return `${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

/** Make sure the image URL is absolute. */
function toAbsoluteUrl (url, baseUrl) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function idOf (item) {
  return item?._id || item?.id || null
}

/* -------------------------------------------------------------------------- */
/* HTML                                                                       */
/* -------------------------------------------------------------------------- */

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
function buildSocialHtml ({ title, socialTitle, description, image, url, ogType }) {
  const shown = socialTitle || title

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(shown)} | ${SITE_NAME}</title>
${metaTags({ title: shown, description, image, url, ogType })}
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />

  <!-- Redirect human visitors who somehow reach this page -->
  <meta http-equiv="refresh" content="0;url=${esc(url)}" />
</head>
<body></body>
</html>`
}

/** Navegación común: enlaces a las páginas pilar. */
const SITE_NAV = `  <nav>
    <a href="${SITE_URL}/">${SITE_NAME}</a> ·
    <a href="${SITE_URL}/artistas">Artistas</a> ·
    <a href="${SITE_URL}/discografia">Discografía</a> ·
    <a href="${SITE_URL}/eventos">Conciertos y eventos</a> ·
    <a href="${SITE_URL}/beats">Beats</a> ·
    <a href="${SITE_URL}/estudios">Estudio de grabación</a> ·
    <a href="${SITE_URL}/booking-artistas">Booking de artistas</a> ·
    <a href="${SITE_URL}/contacto">Contacto</a>
  </nav>`

/** Página completa e indexable para buscadores. */
function buildIndexableHtml ({ title, h1, description, image, url, ogType, body, jsonLd, breadcrumb, robots = ROBOTS_INDEX }) {
  const blocks = [jsonLd, breadcrumb].filter(Boolean)
  const heading = h1 || title

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | ${SITE_NAME}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta name="robots" content="${robots}" />
${metaTags({ title, description, image, url, ogType })}
${blocks.map(b => `  <script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
  <main>
    <h1>${esc(heading)}</h1>
    ${image ? `<img src="${esc(image)}" alt="${esc(heading)}" width="600" />` : ''}
${body}
  </main>
${SITE_NAV}
</body>
</html>`
}

/** Página mínima para 404/410: el estado HTTP es lo que cuenta. */
function buildGoneHtml ({ status, listName, listPath }) {
  const message = status === 410
    ? 'Este contenido ya no está disponible.'
    : 'No hemos encontrado esta página.'
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${message} | ${SITE_NAME}</title>
  <meta name="robots" content="noindex, follow" />
</head>
<body>
  <main>
    <h1>${message}</h1>
    ${listPath ? `<p>Consulta el resto en <a href="${SITE_URL}${listPath}">${esc(listName)}</a>.</p>` : ''}
  </main>
${SITE_NAV}
</body>
</html>`
}

/** Lista de enlaces con un título de sección. */
function linkList (heading, items) {
  if (!items.length) return ''
  return `    <h2>${esc(heading)}</h2>
    <ul>
${items.map(({ href, label, note }) => `      <li><a href="${esc(href)}">${esc(label)}</a>${note ? ` — ${esc(note)}` : ''}</li>`).join('\n')}
    </ul>`
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

/* -------------------------------------------------------------------------- */
/* Datos relacionados (opcionales: si fallan, la ficha sale igual)            */
/* -------------------------------------------------------------------------- */

async function fetchJson (url) {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function listOf (payload) {
  const list = payload?.data ?? payload
  return Array.isArray(list) ? list : []
}

/** Lanzamientos y beats de un artista, para enlazarlos desde su ficha. */
async function fetchArtistExtras (artist) {
  const id = String(idOf(artist))
  const [releasesPayload, beatsPayload] = await Promise.all([
    artist.name
      ? fetchJson(`${API_URL}/releases/artist/${encodeURIComponent(artist.name)}?page=0&limit=12`)
      : null,
    fetchJson(`${API_URL}/beats?count=100&page=1&sortBy=createdAt&sortOrder=desc`)
  ])

  const releases = listOf(releasesPayload)
  const beats = listOf(beatsPayload).filter(beat => {
    if (beat.active === false) return false
    const producerId = beat.producer && typeof beat.producer === 'object' ? idOf(beat.producer) : beat.producer
    return producerId && String(producerId) === id
  })

  return { releases, beats }
}

/* -------------------------------------------------------------------------- */
/* Fichas                                                                     */
/* -------------------------------------------------------------------------- */

const RELEASE_TYPES = { Album: 'Álbum', EP: 'EP', Song: 'Single', Single: 'Single' }

function describeArtist (data, id, baseUrl, extras) {
  const name = data.name || 'Artista'
  const url = `${SITE_URL}/artistas/${id}`
  const image = toAbsoluteUrl(data.img, baseUrl)
  const genre = genreLabel(data.genre)
  const bio = (data.bio || '').trim()
  const facts = [data.artistType, data.genre, data.location].filter(Boolean).join(' · ')

  const title = genre ? `${name} — ${genre}` : name
  const description = bio
    ? excerpt(bio)
    : `${name}${facts ? ` — ${facts}` : ''}. Artista de ${SITE_NAME}, ${LABEL_TAGLINE}. Escucha su música y contrata su booking.`

  const links = [
    ['Spotify', data.spotifyLink],
    ['YouTube', data.youtubeLink],
    ['Apple Music', data.appleMusicLink],
    ['Instagram', data.instagramLink],
    ['SoundCloud', data.soundCloudLink],
    ['BeatStars', data.beatStarsLink]
  ].filter(([, href]) => href)

  const releases = extras.releases.map(release => ({
    href: release.spotifyLink || `${SITE_URL}/discografia`,
    label: release.title,
    note: [
      RELEASE_TYPES[release.releaseType] || release.releaseType,
      release.subtitle,
      release.date && new Date(release.date).getFullYear()
    ].filter(Boolean).join(' · ')
  }))

  const beats = extras.beats.slice(0, 12).map(beat => ({
    href: `${SITE_URL}/beats/${idOf(beat)}`,
    label: beat.title,
    note: [genreLabel(beat.genre), beat.bpm && `${beat.bpm} BPM`].filter(Boolean).join(' · ')
  }))

  const body = [
    bio ? paragraphsHtml(bio) : `    <p>${esc(description)}</p>`,
    linkList(`Lanzamientos de ${name}`, releases),
    linkList(`Beats producidos por ${name}`, beats),
    links.length
      ? `    <h2>Escucha a ${esc(name)}</h2>
    <ul>${links.map(([label, href]) => `<li><a href="${esc(href)}" rel="noopener">${label}</a></li>`).join('')}</ul>`
      : '',
    `    <p>Para contratar a ${esc(name)} para un concierto o un evento, escríbenos a través de <a href="${SITE_URL}/booking-artistas">booking de artistas</a>.</p>`
  ].filter(Boolean).join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name,
    url,
    image: image || undefined,
    description: bio ? excerpt(bio, 300) : undefined,
    genre: data.genre || undefined,
    recordLabel: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: `${SITE_URL}/` },
    album: extras.releases.length
      ? extras.releases.slice(0, 12).map(release => ({
          '@type': 'MusicAlbum',
          name: release.title,
          url: release.spotifyLink || undefined,
          image: release.img || undefined,
          datePublished: release.date ? String(release.date).slice(0, 10) : undefined
        }))
      : undefined,
    sameAs: links.map(([, href]) => href)
  }

  return {
    title,
    h1: name,
    socialTitle: name,
    description,
    image,
    url,
    ogType: 'profile',
    body,
    jsonLd,
    breadcrumb: buildBreadcrumb({ listName: 'Artistas', listPath: '/artistas', title: name, url })
  }
}

function describeEvent (data, id, baseUrl) {
  const name = data.name || 'Evento'
  const url = `${SITE_URL}/eventos/${id}`
  const image = toAbsoluteUrl(data.img || data.poster || data.image, baseUrl)
  const dateLabel = formatDate(data.date)
  const text = htmlToText(data.description)
  const whereWhen = [data.location, dateLabel].filter(Boolean).join(', ')

  // Hay varios eventos llamados «OTP!»: lugar y fecha hacen único el title.
  const title = whereWhen ? `${name} — ${whereWhen}` : name
  const description = text
    ? excerpt(text)
    : `${name}: ${[data.eventType, data.location, dateLabel].filter(Boolean).join(' · ')}. Evento de ${SITE_NAME}. Consulta la información y compra tu entrada.`

  const facts = [
    dateLabel && `<strong>Fecha:</strong> ${esc(dateLabel)}`,
    data.location && `<strong>Lugar:</strong> ${esc(data.location)}`,
    data.colaborators && `<strong>Con:</strong> ${esc(data.colaborators)}`
  ].filter(Boolean)

  const tickets = data.ticketsEnabled && data.ticketPrice > 0
    ? `    <p>Entradas a ${esc(formatPrice(data.ticketPrice))}${data.availableTickets > 0 ? '' : ' (agotadas)'}.</p>`
    : ''

  const body = [
    facts.length ? `    <p>${facts.join('<br />')}</p>` : '',
    text ? paragraphsHtml(text) : `    <p>${esc(description)}</p>`,
    tickets,
    `    <p>Organiza <a href="${SITE_URL}/">${SITE_NAME}</a>, ${LABEL_TAGLINE}. Consulta el resto de la agenda en <a href="${SITE_URL}/eventos">conciertos y eventos</a>.</p>`
  ].filter(Boolean).join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name,
    url,
    image: image || undefined,
    description: text ? excerpt(text, 300) : description,
    startDate: data.date || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: data.location
      ? { '@type': 'Place', name: data.location, address: data.location }
      : undefined,
    organizer: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: `${SITE_URL}/` }
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
    h1: name,
    socialTitle: name,
    description,
    image,
    url,
    ogType: 'article',
    body,
    jsonLd,
    breadcrumb: buildBreadcrumb({ listName: 'Eventos', listPath: '/eventos', title: name, url })
  }
}

function describeBeat (data, id, baseUrl) {
  const name = data.title || data.name || 'Beat'
  const url = `${SITE_URL}/beats/${id}`
  const image = toAbsoluteUrl(data.coverUrl || data.img, baseUrl)
  const producer = data.producer && typeof data.producer === 'object' ? data.producer : null
  const producerName = producer ? producer.name : data.producer
  const producerId = producer ? idOf(producer) : null
  const genre = genreLabel(data.genre)
  const own = (data.description || '').trim()

  const title = beatSeoTitle({ title: name, genre: data.genre, bpm: data.bpm, producerName })
  const facts = [
    producerName ? `Prod. ${producerName}` : null,
    data.genre,
    data.bpm ? `${data.bpm} BPM` : null,
    data.key
  ].filter(Boolean).join(' · ')
  const description = own
    ? excerpt(own)
    : `${name}${facts ? ` — ${facts}` : ''}. Beat disponible con licencia en ${SITE_NAME}.`

  const licenses = Array.isArray(data.licenses) ? data.licenses.filter(l => typeof l.price === 'number') : []
  const prices = licenses.length
    ? licenses.map(l => l.price)
    : (typeof data.price === 'number' ? [data.price] : [])
  const lowPrice = prices.length ? Math.min(...prices) : null
  const tags = Array.isArray(data.tags) ? data.tags.filter(Boolean) : []

  const specs = [
    producerName && `<strong>Productor:</strong> ${producerId ? `<a href="${SITE_URL}/artistas/${esc(producerId)}">${esc(producerName)}</a>` : esc(producerName)}`,
    genre && `<strong>Género:</strong> ${esc(genre)}`,
    data.bpm && `<strong>Tempo:</strong> ${esc(data.bpm)} BPM`,
    data.key && `<strong>Tonalidad:</strong> ${esc(data.key)}`,
    tags.length && `<strong>Etiquetas:</strong> ${tags.map(esc).join(', ')}`
  ].filter(Boolean)

  const licenseRows = licenses.map(l => `      <li>${esc(l.name)}: ${esc(formatPrice(l.price))}${Array.isArray(l.formats) && l.formats.length ? ` (${l.formats.map(esc).join(', ')})` : ''}</li>`)

  const body = [
    own ? paragraphsHtml(own) : `    <p>${esc(description)}</p>`,
    specs.length ? `    <p>${specs.join('<br />')}</p>` : '',
    licenseRows.length ? `    <h2>Licencias</h2>\n    <ul>\n${licenseRows.join('\n')}\n    </ul>` : '',
    `    <p>Escucha el resto del catálogo en <a href="${SITE_URL}/beats">beats de trap, drill y reggaetón</a>.</p>`
  ].filter(Boolean).join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    url,
    image: image || undefined,
    description: own ? excerpt(own, 300) : description,
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
    h1: name,
    socialTitle: name,
    description,
    image,
    url,
    ogType: 'music.song',
    body,
    jsonLd,
    breadcrumb: buildBreadcrumb({ listName: 'Beats', listPath: '/beats', title: name, url }),
    // Sin descripción propia la ficha es casi idéntica a las demás: fuera
    // del índice hasta que la tenga (misma regla que en el sitemap).
    robots: own ? ROBOTS_INDEX : ROBOTS_NOINDEX
  }
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

const TYPES = {
  artists: { endpoint: 'artists', listName: 'Artistas', listPath: '/artistas' },
  events: { endpoint: 'events', listName: 'Eventos', listPath: '/eventos' },
  beats: { endpoint: 'beats', listName: 'Beats', listPath: '/beats' }
}

function sendGone (res, status, config) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Robots-Tag', 'noindex')
  // Se cachea menos que una ficha: si se reactiva, que se note pronto.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600')
  res.status(status).send(buildGoneHtml({ status, ...config }))
}

function sendUnavailable (res, retryAfter) {
  res.setHeader('Retry-After', String(retryAfter))
  res.setHeader('Cache-Control', 'no-store')
  res.status(503).send('Service unavailable')
}

export default async function handler (req, res) {
  const { type, id, mode } = req.query
  const config = TYPES[type]

  if (!config || !id) {
    sendGone(res, 404, {})
    return
  }

  if (!API_URL) {
    console.error('[og] VITE_API_URL no está definida')
    sendUnavailable(res, 3600)
    return
  }

  let data
  try {
    const response = await fetch(`${API_URL}/${config.endpoint}/${encodeURIComponent(id)}`)
    // 400/404: el id no existe o no es válido. Cualquier otro error es nuestro.
    if (response.status === 404 || response.status === 400) {
      sendGone(res, 404, config)
      return
    }
    if (!response.ok) throw new Error(`API ${response.status}`)

    const payload = await response.json()
    // Según el endpoint, la entidad viene suelta o envuelta en { data }.
    data = payload?.data ?? payload
  } catch (err) {
    console.error('[og] Error fetching entity:', err.message)
    sendUnavailable(res, 300)
    return
  }

  if (!data || typeof data !== 'object') {
    sendGone(res, 404, config)
    return
  }

  if (type === 'beats' && data.active === false) {
    sendGone(res, 410, config)
    return
  }

  // Detect base URL from Vercel env or request host
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const baseUrl = `${protocol}://${host}`

  let meta
  if (type === 'artists') {
    // Los enlaces a lanzamientos y beats solo interesan al buscador.
    const extras = mode === 'index'
      ? await fetchArtistExtras(data)
      : { releases: [], beats: [] }
    meta = describeArtist(data, id, baseUrl, extras)
  } else if (type === 'events') {
    meta = describeEvent(data, id, baseUrl)
  } else {
    meta = describeBeat(data, id, baseUrl)
  }

  const html = mode === 'index'
    ? buildIndexableHtml(meta)
    : buildSocialHtml(meta)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (mode === 'index' && meta.robots === ROBOTS_NOINDEX) {
    res.setHeader('X-Robots-Tag', 'noindex')
  }
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(html)
}
