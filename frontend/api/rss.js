/**
 * Vercel Serverless Function — RSS de la revista (/revista/rss.xml).
 * Lo usan lectores RSS, agregadores y algunos buscadores para descubrir
 * artículos nuevos antes de rastrear la web.
 */
const API_URL = process.env.VITE_API_URL
const SITE_URL = 'https://www.otherpeople.es'

function esc (str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler (req, res) {
  let posts = []
  try {
    const response = await fetch(`${API_URL}/posts?count=30&full=1`, { headers: { accept: 'application/json' } })
    if (response.ok) posts = (await response.json()).data || []
  } catch (err) {
    console.error('[rss]', err.message)
  }

  const items = posts.map(post => {
    const url = `${SITE_URL}/revista/${post.slug}`
    return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      ${post.author?.name ? `<dc:creator>${esc(post.author.name)}</dc:creator>` : ''}
      <description>${esc(post.excerpt)}</description>
      ${post.content ? `<content:encoded><![CDATA[${String(post.content).replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>` : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Revista de Other People Records</title>
    <link>${SITE_URL}/revista</link>
    <atom:link href="${SITE_URL}/revista/rss.xml" rel="self" type="application/rss+xml" />
    <description>Guías para artistas, escena de trap y música urbana y producción musical.</description>
    <language>es-ES</language>
${items}
  </channel>
</rss>
`
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
