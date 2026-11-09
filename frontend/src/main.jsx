import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './fontawesome.js'
import { createBrowserRouter, matchRoutes, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { routes } from './routes.jsx'


// Importación lazy de SpeedInsights para evitar problemas de build
const SpeedInsights = lazy(() => 
  import('@vercel/speed-insights/react').then(module => ({
    default: module.SpeedInsights
  })).catch(() => ({ default: () => null }))
)

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin

// Configurar authorizationParams con scope offline_access para refresh tokens
const authorizationParams = {
  redirect_uri: redirectUri,
  scope: 'openid profile email offline_access' // offline_access es CRÍTICO para refresh tokens
}

if (audience) {
  authorizationParams.audience = audience
}

/**
 * Carga antes de pintar la página de la ruta actual. Si no, el router arranca
 * sin ella y el HTML prerenderizado se sustituye por una pantalla vacía
 * mientras llega el chunk.
 */
async function preloadCurrentRoute () {
  const matches = matchRoutes(routes, window.location) || []
  await Promise.all(matches
    .filter(match => match.route.lazy)
    .map(async ({ route }) => {
      const resolved = await route.lazy()
      Object.assign(route, resolved, { lazy: undefined })
    }))
}

function render () {
  const router = createBrowserRouter(routes)

  createRoot(document.getElementById('root')).render(
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Suspense fallback={null}>
        <SpeedInsights />
      </Suspense>
      <RouterProvider router={router} />
    </Auth0Provider>
  )
}

// Si falla la precarga (red caída), arrancamos igual: el router la reintenta.
preloadCurrentRoute().catch(() => {}).finally(render)
