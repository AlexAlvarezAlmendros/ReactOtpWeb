import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

/**
 * Componente de plantilla que define la estructura principal de la página
 * (Header, contenido principal y Footer).
 * Las rutas anidadas se renderizarán donde se coloque el <Outlet />.
 */
function RootLayout () {
  return (
    <>
      <Header />
      <main className='container'>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  )
}

export default RootLayout
