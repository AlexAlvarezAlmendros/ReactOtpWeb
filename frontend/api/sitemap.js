/**
 * Vercel Serverless Function — sitemaps.
 *
 *   /sitemap.xml               índice de sitemaps
 *   /sitemap-paginas.xml       páginas fijas y categorías de beats
 *   /sitemap-artistas.xml      fichas de artista (con imagen)
 *   /sitemap-eventos.xml       fichas de evento (con imagen)
 *   /sitemap-lanzamientos.xml  fichas de lanzamiento (con portada)
 *   /sitemap-beats.xml         beats indexables (con portada)
 *   /sitemap-revista.xml       artículos publicados
 *
 * (vercel.json reescribe /sitemap-<tipo>.xml a /api/sitemap?type=<tipo>.)
 *
 * Solo lleva URLs que queremos indexadas. Los beats sin descripción propia
 * (o desactivados) se quedan fuera: son plantillas casi idénticas y api/og.js
 * los sirve con noindex. Un sitemap con URLs noindex es una señal
 * contradictoria para Google. Lo mismo las categorías de beats con menos de
 * MIN_CATEGORY_BEATS beats.
 *
 * Sin <priority> ni <changefreq>: Google los ignora. Sí <lastmod> real.
 *
 * Si la API falla, devolvemos igualmente lo que tengamos: es preferible un
 * sitemap incompleto a un 500 que Search Console marque como error.
 */

const API_URL = process.env.VITE_API_URL
const SITE_URL = 'https://www.otherpeople.es'

/** Páginas fijas indexables. Si añades una ruta pública, añádela aquí. */
const STATIC_ROUTES = [
  '/',
  '/discografica',
  '/discografica-barcelona',
  '/nuevos-talentos',
  '/enviar-maqueta',
  '/artistas',
  '/discografia',
  '/eventos',
  '/beats',
  '/estudio',
  '/estudio/produccion-musical',
  '/estudio/grabacion',
  '/estudio/mezcla-y-mastering',
  '/estudio/beats-a-medida',
  '/booking-artistas',
  '/revista',
  '/herramientas',
  '/herramientas/detector-bpm',
  '/herramientas/detector-tonalidad',
  '/herramientas/generador-qr',
  '/plugins',
  '/plugins/opr-w1',
  '/contacto',
  '/newsletters',
  '/privacidad',
  '/terminos',
  '/cookies'
]

/** Categorías de beats (ver src/data/beatCategories.js). */
const BEAT_CATEGORIES = [
  { slug: 'trap', tokens: ['trap'] },
  { slug: 'hoodtrap', tokens: ['hoodtrap'] },
  { slug: 'reggaeton', tokens: ['reggaeton'] },
  { slug: 'jerk', tokens: ['jerk', 'jerketon'] },
  { slug: 'drill', tokens: ['drill'] }
]
const MIN_CATEGORY_BEATS = 8

function esc (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Fecha en formato W3C (YYYY-MM-DD) o null si no es parseable. */
function toLastmod (value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function keyOf (item) {
  return item.slug || item._id || item.id
}

function genreTokens (genre) {
  return String(genre || '')
    .split(',')
    .map(g => g.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))
    .filter(Boolean)
}

/** Un beat solo se indexa si tiene texto propio y sigue a la venta. */
function isIndexableBeat (beat) {
  return beat.active !== false && typeof beat.description === 'string' && beat.description.trim() !== ''
}

function urlEntry ({ path, lastmod, image, imageTitle }) {
  return [
    '  <url>',
    `    <loc>${esc(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    image && /^https?:\/\//.test(image)
      ? `    <image:image><image:loc>${esc(image)}</image:loc>${imageTitle ? `<image:title>${esc(imageTitle)}</image:title>` : ''}</image:image>`
      : null,
    '  </url>'
  ].filter(Boolean).join('\n')
}

function urlset (entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>
`
}

// La API rechaza con 400 cualquier count > 100, así que paginamos.
const PAGE_SIZE = 100
// Tope de seguridad: 20 páginas son 2000 fichas, muy por encima del catálogo
// real. Evita un bucle infinito si la paginación de la API se comporta raro.
const MAX_PAGES = 20

/**
 * Descarga una colección completa de la API paginando de 100 en 100.
 * Devuelve lo que haya conseguido hasta el momento del fallo.
 */
async function fetchCollection (endpoint, extraQuery = '') {
  if (!API_URL) return []
  const items = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    let body
    try {
      const res = await fetch(`${API_URL}/${endpoint}?count=${PAGE_SIZE}&page=${page}${extraQuery}`, {
        headers: { accept: 'application/json' }
      })
      if (!res.ok) {
        console.error(`[sitemap] ${endpoint} p${page}: HTTP ${res.status}`)
        break
      }
      body = await res.json()
    } catch (err) {
      console.error(`[sitemap] ${endpoint} p${page}: ${err.message}`)
      break
    }

    const list = body?.data || body?.[endpoint] || body
    if (!Array.isArray(list) || list.length === 0) break

    items.push(...list)

    // Preferimos el total de páginas que declara la API; si no viene, paramos
    // en cuanto una página llega incompleta.
    const totalPages = body?.pagination?.pages
    if (totalPages ? page >= totalPages : list.length < PAGE_SIZE) break
  }

  return items
}

/** Generadores de cada sitemap hijo: devuelven las entradas <url>. */
const SITEMAPS = {
  async paginas () {
    const beats = (await fetchCollection('beats')).filter(b => b.active !== false)
    const categories = BEAT_CATEGORIES
      .filter(c => beats.filter(b => genreTokens(b.genre).some(t => c.tokens.includes(t))).length >= MIN_CATEGORY_BEATS)
      .map(c => `/beats/${c.slug}`)
    return [...STATIC_ROUTES, ...categories].map(path => urlEntry({ path }))
  },

  async artistas () {
    return (await fetchCollection('artists')).map(a => urlEntry({
      path: `/artistas/${keyOf(a)}`,
      lastmod: toLastmod(a.updatedAt || a.createdAt),
      image: a.img,
      imageTitle: a.name
    }))
  },

  async eventos () {
    return (await fetchCollection('events')).map(e => urlEntry({
      path: `/eventos/${keyOf(e)}`,
      lastmod: toLastmod(e.updatedAt || e.createdAt || e.date),
      image: e.img,
      imageTitle: e.name
    }))
  },

  async lanzamientos () {
    return (await fetchCollection('releases')).map(r => urlEntry({
      path: `/discografia/${keyOf(r)}`,
      lastmod: toLastmod(r.updatedAt || r.date),
      image: r.img,
      imageTitle: r.title
    }))
  },

  async beats () {
    return (await fetchCollection('beats')).filter(isIndexableBeat).map(b => urlEntry({
      path: `/beats/${keyOf(b)}`,
      lastmod: toLastmod(b.updatedAt || b.createdAt),
      image: b.coverUrl,
      imageTitle: b.title
    }))
  },

  async revista () {
    return (await fetchCollection('posts', '&status=published')).map(p => urlEntry({
      path: `/revista/${p.slug}`,
      lastmod: toLastmod(p.updatedAt || p.publishedAt),
      image: p.coverImage,
      imageTitle: p.title
    }))
  }
}

function sitemapIndex () {
  const today = new Date().toISOString().slice(0, 10)
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(SITEMAPS).map(type => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${type}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`
}

export default async function handler (req, res) {
  const type = req.query?.type

  let xml
  if (!type) {
    xml = sitemapIndex()
  } else if (SITEMAPS[type]) {
    xml = urlset(await SITEMAPS[type]())
  } else {
    res.status(404).send('Not found')
    return
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Cache de 1 h en el CDN; los bots no necesitan verlo más fresco.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
