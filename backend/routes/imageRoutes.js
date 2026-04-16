const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadToImgBB,
  handleImageUploadError
} = require('../controllers/imageController');

// Ruta para subir imagen a ImgBB
router.post('/upload', (req, res, next) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return handleImageUploadError(err, req, res, next);
    }
    uploadToImgBB(req, res, next);
  });
});

module.exports = router;
