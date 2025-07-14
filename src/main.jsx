import { createRoot } from 'react-dom/client'
import Inicio from './pages/Inicio.jsx'
import Artistas from './pages/Artistas.jsx'
import Contacto from './pages/Contacto.jsx'
import Estudios from './pages/Estudios.jsx'
import Eventos from './pages/Eventos.jsx'
import Create from './pages/Create.jsx'
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
        path: '/crear',
        element: <Create />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
