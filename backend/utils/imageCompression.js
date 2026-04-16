let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('[ImageCompression] sharp no disponible, las imágenes se subirán sin comprimir:', err.message);
  sharp = null;
}

/**
 * Comprime una imagen sin pérdida perceptible de calidad.
 * - JPEG/JPG: calidad 85, optimización progresiva
 * - PNG: compresión nivel 9 con palette adaptativo
 * - WebP: calidad 85
 * - GIF: se devuelve sin modificar (compatibilidad con animaciones)
 * - Imágenes mayores a MAX_DIMENSION se redimensionan proporcionalmente.
 *
 * @param {Buffer} imageBuffer - Buffer original de la imagen
 * @param {string} mimetype - Tipo MIME de la imagen (image/jpeg, image/png, etc.)
 * @param {Object} [options] - Opciones de compresión
 * @param {number} [options.maxDimension=2048] - Dimensión máxima (ancho o alto)
 * @param {number} [options.quality=85] - Calidad de compresión (1-100)
 * @returns {Promise<Buffer>} Buffer de la imagen comprimida
 */
const compressImage = async (imageBuffer, mimetype, options = {}) => {
  const { maxDimension = 2048, quality = 85 } = options;

  // Si sharp no está disponible, devolver la imagen sin comprimir
  if (!sharp) {
    console.warn('[ImageCompression] sharp no disponible, devolviendo imagen original');
    return imageBuffer;
  }

  // GIF: devolver sin modificar para preservar animaciones
  if (mimetype === 'image/gif') {
    return imageBuffer;
  }

  try {
    let pipeline = sharp(imageBuffer);

    // Obtener metadatos para decidir si redimensionar
    const metadata = await pipeline.metadata();

    // Redimensionar si alguna dimensión excede el máximo
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      pipeline = pipeline.resize(maxDimension, maxDimension, {
        fit: 'inside',           // Mantiene proporción, no recorta
        withoutEnlargement: true // Nunca agranda imágenes pequeñas
      });
    }

    // Aplicar compresión según formato
    switch (mimetype) {
      case 'image/jpeg':
      case 'image/jpg':
        pipeline = pipeline.jpeg({
          quality,
          progressive: true,    // Carga progresiva en el navegador
          mozjpeg: true          // Usa mozjpeg para mejor compresión
        });
        break;

      case 'image/png':
        pipeline = pipeline.png({
          compressionLevel: 9,   // Máxima compresión sin pérdida
          palette: true,         // Usa paleta cuando es posible (reduce tamaño)
          effort: 10             // Máximo esfuerzo de optimización
        });
        break;

      case 'image/webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6              // Balance entre velocidad y compresión
        });
        break;

      default:
        // Formato no reconocido: convertir a JPEG como fallback
        pipeline = pipeline.jpeg({
          quality,
          progressive: true,
          mozjpeg: true
        });
        break;
    }

    const compressedBuffer = await pipeline.toBuffer();

    // Log de compresión para monitoreo
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(
      `[ImageCompression] ${mimetype}: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (${savings}% reducción)`
    );

    // Si la compresión aumentó el tamaño (raro pero posible), devolver el original
    if (compressedSize >= originalSize) {
      console.log('[ImageCompression] Compresión no redujo el tamaño, usando original');
      return imageBuffer;
    }

    return compressedBuffer;
  } catch (error) {
    console.error('[ImageCompression] Error al comprimir imagen:', error.message);
    // En caso de error, devolver la imagen original sin comprimir
    return imageBuffer;
  }
};

module.exports = { compressImage };
