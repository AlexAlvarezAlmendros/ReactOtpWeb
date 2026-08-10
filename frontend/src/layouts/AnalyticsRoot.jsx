import { Outlet } from 'react-router-dom'
import UmamiAnalytics from '../components/Analytics/UmamiAnalytics'

/**
 * Ruta contenedora sin path que envuelve a toda la aplicación para que la
 * analítica cubra también las páginas que viven fuera de RootLayout, como
 * las landings de enlaces (/l/:slug).
 */
function AnalyticsRoot () {
  return (
    <>
      <UmamiAnalytics />
      <Outlet />
    </>
  )
}

export default AnalyticsRoot
