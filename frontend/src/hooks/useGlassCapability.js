let glassCached = null
let tiltCached = null

/** Hardware modesto o ahorro de datos: nada de efectos caros. */
function isLowEndDevice () {
  const nav = window.navigator
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return true
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return true
  if (nav.connection?.saveData) return true
  return false
}

/**
 * Decide si el dispositivo puede renderizar el cristal avanzado de GlassSurface
 * (backdrop-filter con filtro SVG de desplazamiento). En equipos antiguos/lentos,
 * con preferencias de accesibilidad activas o navegadores sin soporte, devuelve
 * false y GlassSurface renderiza el markup original con el CSS de siempre.
 */
function detectGlassCapability () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  if (isLowEndDevice()) return false

  // Preferencias del usuario
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return false

  // backdrop-filter: url(#filtro-svg) solo funciona en Chromium
  const ua = window.navigator.userAgent
  const isSafari = /Safari/.test(ua) && !/Chrom/.test(ua)
  if (isSafari || /Firefox/.test(ua)) return false

  const probe = document.createElement('div')
  probe.style.backdropFilter = 'url(#glass-capability-probe)'
  return probe.style.backdropFilter !== ''
}

/**
 * Decide si aplicar el tilt 3D de las cards. A diferencia del cristal, no
 * depende del soporte de filtros SVG (funciona en cualquier navegador), pero sí
 * necesita puntero con hover: en táctil no hay dónde apoyar el efecto.
 */
function detectTiltCapability () {
  if (typeof window === 'undefined') return false
  if (isLowEndDevice()) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (!window.matchMedia('(hover: hover)').matches) return false
  return true
}

export function useGlassCapability () {
  if (glassCached === null) glassCached = detectGlassCapability()
  return glassCached
}

export function useTiltCapability () {
  if (tiltCached === null) tiltCached = detectTiltCapability()
  return tiltCached
}
