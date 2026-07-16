let cached = null

/**
 * Decide si el dispositivo puede renderizar el cristal avanzado de GlassSurface
 * (backdrop-filter con filtro SVG de desplazamiento). En equipos antiguos/lentos,
 * con preferencias de accesibilidad activas o navegadores sin soporte, devuelve
 * false y GlassSurface renderiza el markup original con el CSS de siempre.
 */
function detectGlassCapability () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  const nav = window.navigator

  // Heurísticas de hardware modesto: mantener el glass CSS actual
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return false
  if (nav.connection?.saveData) return false

  // Preferencias del usuario
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return false

  // backdrop-filter: url(#filtro-svg) solo funciona en Chromium
  const ua = nav.userAgent
  const isSafari = /Safari/.test(ua) && !/Chrom/.test(ua)
  if (isSafari || /Firefox/.test(ua)) return false

  const probe = document.createElement('div')
  probe.style.backdropFilter = 'url(#glass-capability-probe)'
  return probe.style.backdropFilter !== ''
}

export function useGlassCapability () {
  if (cached === null) cached = detectGlassCapability()
  return cached
}
