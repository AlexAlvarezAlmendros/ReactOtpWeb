const express = require('express');
const router = express.Router();
const {
  uploadAudio,
  uploadArchive,
  uploadAudioFile,
  uploadArchiveFile,
  createFileRecord,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
  getDownloadUrl,
  handleMulterError,
  generateSignedUploadParams,
  testCloudinaryConnection
} = require('../controllers/fileController');

// Ruta de diagnóstico para verificar configuración de Cloudinary
router.get('/cloudinary/test', testCloudinaryConnection);

// Ruta para obtener parámetros de subida firmados (para archivos >10MB)
router.get('/upload/signed-params', generateSignedUploadParams);

// Ruta para registrar archivo después de signed upload directo a Cloudinary
router.post('/', createFileRecord);

// Manejar preflight request para upload de audio
router.options('/upload/audio', (req, res) => {
  res.status(204).end();
});

// Rutas para subir archivos (con manejo de errores de multer)
router.post('/upload/audio', (req, res, next) => {
  uploadAudio.single('file')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    uploadAudioFile(req, res, next);
  });
});

// Manejar preflight request para upload de archive
router.options('/upload/archive', (req, res) => {
  res.status(204).end();
});

router.post('/upload/archive', (req, res, next) => {
  uploadArchive.single('file')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    uploadArchiveFile(req, res, next);
  });
});

// Rutas CRUD
router.get('/', getAllFiles);
router.get('/:id', getFileById);
router.patch('/:id', updateFile);
router.delete('/:id', deleteFile);

// Ruta para obtener URL de descarga
router.get('/:id/download', getDownloadUrl);

module.exports = router;
