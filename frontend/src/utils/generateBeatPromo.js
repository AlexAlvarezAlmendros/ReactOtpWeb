/**
 * Genera una imagen promocional para un beat usando HTML Canvas.
 * Estética inspirada en el hero del detalle del beat en vista móvil.
 *
 * Formato: 3000x3000 px (alta calidad, apto para impresión y redes).
 */

const WIDTH = 3000
const HEIGHT = 3000

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
 * Pinta texto centrado con saltos de línea automáticos.
 */
function drawWrappedText (ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = words[i]
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return y + (lines.length - 1) * lineHeight
}

/**
 * @param {object} params
 * @param {string}   params.title
 * @param {string}   params.producer
 * @param {string[]} params.colaboradores
 * @param {string}   params.coverUrl
 */
export async function generateBeatPromoImage ({ title, producer, colaboradores = [], coverUrl }) {
  if (!coverUrl) {
    throw new Error('No hay portada disponible para generar la imagen.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // ── 1. PORTADA COMO FONDO (full-bleed, object-fit: cover) ─────────────────
  let coverImg
  try {
    coverImg = await loadImage(coverUrl, true)
  } catch {
    throw new Error(
      'No se pudo cargar la portada. Puede ser un problema de CORS con la imagen externa.'
    )
  }

  const scale = Math.max(WIDTH / coverImg.width, HEIGHT / coverImg.height)
  const sw = coverImg.width * scale
  const sh = coverImg.height * scale
  const sx = (WIDTH - sw) / 2
  const sy = (HEIGHT - sh) / 2
  ctx.drawImage(coverImg, sx, sy, sw, sh)

  // ── 2. DEGRADADO INFERIOR FUERTE (igual que hero móvil) ───────────────────
  const gradStartY = HEIGHT * 0.40
  const grad = ctx.createLinearGradient(0, HEIGHT, 0, gradStartY)
  grad.addColorStop(0, 'rgba(0,0,0,0.92)')
  grad.addColorStop(0.5, 'rgba(0,0,0,0.65)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, gradStartY, WIDTH, HEIGHT - gradStartY)

  // ── 3. TINTE SUAVE EN LA ZONA DEL LOGO ────────────────────────────────────
  const TOP_TINT_H = 800
  const topGrad = ctx.createLinearGradient(0, 0, 0, TOP_TINT_H)
  topGrad.addColorStop(0, 'rgba(0,0,0,0.45)')
  topGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, WIDTH, TOP_TINT_H)

  // ── 4. LOGO GRANDE CENTRADO ARRIBA ───────────────────────────────────────
  try {
    const logo = await loadImage('/img/logoLowRes.webp')
    const LOGO_MAX_W = 1200
    const LOGO_MAX_H = 600
    const logoScale = Math.min(LOGO_MAX_W / logo.width, LOGO_MAX_H / logo.height)
    const lw = logo.width * logoScale
    const lh = logo.height * logoScale
    ctx.drawImage(logo, (WIDTH - lw) / 2, 140, lw, lh)
  } catch {
    // Logo opcional
  }

  // ── 5. TÍTULO DEL BEAT (parte inferior, centrado) ────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur = 36
  ctx.shadowOffsetY = 4

  // Tamaños ~50% más pequeños que la versión anterior (escalado a 3000px)
  const len = title.length
  const titleFontSize = len > 24 ? 100 : len > 16 ? 122 : len > 10 ? 144 : 168
  ctx.font = `800 ${titleFontSize}px "Helvetica Neue", Arial, sans-serif`

  const maxTitleWidth = WIDTH - 360
  const upperTitle = title.toUpperCase()
  const words = upperTitle.split(' ')
  let line = ''
  let lineCount = 1
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i]
    if (ctx.measureText(test).width > maxTitleWidth && line) {
      lineCount++
      line = words[i]
    } else {
      line = test
    }
  }

  const titleLineHeight = titleFontSize * 1.05
  const producerOffset = 90
  const bottomReserved = 180 // espacio para "otherpeople.es" abajo
  const blockBottomMargin = 80 // distancia entre productor y otherpeople.es

  // Y del productor (calculada desde abajo)
  const producerY = HEIGHT - bottomReserved - blockBottomMargin
  const titleStartY = producerY - producerOffset - (lineCount - 1) * titleLineHeight

  drawWrappedText(ctx, upperTitle, WIDTH / 2, titleStartY, maxTitleWidth, titleLineHeight)

  // ── 6. PRODUCTORES ────────────────────────────────────────────────────────
  const allProducers = [producer, ...colaboradores]
    .filter(Boolean)
    .map(p => p.trim())
    .join(', ')

  if (allProducers) {
    ctx.fillStyle = 'rgba(255,255,255,0.80)'
    ctx.font = '500 52px "Helvetica Neue", Arial, sans-serif'
    ctx.shadowBlur = 20
    drawWrappedText(ctx, allProducers, WIDTH / 2, producerY, WIDTH - 480, 64)
  }

  // ── 7. "OTHERPEOPLE.ES" ABAJO DEL TODO, CENTRADO ──────────────────────────
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 2
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '700 44px "Helvetica Neue", Arial, sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.fillText('OTHERPEOPLE.ES', WIDTH / 2, HEIGHT - 80)

  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // ── 8. DESCARGA EN MÁXIMA CALIDAD ─────────────────────────────────────────
  const filename = `${title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-') || 'beat'}-promo.png`
  await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve()
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      link.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        resolve()
      }, 1000)
    }, 'image/png')
  })
}
