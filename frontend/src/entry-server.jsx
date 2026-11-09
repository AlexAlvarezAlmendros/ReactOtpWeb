/**
 * Entrada del prerender (Fase 2 del plan SEO). Solo se usa en el build:
 *
 *   vite build --ssr src/entry-server.jsx --outDir dist-ssr
 *   node scripts/prerender.mjs
 *
 * Renderiza una ruta a HTML con las mismas rutas que la SPA (routes.jsx) y
 * devuelve también los metadatos que han pedido usePageMeta y useJsonLd.
 * Sin Auth0Provider: el HTML prerenderizado es el de un visitante anónimo.
 */
import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { routes } from './routes.jsx'
import { HeadContext } from './ssr/HeadContext'
import './fontawesome.js'

const ORIGIN = 'https://www.otherpeople.es'

export async function render (path) {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request(`${ORIGIN}${path}`))
  if (context instanceof Response) {
    throw new Error(`La ruta ${path} devuelve una redirección (${context.status}): no se prerenderiza`)
  }

  const router = createStaticRouter(handler.dataRoutes, context)
  const head = { meta: null, jsonLd: [] }
  const html = renderToString(
    <HeadContext.Provider value={head}>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </HeadContext.Provider>
  )

  return { html, head, statusCode: context.statusCode }
}
