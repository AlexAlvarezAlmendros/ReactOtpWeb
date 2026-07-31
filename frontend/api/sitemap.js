/**
 * Vercel Serverless Function — sitemap.xml
 *
 * Genera el sitemap a partir de las rutas estáticas de la SPA más las fichas
 * de artistas, eventos, lanzamientos y beats que devuelve la API.
 *
 * Si la API falla, devolvemos igualmente el sitemap con las rutas estáticas:
 * es preferible un sitemap incompleto a un 500 que Search Console marque
 * como error.
 */

const API_URL = process.env.VITE_API_URL
const SITE_URL = 'https://www.otherpeople.es'

/** Rutas estáticas indexables, con su prioridad y frecuencia de cambio. */
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/discografica-barcelona', priority: '0.9', changefreq: 'monthly' },
  { path: '/booking-artistas', priority: '0.9', changefreq: 'monthly' },
  { path: '/artistas', priority: '0.9', changefreq: 'weekly' },
  { path: '/eventos', priority: '0.9', changefreq: 'daily' },
  { path: '/discografia', priority: '0.8', changefreq: 'weekly' },
  { path: '/beats', priority: '0.8', changefreq: 'weekly' },
  { path: '/estudios', priority: '0.8', changefreq: 'monthly' },
  { path: '/plugins', priority: '0.7', changefreq: 'monthly' },
  { path: '/plugins/opr-w1', priority: '0.7', changefreq: 'monthly' },
  { path: '/contacto', priority: '0.7', changefreq: 'yearly' },
  { path: '/herramientas', priority: '0.6', changefreq: 'monthly' },
  { path: '/newsletters', priority: '0.4', changefreq: 'weekly' },
  { path: '/privacidad', priority: '0.2', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.2', changefreq: 'yearly' },
  { path: '/cookies', priority: '0.2', changefreq: 'yearly' }
]

/** Colecciones de la API que generan URLs de detalle. */
const COLLECTIONS = [
  { endpoint: 'artists', prefix: '/artistas', priority: '0.8', changefreq: 'monthly' },
  { endpoint: 'events', prefix: '/eventos', priority: '0.7', changefreq: 'weekly' },
  { endpoint: 'beats', prefix: '/beats', priority: '0.6', changefreq: 'monthly' }
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

function urlEntry ({ path, priority, changefreq, lastmod }) {
  return [
    '  <url>',
    `    <loc>${esc(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].filter(Boolean).join('\n')
}

/** Descarga una colección de la API. Devuelve [] ante cualquier problema. */
async function fetchCollection (endpoint) {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?count=500&page=1`, {
      headers: { accept: 'application/json' }
    })
    if (!res.ok) return []
    const body = await res.json()
    const list = body.data || body[endpoint] || body
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export default async function handler (req, res) {
  const entries = STATIC_ROUTES.map(urlEntry)

  if (API_URL) {
    const results = await Promise.all(
      COLLECTIONS.map(async (collection) => {
        const items = await fetchCollection(collection.endpoint)
        return items
          .map((item) => {
            const id = item._id || item.id
            if (!id) return null
            return urlEntry({
              path: `${collection.prefix}/${id}`,
              priority: collection.priority,
              changefreq: collection.changefreq,
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
