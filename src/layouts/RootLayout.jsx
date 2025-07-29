import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'

/**
 * Componente de plantilla que define la estructura principal de la página
 * (Header, contenido principal y Footer).
 * Las rutas anidadas se renderizarán donde se coloque el <Outlet />.
 */
function RootLayout () {
  return (
    <ErrorBoundary>
      <Header />
      <main className='container'>
        <Outlet />
      </main>
    </ErrorBoundary>
  )
}

export default RootLayout
