import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { UMAMI_HOST, UMAMI_WEBSITE_ID, isPublicRoute, hasDoNotTrack } from '../../utils/analytics'

/**
 * @fileoverview Carga la analítica de Umami (script.js) y el grabador de
 * sesiones/mapas de calor (recorder.js) solo en las páginas públicas.
 *
 * El tracker se inyecta con `data-auto-track="false"` para que sea este
 * componente —y no el script— quien decida qué se envía: así una visita que
 * pase por la zona privada no genera páginas vistas de rutas internas.
 * Como es una SPA, cada cambio de ruta pública dispara un `umami.track()`.
 */

/**
 * Inserta un script de Umami en el head, una sola vez.
 *
 * @param {string} file - Nombre del script en el host de Umami
 * @param {Object<string, string>} [attrs] - Atributos data-* adicionales
 * @returns {HTMLScriptElement|null} El script creado, o null si ya estaba
 */
const injectScript = (file, attrs = {}) => {
  const src = `${UMAMI_HOST}/${file}`

  if (document.querySelector(`script[src="${src}"]`)) return null

  const script = document.createElement('script')
  script.src = src
  script.defer = true
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID)

  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value))
  document.head.appendChild(script)

  return script
}

function UmamiAnalytics () {
  const { pathname, search } = useLocation()
  const scriptsLoaded = useRef(false)

  useEffect(() => {
    // En desarrollo no ensuciamos las estadísticas reales.
    if (import.meta.env.DEV) return
    // Ni el tracker ni el grabador respetan «Do Not Track» por su cuenta.
    if (hasDoNotTrack()) return
    if (!isPublicRoute(pathname)) return

    if (scriptsLoaded.current) {
      window.umami?.track()
      return
    }

    scriptsLoaded.current = true

    const tracker = injectScript('script.js', { 'data-auto-track': 'false' })
    injectScript('recorder.js')

    // La primera página vista se registra cuando el tracker está disponible.
    if (tracker) {
      tracker.addEventListener('load', () => window.umami?.track())
    } else {
      window.umami?.track()
    }
  }, [pathname, search])

  return null
}

export default UmamiAnalytics
