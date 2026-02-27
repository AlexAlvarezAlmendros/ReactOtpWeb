/**
 * Utilidad para comprimir imágenes en el navegador usando Canvas API.
 * Reduce el tamaño de las imágenes para que no excedan el límite
 * de body de las funciones serverless de Vercel (~4.5MB).
 *
 * @module imageCompressor
 */

/** Tamaño máximo permitido en bytes (3.5MB - margen de seguridad para FormData overhead) */
const MAX_FILE_SIZE = 3.5 * 1024 * 1024

/** Dimensión máxima de ancho o alto en píxeles */
const MAX_DIMENSION = 2048

/** Calidad inicial de compresión JPEG/WebP (0-1) */
const INITIAL_QUALITY = 0.85

/** Calidad mínima de compresión antes de abortar */
const MIN_QUALITY = 0.3

/** Paso de reducción de calidad en cada iteración */
const QUALITY_STEP = 0.1

/**
 * Carga un archivo de imagen en un elemento HTMLImageElement
 * @param {File} file - Archivo de imagen
 * @returns {Promise<HTMLImageElement>} Imagen cargada
 */
function loadImage (file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Error al cargar la imagen para compresión'))

    const url = URL.createObjectURL(file)
    img.src = url
  })
}

/**
 * Calcula las nuevas dimensiones manteniendo el aspect ratio
 * @param {number} width - Ancho original
 * @param {number} height - Alto original
 * @param {number} maxDimension - Dimensión máxima permitida
 * @returns {{ width: number, height: number }} Nuevas dimensiones
 */
function calculateDimensions (width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height)
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  }
}

/**
 * Dibuja una imagen en un canvas con las dimensiones especificadas
 * y devuelve un Blob comprimido
 * @param {HTMLImageElement} img - Imagen a comprimir
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 * @param {number} quality - Calidad de compresión (0-1)
 * @param {string} mimeType - Tipo MIME de salida
 * @returns {Promise<Blob>} Blob comprimido
 */
function canvasToBlob (img, width, height, quality, mimeType) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Error al generar la imagen comprimida'))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * Comprime una imagen para que no exceda el tamaño máximo permitido.
 * Primero redimensiona si es necesario, luego reduce la calidad iterativamente.
 *
 * @param {File} file - Archivo de imagen original
 * @param {Object} [options] - Opciones de compresión
 * @param {number} [options.maxFileSize] - Tamaño máximo en bytes (default: 3.5MB)
 * @param {number} [options.maxDimension] - Dimensión máxima en px (default: 2048)
 * @param {number} [options.initialQuality] - Calidad inicial (default: 0.85)
 * @returns {Promise<File>} Archivo comprimido (o el original si ya es pequeño)
 *
 * @example
 * const compressed = await compressImage(largeFile)
 * // compressed.size <= 3.5MB garantizado
 * formData.append('image', compressed)
 */
export async function compressImage (file, options = {}) {
  const {
    maxFileSize = MAX_FILE_SIZE,
    maxDimension = MAX_DIMENSION,
    initialQuality = INITIAL_QUALITY
  } = options

  // Si el archivo ya es pequeño, devolver sin modificar
  if (file.size <= maxFileSize) {
    console.log(`📷 Imagen "${file.name}" ya es suficientemente pequeña (${formatSize(file.size)})`)
    return file
  }

  console.log(`📷 Comprimiendo imagen "${file.name}" (${formatSize(file.size)})...`)

  // Cargar imagen
  const img = await loadImage(file)
  const originalWidth = img.naturalWidth
  const originalHeight = img.naturalHeight

  // Calcular dimensiones reducidas
  const { width, height } = calculateDimensions(originalWidth, originalHeight, maxDimension)

  // Usar JPEG para compresión (mejor ratio que PNG)
  // Mantener WebP si el navegador lo soporta bien
  const outputType = 'image/jpeg'
  const extension = 'jpg'

  let quality = initialQuality
  let blob = null

  // Intentar comprimir reduciendo calidad iterativamente
  while (quality >= MIN_QUALITY) {
    blob = await canvasToBlob(img, width, height, quality, outputType)

    console.log(`  → Calidad ${(quality * 100).toFixed(0)}%: ${formatSize(blob.size)}`)

    if (blob.size <= maxFileSize) {
      break
    }

    quality -= QUALITY_STEP
  }

  // Si aún es muy grande, reducir dimensiones más agresivamente
  if (blob && blob.size > maxFileSize) {
    let shrinkFactor = 0.75
    while (shrinkFactor >= 0.25 && blob.size > maxFileSize) {
      const shrunkWidth = Math.round(width * shrinkFactor)
      const shrunkHeight = Math.round(height * shrinkFactor)

      blob = await canvasToBlob(img, shrunkWidth, shrunkHeight, MIN_QUALITY, outputType)
      console.log(`  → Dimensiones ${shrunkWidth}x${shrunkHeight}: ${formatSize(blob.size)}`)

      shrinkFactor -= 0.25
    }
  }

  // Revocar el object URL de la imagen cargada
  URL.revokeObjectURL(img.src)

  if (!blob || blob.size > maxFileSize) {
    console.warn('⚠️ No se pudo comprimir la imagen lo suficiente, enviando la mejor versión')
  }

  // Generar nombre de archivo comprimido
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const compressedName = `${baseName}_compressed.${extension}`

  // Convertir Blob a File para mantener compatibilidad con FormData
  const compressedFile = new File([blob], compressedName, {
    type: outputType,
    lastModified: Date.now()
  })

  const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
  console.log(`📷 Compresión completada: ${formatSize(file.size)} → ${formatSize(compressedFile.size)} (-${reduction}%)`)

  return compressedFile
}

/**
 * Verifica si un archivo necesita ser comprimido
 * @param {File} file - Archivo a verificar
 * @param {number} [maxSize] - Tamaño máximo en bytes
 * @returns {boolean} true si el archivo excede el tamaño máximo
 */
export function needsCompression (file, maxSize = MAX_FILE_SIZE) {
  return file && file.size > maxSize
}

/**
 * Formatea un tamaño en bytes a una cadena legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado (ej: "2.5 MB")
 */
export function formatSize (bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
