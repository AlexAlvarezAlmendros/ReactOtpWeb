/**
 * Las rutas públicas viven en cuatro sitios: routes.jsx (la SPA), vercel.json
 * (qué HTML sirve Vercel), scripts/prerender.mjs (qué páginas salen con HTML
 * real) y api/sitemap.js. Este test avisa si se desincronizan.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..', '..')
const read = (file) => readFileSync(join(ROOT, file), 'utf8')

const prerenderRoutes = [...read('scripts/prerender.mjs').matchAll(/\['(\/[^']*)', 'src\/pages\/([^']+)'\]/g)]
  .map(([, path, page]) => ({ path, page }))
const sitemapRoutes = [...read('api/sitemap.js').split('const STATIC_ROUTES = [')[1].split(']')[0].matchAll(/'([^']+)'/g)]
  .map(([, path]) => path)
const vercel = JSON.parse(read('vercel.json'))
const routesFile = read('src/routes.jsx')

describe('rutas públicas', () => {
  test('hay páginas que prerenderizar', () => {
    expect(prerenderRoutes.length).toBeGreaterThan(20)
  })

  test.each(prerenderRoutes.filter(r => r.path !== '/'))('vercel.json sirve el HTML prerenderizado de $path', ({ path }) => {
    const rule = vercel.rewrites.find(r => r.source === path && !r.has)
    expect(rule?.destination).toBe(`${path}/index.html`)
  })

  test.each(prerenderRoutes)('la página de $path existe en routes.jsx', ({ page }) => {
    expect(routesFile).toContain(`./pages/${page}`)
  })

  test('todo lo prerenderizado (salvo categorías de beats) está en el sitemap', () => {
    const missing = prerenderRoutes
      .map(r => r.path)
      .filter(path => !path.startsWith('/beats/'))
      .filter(path => !sitemapRoutes.includes(path))
    expect(missing).toEqual([])
  })

  test('las reglas de la SPA apuntan al shell, no a la home prerenderizada', () => {
    const generic = vercel.rewrites.filter(r => !r.has && r.source.startsWith('/:'))
    expect(generic.length).toBeGreaterThan(0)
    for (const rule of generic) expect(rule.destination).toBe('/spa.html')
  })

  test('/estudios redirige con 301/308 a /estudio', () => {
    expect(vercel.redirects).toContainEqual({ source: '/estudios', destination: '/estudio', permanent: true })
  })
})
