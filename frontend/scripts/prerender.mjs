/**
 * Prerender de las páginas fijas (Fase 2 del plan SEO).
 *
 * Después del build, renderiza cada ruta de PRERENDER_ROUTES con React en
 * Node y escribe su HTML en dist/<ruta>/index.html, con su <title>,
 * description, canonical, Open Graph y JSON-LD. Así Bing, los buscadores de
 * IA y cualquier bot sin JavaScript reciben el contenido de verdad en lugar de
 * un <div id="root"> vacío. En el navegador, main.jsx monta la SPA encima.
 *
 *   npm run build   (vite build → copy-404 → build SSR → este script)
 *
 * Las fichas (/artistas/:id, /beats/:id…) no se prerenderizan: las sirve
 * api/og.js a los bots con datos frescos de la API.
 *
 * Si una ruta falla al renderizar, se avisa y se sigue: esa ruta se queda con
 * el shell de la SPA (dist/spa.html), como antes. El build no se rompe.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SSR_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js')
const MANIFEST = join(DIST, '.vite', 'manifest.json')

const SITE_NAME = 'Other People Records'
const SITE_URL = 'https://www.otherpeople.es'

/**
 * Rutas que se prerenderizan, con el archivo de la página: hace falta para
 * enlazar su CSS (va en el chunk lazy de la página y, sin él, el HTML
 * prerenderizado se vería sin estilos hasta que cargue el JavaScript).
 *
 * Fuera: /beats/drill (casi sin beats, la SPA la marca noindex) y las
 * privadas. Si añades una página indexable, añádela aquí, a vercel.json y a
 * api/sitemap.js.
 */
export const PRERENDER_ROUTES = [
  ['/', 'src/pages/Inicio.jsx'],
  ['/discografica', 'src/pages/Discografica.jsx'],
  ['/discografica-barcelona', 'src/pages/DiscograficaBarcelona.jsx'],
  ['/nuevos-talentos', 'src/pages/NuevosTalentos.jsx'],
  ['/enviar-maqueta', 'src/pages/EnviarMaqueta.jsx'],
  ['/artistas', 'src/pages/Artistas.jsx'],
  ['/discografia', 'src/pages/Discografia.jsx'],
  ['/eventos', 'src/pages/Eventos.jsx'],
  ['/beats', 'src/pages/Beats.jsx'],
  ['/beats/trap', 'src/pages/BeatsCategoria.jsx'],
  ['/beats/hoodtrap', 'src/pages/BeatsCategoria.jsx'],
  ['/beats/reggaeton', 'src/pages/BeatsCategoria.jsx'],
  ['/beats/jerk', 'src/pages/BeatsCategoria.jsx'],
  ['/estudio', 'src/pages/Estudios.jsx'],
  ['/estudio/produccion-musical', 'src/pages/EstudioServicio.jsx'],
  ['/estudio/grabacion', 'src/pages/EstudioServicio.jsx'],
  ['/estudio/mezcla-y-mastering', 'src/pages/EstudioServicio.jsx'],
  ['/estudio/beats-a-medida', 'src/pages/EstudioServicio.jsx'],
  ['/booking-artistas', 'src/pages/BookingArtistas.jsx'],
  ['/revista', 'src/pages/Revista.jsx'],
  ['/herramientas', 'src/pages/Herramientas.jsx'],
  ['/herramientas/detector-bpm', 'src/pages/Herramientas.jsx'],
  ['/herramientas/detector-tonalidad', 'src/pages/Herramientas.jsx'],
  ['/herramientas/generador-qr', 'src/pages/Herramientas.jsx'],
  ['/plugins', 'src/pages/Plugins.jsx'],
  ['/plugins/opr-w1', 'src/pages/PluginOprW1.jsx'],
  ['/contacto', 'src/pages/Contacto.jsx'],
  ['/newsletters', 'src/pages/Newsletters.jsx'],
  ['/privacidad', 'src/pages/Privacidad.jsx'],
  ['/terminos', 'src/pages/Terminos.jsx'],
  ['/cookies', 'src/pages/Cookies.jsx']
]

/** Imagen LCP de la home: se precarga en su HTML (Fase 1.3). */
const HOME_PRELOAD = '<link rel="preload" as="image" type="image/avif" fetchpriority="high" ' +
  'imagesrcset="/img/hero/portada1-828.avif 828w, /img/hero/portada1-1280.avif 1280w, /img/hero/portada1-1920.avif 1920w" imagesizes="100vw" />'

function escAttr (str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const absolute = (path) => (/^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`)

/** CSS y JS (modulepreload) que necesita una página según el manifest de Vite. */
function assetsFor (manifest, pageFile) {
  const css = new Set()
  const js = new Set()
  const seen = new Set()
  const visit = (key) => {
    if (!key || seen.has(key) || !manifest[key]) return
    seen.add(key)
    const chunk = manifest[key]
    // La entrada principal ya va en la plantilla (index.html).
    if (chunk.isEntry) return
    if (chunk.file && chunk.file.endsWith('.js')) js.add(chunk.file)
    for (const file of chunk.css || []) css.add(file)
    for (const imported of chunk.imports || []) visit(imported)
  }
  visit(pageFile)
  return { css: [...css], js: [...js] }
}

/** Sustituye el content="" de una etiqueta <meta> concreta. */
function setMeta (html, attr, key, value) {
  if (value == null || value === '') return html
  const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content=")[^"]*(")`)
  return re.test(html)
    ? html.replace(re, `$1${escAttr(value)}$2`)
    : html.replace('</head>', `    <meta ${attr}="${key}" content="${escAttr(value)}" />\n  </head>`)
}

/** Monta la página: plantilla + metadatos + CSS + HTML renderizado. */
function buildPage (template, { path, html, head, assets }) {
  const meta = head.meta || {}
  const fullTitle = meta.title ? (meta.appendSiteName === false ? meta.title : `${meta.title} | ${SITE_NAME}`) : null
  const url = absolute(meta.url || path)
  const robots = meta.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  let out = template
  if (fullTitle) out = out.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(fullTitle)}</title>`)
  out = setMeta(out, 'name', 'description', meta.description)
  out = setMeta(out, 'name', 'robots', robots)
  out = setMeta(out, 'property', 'og:title', fullTitle)
  out = setMeta(out, 'property', 'og:description', meta.description)
  out = setMeta(out, 'property', 'og:type', meta.type)
  out = setMeta(out, 'name', 'twitter:title', fullTitle)
  out = setMeta(out, 'name', 'twitter:description', meta.description)
  if (meta.image) {
    out = setMeta(out, 'property', 'og:image', absolute(meta.image))
    out = setMeta(out, 'name', 'twitter:image', absolute(meta.image))
  }

  const headExtra = [
    `<link rel="canonical" href="${escAttr(url)}" />`,
    `<meta property="og:url" content="${escAttr(url)}" />`,
    path === '/' ? HOME_PRELOAD : null,
    ...assets.css.map(file => `<link rel="stylesheet" crossorigin href="/${file}" />`),
    ...assets.js.map(file => `<link rel="modulepreload" crossorigin href="/${file}" />`),
    // data-prerender: main.jsx los quita al arrancar (useJsonLd los vuelve a poner).
    ...head.jsonLd.map(json => `<script type="application/ld+json" data-prerender="true">${json.replace(/</g, '\\u003c')}</script>`)
  ].filter(Boolean).map(tag => `    ${tag}`).join('\n')

  out = out.replace('</head>', `${headExtra}\n  </head>`)
  out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  return out
}

function outputFile (path) {
  return path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html')
}

async function main () {
  const spaShell = join(DIST, 'spa.html')
  if (!existsSync(spaShell)) throw new Error('Falta dist/spa.html: ejecuta antes scripts/copy-404.mjs')
  if (!existsSync(SSR_ENTRY)) throw new Error('Falta dist-ssr/entry-server.js: ejecuta antes el build SSR')

  const template = readFileSync(spaShell, 'utf8')
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  const { render } = await import(pathToFileURL(SSR_ENTRY).href)

  let ok = 0
  const failed = []
  for (const [path, pageFile] of PRERENDER_ROUTES) {
    try {
      const { html, head } = await render(path)
      if (!head.meta?.title) console.warn(`[prerender] ${path}: la página no ha llamado a usePageMeta`)
      const page = buildPage(template, { path, html, head, assets: assetsFor(manifest, pageFile) })
      const file = outputFile(path)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, page)
      ok++
    } catch (err) {
      failed.push(path)
      console.warn(`[prerender] ${path}: ${err.message.split('\n')[0]} (se queda con el shell de la SPA)`)
    }
  }

  // El manifest solo sirve para el build: que no se publique.
  rmSync(join(DIST, '.vite'), { recursive: true, force: true })

  console.log(`[prerender] ${ok}/${PRERENDER_ROUTES.length} páginas prerenderizadas${failed.length ? `; fallaron: ${failed.join(', ')}` : ''}`)
}

// Solo al ejecutarlo como script (los tests importan PRERENDER_ROUTES).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    // No rompemos el despliegue: sin prerender la web funciona como antes.
    console.error(`[prerender] ${err.message}`)
  })
}

export { buildPage, assetsFor }
