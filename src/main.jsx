import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import Inicio from './pages/Inicio.jsx'
import Artistas from './pages/Artistas.jsx'
import ArtistaDetalle from './pages/ArtistaDetalle.jsx'
import Contacto from './pages/Contacto.jsx'
import Estudios from './pages/Estudios.jsx'
import Eventos from './pages/Eventos.jsx'
import EventoDetalle from './pages/EventoDetalle.jsx'
import Create from './pages/Create.jsx'
import Discografia from './pages/Discografia.jsx'
import Beats from './pages/Beats.jsx'
import Privacidad from './pages/Privacidad.jsx'
import Terminos from './pages/Terminos.jsx'
import Cookies from './pages/Cookies.jsx'
import NotFound from './pages/NotFound.jsx'
import TicketInfo from './pages/TicketInfo.jsx'
import Scanner from './pages/Scanner.jsx'
import NewsletterBuilder from './pages/NewsletterBuilder.jsx'
import NewsletterViewer from './pages/NewsletterViewer.jsx'
import Newsletters from './pages/Newsletters.jsx'
import Unsubscribe from './pages/Unsubscribe.jsx'
import './fontawesome.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import { lazy, Suspense } from 'react'
import { Analytics } from "@vercel/analytics/react"


// Importación lazy de SpeedInsights para evitar problemas de build
const SpeedInsights = lazy(() => 
  import('@vercel/speed-insights/react').then(module => ({
    default: module.SpeedInsights
  })).catch(() => ({ default: () => null }))
)

const router = createBrowserRouter([
  {
    element: <RootLayout />, // 1. El Layout es el elemento padre
    // 2. Las páginas se renderizan como hijos dentro del <Outlet /> del Layout
    children: [
      {
        path: '/',
        element: <Inicio />
      },
      {
        path: '/artistas',
        element: <Artistas />
      },
      {
        path: '/artistas/:id',
        element: <ArtistaDetalle />
      },
      {
        path: '/contacto',
        element: <Contacto />
      },
      {
        path: '/estudios',
        element: <Estudios />
      },
      {
        path: '/eventos',
        element: <Eventos />
      },
      {
        path: '/eventos/:id',
        element: <EventoDetalle />
      },
      {
        path: '/discografia',
        element: <Discografia />
      },
      {
        path: '/beats',
        element: <Beats />
      },
      {
        path: '/crear',
        element: <Create />
      },
      {
        path: '/privacidad',
        element: <Privacidad />
      },
      {
        path: '/terminos',
        element: <Terminos />
      },
      {
        path: '/cookies',
        element: <Cookies />
      },
      {
        path: '/ticket/:validationCode',
        element: <TicketInfo />
      },
      {
        path: '/scanner',
        element: <Scanner />
      },
      {
        path: '/admin/newsletter',
        element: <NewsletterBuilder />
      },
      {
        path: '/newsletters',
        element: <Newsletters />
      },
      {
        path: '/news/:slug',
        element: <NewsletterViewer />
      },
      {
        path: '/unsubscribe',
        element: <Unsubscribe />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])

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
