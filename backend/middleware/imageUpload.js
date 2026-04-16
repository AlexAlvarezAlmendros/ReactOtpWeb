const multer = require('multer');

// Configurar multer para procesar imágenes en memoria
const storage = multer.memoryStorage();

const imageUploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB límite (Vercel serverless max ~4.5MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
  }
});

module.exports = imageUploadMiddleware;
