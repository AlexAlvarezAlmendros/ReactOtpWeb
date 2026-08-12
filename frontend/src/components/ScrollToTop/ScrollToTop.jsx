import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al cambiar de ruta lleva la ventana al inicio de la página.
 * Si la URL trae un ancla (#seccion) se respeta el desplazamiento del navegador.
 */
function ScrollToTop () {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) return

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
