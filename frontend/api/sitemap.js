/**
 * Vercel Serverless Function — sitemap.xml
 *
 * Genera el sitemap a partir de las rutas estáticas de la SPA más las fichas
 * de artistas, eventos, lanzamientos y beats que devuelve la API.
 *
 * Solo lleva URLs que queremos indexadas. Los beats sin descripción propia
 * (o desactivados) se quedan fuera: son plantillas casi idénticas y api/og.js
 * los sirve con noindex. Un sitemap con URLs noindex es una señal
 * contradictoria para Google.
 *
 * Sin <priority> ni <changefreq>: Google los ignora. Sí <lastmod> real.
 *
 * Si la API falla, devolvemos igualmente el sitemap con las rutas estáticas:
 * es preferible un sitemap incompleto a un 500 que Search Console marque
 * como error.
 */

const API_URL = process.env.VITE_API_URL
const SITE_URL = 'https://www.otherpeople.es'

/** Rutas estáticas indexables. */
const STATIC_ROUTES = [
  '/',
  '/discografica-barcelona',
  '/booking-artistas',
  '/artistas',
  '/eventos',
  '/discografia',
  '/beats',
  '/estudios',
  '/plugins',
  '/plugins/opr-w1',
  '/contacto',
  '/herramientas',
  '/newsletters',
  '/privacidad',
  '/terminos',
  '/cookies'
]

/** Un beat solo se indexa si tiene texto propio y sigue a la venta. */
function isIndexableBeat (beat) {
  return beat.active !== false && typeof beat.description === 'string' && beat.description.trim() !== ''
}

/** Colecciones de la API que generan URLs de detalle. */
const COLLECTIONS = [
  { endpoint: 'artists', prefix: '/artistas' },
  { endpoint: 'events', prefix: '/eventos' },
  { endpoint: 'beats', prefix: '/beats', include: isIndexableBeat }
]

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

function urlEntry ({ path, lastmod }) {
  return [
    '  <url>',
    `    <loc>${esc(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    '  </url>'
  ].filter(Boolean).join('\n')
}

// La API rechaza con 400 cualquier count > 100, así que paginamos.
const PAGE_SIZE = 100
// Tope de seguridad: 20 páginas son 2000 fichas, muy por encima del catálogo
// real. Evita un bucle infinito si la paginación de la API se comporta raro.
const MAX_PAGES = 20

/**
 * Descarga una colección completa de la API paginando de 100 en 100.
 * Devuelve lo que haya conseguido hasta el momento del fallo: un sitemap
 * incompleto es mejor que un 500 que Search Console marque como error.
 */
async function fetchCollection (endpoint) {
  const items = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    let body
    try {
      const res = await fetch(`${API_URL}/${endpoint}?count=${PAGE_SIZE}&page=${page}`, {
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

export default async function handler (req, res) {
  const entries = STATIC_ROUTES.map(path => urlEntry({ path }))

  if (API_URL) {
    const results = await Promise.all(
      COLLECTIONS.map(async (collection) => {
        const items = await fetchCollection(collection.endpoint)
        return items
          .filter(item => !collection.include || collection.include(item))
          .map((item) => {
            const id = item._id || item.id
            if (!id) return null
            return urlEntry({
              path: `${collection.prefix}/${id}`,
              lastmod: toLastmod(item.updatedAt || item.createdAt || item.date)
            })
          })
          .filter(Boolean)
      })
    )
    results.forEach((group) => entries.push(...group))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Cache de 1 h en el CDN; los bots no necesitan verlo más fresco.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
