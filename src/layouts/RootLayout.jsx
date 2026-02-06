import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import MobileNavContainer from '../components/MobileNav/MobileNavContainer'
import NewsletterPopup from '../components/NewsletterPopup/NewsletterPopup'
import { ToastContainer } from '../components/Toast/Toast'
import { MobileNavProvider } from '../contexts/MobileNavContext'
import { ToastProvider } from '../contexts/ToastContext'
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext'

/**
 * Componente de plantilla que define la estructura principal de la página
 * (Header, contenido principal y Footer).
 * Las rutas anidadas se renderizarán donde se coloque el <Outlet />.
 */
function RootLayout () {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AudioPlayerProvider>
          <MobileNavProvider>
            <ToastContainer />
            <Header />
            <MobileNavContainer />
            <NewsletterPopup />
            <main className='container'>
              <Outlet />
            </main>
          </MobileNavProvider>
        </AudioPlayerProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default RootLayout
