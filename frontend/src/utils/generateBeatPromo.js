/**
 * Genera una imagen promocional para un beat usando HTML Canvas.
 * Formato: 1080x1080px (cuadrado, apto para Instagram/redes sociales).
 *
 * Estructura visual:
 * - Portada del beat como fondo (recortada para llenar el cuadrado)
 * - Degradado oscuro en la parte superior (para el logo) y en la inferior (para el texto)
 * - "otherpeople.es" en pequeño en la parte superior centrado
 * - Logo de la web superpuesto en la parte superior centrado
 * - Nombre del beat en grande en la parte inferior centrado
 * - Productores debajo del nombre
 * - Todo el texto en blanco
 */

const WIDTH = 1080
const HEIGHT = 1080

function loadImage (src, crossOrigin = false) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = src
  })
}

/**
 * Dibuja texto con saltos de línea automáticos si excede maxWidth.
 * Devuelve la Y final tras el último bloque de texto.
 */
function drawWrappedText (ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
  return currentY
}

/**
 * @param {object} params
 * @param {string} params.title        - Título del beat
 * @param {string} params.producer     - Productor principal
 * @param {string[]} params.colaboradores - Colaboradores adicionales
 * @param {string} params.coverUrl     - URL de la portada del beat
 */
export async function generateBeatPromoImage ({ title, producer, colaboradores = [], coverUrl }) {
  if (!coverUrl) {
    throw new Error('No hay portada disponible para generar la imagen.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  // ── 1. PORTADA COMO FONDO ──────────────────────────────────────────────────
  let coverImg
  try {
    coverImg = await loadImage(coverUrl, true)
  } catch {
    // Si falla por CORS, intentar sin crossOrigin (no se podrá exportar el canvas)
    throw new Error(
      'No se pudo cargar la portada. Puede ser un problema de CORS con la imagen externa.'
    )
  }

  // Object-fit: cover (llenar el cuadrado manteniendo proporciones)
  const scale = Math.max(WIDTH / coverImg.width, HEIGHT / coverImg.height)
  const sw = coverImg.width * scale
  const sh = coverImg.height * scale
  const sx = (WIDTH - sw) / 2
  const sy = (HEIGHT - sh) / 2
  ctx.drawImage(coverImg, sx, sy, sw, sh)

  // ── 2. DEGRADADO SUPERIOR (para el área del logo) ─────────────────────────
  const topGrad = ctx.createLinearGradient(0, 0, 0, 240)
  topGrad.addColorStop(0, 'rgba(0,0,0,0.80)')
  topGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, WIDTH, 240)

  // ── 3. DEGRADADO INFERIOR (para el área del texto del beat) ───────────────
  const bottomGrad = ctx.createLinearGradient(0, HEIGHT * 0.45, 0, HEIGHT)
  bottomGrad.addColorStop(0, 'rgba(0,0,0,0)')
  bottomGrad.addColorStop(0.35, 'rgba(0,0,0,0.65)')
  bottomGrad.addColorStop(1, 'rgba(0,0,0,0.93)')
  ctx.fillStyle = bottomGrad
  ctx.fillRect(0, HEIGHT * 0.45, WIDTH, HEIGHT * 0.55)

  // ── 4. URL "otherpeople.es" EN LA PARTE SUPERIOR ──────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = '500 26px Arial, Helvetica, sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillText('otherpeople.es', WIDTH / 2, 26)
  ctx.letterSpacing = '0px'

  // ── 5. LOGO CENTRADO EN LA PARTE SUPERIOR ─────────────────────────────────
  try {
    const logo = await loadImage('/img/logoLowRes.webp')
    const LOGO_MAX_W = 300
    const LOGO_MAX_H = 100
    const logoScale = Math.min(LOGO_MAX_W / logo.width, LOGO_MAX_H / logo.height)
    const lw = logo.width * logoScale
    const lh = logo.height * logoScale
    // Centrar horizontalmente, debajo del texto de URL
    ctx.drawImage(logo, (WIDTH - lw) / 2, 68, lw, lh)
  } catch {
    // Logo no disponible — se omite sin romper la imagen
  }

  // ── 6. NOMBRE DEL BEAT (centrado, parte inferior) ─────────────────────────
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 16
  ctx.fillStyle = '#ffffff'

  // Ajustar tamaño de fuente según longitud del título
  const titleFontSize = title.length > 20 ? 68 : title.length > 12 ? 78 : 90
  ctx.font = `800 ${titleFontSize}px Arial, Helvetica, sans-serif`
  const titleY = drawWrappedText(ctx, title.toUpperCase(), WIDTH / 2, HEIGHT - 140, WIDTH - 80, titleFontSize * 1.15)

  // ── 7. PRODUCTORES DEBAJO DEL TÍTULO ─────────────────────────────────────
  const allProducers = [producer, ...colaboradores]
    .filter(Boolean)
    .map(p => p.trim())
    .join('  ·  ')

  if (allProducers) {
    ctx.fillStyle = 'rgba(255,255,255,0.80)'
    ctx.font = '400 38px Arial, Helvetica, sans-serif'
    ctx.shadowBlur = 10
    const producerY = Math.max(titleY + 52, HEIGHT - 60)
    drawWrappedText(ctx, allProducers, WIDTH / 2, producerY, WIDTH - 120, 46)
  }

  ctx.shadowBlur = 0

  // ── 8. DESCARGA ────────────────────────────────────────────────────────────
  const filename = `${title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-')}-promo.png`
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
