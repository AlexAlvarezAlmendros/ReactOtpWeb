const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const { compressImage } = require('../utils/imageCompression');

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();

const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB límite (Vercel serverless max ~4.5MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, gif, webp)'), false);
    }
  }
});

// Controlador para subir imagen a ImgBB
const uploadToImgBB = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    
    if (!IMGBB_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'API Key de ImgBB no configurada'
      });
    }

    // Comprimir imagen antes de subir
    const compressedBuffer = await compressImage(req.file.buffer, req.file.mimetype);

    // Convertir buffer comprimido a base64
    const base64Image = compressedBuffer.toString('base64');

    // Crear FormData para ImgBB
    const formData = new FormData();
    formData.append('image', base64Image);
    
    if (req.body.name) {
      formData.append('name', req.body.name);
    }

    // Subir a ImgBB
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (response.data.success) {
      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          url: response.data.data.url,
          displayUrl: response.data.data.display_url,
          deleteUrl: response.data.data.delete_url,
          size: response.data.data.size,
          title: response.data.data.title,
          time: response.data.data.time
        }
      });
    } else {
      throw new Error('Error al subir imagen a ImgBB');
    }

  } catch (error) {
    console.error('Error al subir imagen:', error);
    
    // Errores específicos de ImgBB
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data.error?.message || 'Error al subir la imagen',
        error: error.response.data.error
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};

// Middleware para manejar errores de multer
const handleImageUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'La imagen excede el límite de 4MB. Por favor, reduce el tamaño de la imagen antes de subirla.',
        error: 'LIMIT_FILE_SIZE'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
      error: error.code
    });
  }
  
  if (error.message && error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

module.exports = {
  uploadImage,
  uploadToImgBB,
  handleImageUploadError
};
