/**
 * @fileoverview Configuración de la analítica de Umami (instancia autoalojada).
 *
 * Umami mide sin cookies, pero el recorder graba la sesión del visitante, así
 * que la zona privada (perfil, panel de creación, escáner de entradas y
 * administración) queda fuera: ni se registran páginas vistas ni se carga el
 * grabador mientras se navega por ella.
 */

export const UMAMI_HOST = 'https://analiticas.alexalvarez.dev'
export const UMAMI_WEBSITE_ID = 'e7a6fb2d-aad9-4e96-a990-739ca7b82cd8'

/**
 * Prefijos de rutas que NO se miden: requieren sesión iniciada o son
 * herramientas internas del sello.
 */
export const PRIVATE_ROUTE_PREFIXES = [
  '/crear',
  '/perfil',
  '/scanner',
  '/admin'
]

/**
 * Indica si una ruta es pública y, por tanto, medible.
 *
 * @param {string} pathname - Ruta actual (sin query string)
 * @returns {boolean}
 */
export function isPublicRoute (pathname) {
  const path = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/'

  return !PRIVATE_ROUTE_PREFIXES.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`)
  )
}

/**
 * Indica si el visitante ha pedido no ser rastreado.
 *
 * Umami no respeta «Do Not Track» por su cuenta, así que lo comprobamos antes
 * de cargar los scripts: es lo que promete la política de privacidad.
 *
 * @param {object} [nav] - Objeto navigator (inyectable en tests)
 * @param {object} [win] - Objeto window (inyectable en tests)
 * @returns {boolean}
 */
export function hasDoNotTrack (
  nav = typeof navigator !== 'undefined' ? navigator : {},
  win = typeof window !== 'undefined' ? window : {}
) {
  const signals = [nav?.doNotTrack, nav?.msDoNotTrack, win?.doNotTrack]

  return signals.some(signal => signal === '1' || signal === 'yes')
}
