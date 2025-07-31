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
import Privacidad from './pages/Privacidad.jsx'
import Terminos from './pages/Terminos.jsx'
import Cookies from './pages/Cookies.jsx'
import NotFound from './pages/NotFound.jsx'
import './fontawesome.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'

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

// Configurar authorizationParams solo si audience está definido
const authorizationParams = {
  redirect_uri: redirectUri
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
    <RouterProvider router={router} />
  </Auth0Provider>
)
