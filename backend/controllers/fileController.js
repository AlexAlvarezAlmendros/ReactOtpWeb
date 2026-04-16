const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const File = require('../models/File');
const connectDB = require('../utils/dbConnection');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar configuración de Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ ERROR: Faltan credenciales de Cloudinary en .env');
}

console.log('☁️ Cloudinary configurado:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NO CONFIGURADO'
});

// Verificar conexión con Cloudinary
(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary conectado correctamente:', result);
  } catch (err) {
    console.error('❌ Error conectando con Cloudinary:', err.message);
    console.error('⚠️  Verifica tus credenciales de Cloudinary en el .env');
  }
})();

// NOTA: Ya no usamos CloudinaryStorage para audio, ahora subimos directamente
// usando upload_stream con memoryStorage para evitar problemas con multer-storage-cloudinary

// Configurar almacenamiento de Cloudinary para archivos comprimidos
const archiveStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'archive_files',
    resource_type: 'raw' // Para archivos que no son imágenes/videos
    // No especificamos allowed_formats para archivos raw, dejamos que multer valide
  }
});

// Middleware de multer para audio (solo almacenamiento en memoria)
const uploadAudio = multer({
  storage: multer.memoryStorage(), // Almacenar en memoria en lugar de usar CloudinaryStorage
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB límite para audio
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 FileFilter Audio - Validando archivo:', {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

    // Lista extendida de tipos MIME permitidos (diferentes navegadores pueden usar diferentes MIME types)
    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/mp3',       // MP3 (alternativo)
      'audio/mpeg3',     // MP3 (alternativo)
      'audio/wav',       // WAV
      'audio/wave',      // WAV (alternativo)
      'audio/x-wav',     // WAV (alternativo)
      'audio/ogg',       // OGG
      'audio/vorbis',    // OGG (alternativo)
      'audio/flac',      // FLAC
      'audio/x-flac',    // FLAC (alternativo)
      'application/octet-stream' // Tipo genérico cuando el navegador no detecta el tipo
    ];
    
    // Extensiones de archivo permitidas
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
    const fileExtension = file.originalname.toLowerCase().match(/\.[0-9a-z]+$/i);
    const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension[0]);
    
    console.log('🔍 Validación:', {
      mimeTypeMatch: allowedTypes.includes(file.mimetype),
      extensionMatch: hasValidExtension,
      detectedExtension: fileExtension ? fileExtension[0] : 'none'
    });
    
    // Aceptar si tiene el tipo MIME correcto O la extensión correcta
    if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
      console.log('✅ Archivo aceptado');
      cb(null, true);
    } else {
      console.log('❌ Archivo rechazado');
      cb(new Error(`Tipo de archivo no permitido. Recibido: ${file.mimetype}. Solo se aceptan .mp3, .wav, .ogg, .flac`), false);
    }
  }
});

// Middleware de multer para archivos comprimidos
const uploadArchive = multer({
  storage: archiveStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite para raw files (plan gratuito de Cloudinary)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip', 
      'application/x-zip-compressed', 
      'application/x-rar-compressed', 
      'application/x-rar',
      'application/octet-stream', // Algunos navegadores usan este tipo genérico
      'application/x-7z-compressed'
    ];
    const allowedExtensions = ['.zip', '.rar', '.7z'];
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    // Aceptar si tiene el tipo MIME correcto O la extensión correcta
    if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan .zip, .rar, .7z'), false);
    }
  }
});

// Controlador para subir archivo de audio (upload directo a Cloudinary)
const uploadAudioFile = async (req, res) => {
  try {
    console.log('📤 Upload Audio File - Iniciando...');
    console.log('📄 File info:', req.file ? {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      bufferSize: req.file.buffer ? req.file.buffer.length : 0
    } : 'NO FILE');
    console.log('📋 Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    // Validar tamaño mínimo (archivos muy pequeños probablemente están corruptos)
    const minSize = 10 * 1024; // 10KB mínimo
    if (req.file.size < minSize) {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado pequeño (${req.file.size} bytes). Los archivos MP3 válidos suelen ser de al menos 10KB. El archivo puede estar corrupto.`,
        error: 'FILE_TOO_SMALL'
      });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const sanitizedName = req.file.originalname
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50); // Limitar longitud
    const publicId = `audio_files/audio_${timestamp}_${sanitizedName}`;

    console.log('☁️ Subiendo a Cloudinary:', { 
      publicId,
      format: fileExtension,
      size: req.file.size 
    });

    // Subir a Cloudinary usando upload_stream con el buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Forzar como video para archivos de audio
          folder: 'audio_files',
          public_id: `audio_${timestamp}_${sanitizedName}`,
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          format: fileExtension // Especificar formato explícitamente
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error de Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Upload exitoso a Cloudinary:', {
              public_id: result.public_id,
              secure_url: result.secure_url,
              resource_type: result.resource_type,
              format: result.format,
              bytes: result.bytes
            });
            resolve(result);
          }
        }
      );

      // Escribir el buffer al stream
      uploadStream.end(req.file.buffer);
    });

    // Usar formato de Cloudinary o el extraído del nombre del archivo
    const format = uploadResult.format || fileExtension || 'mp3';

    // Crear registro en la base de datos
    const fileData = {
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      fileType: 'audio',
      mimeType: req.file.mimetype,
      size: uploadResult.bytes,
      cloudinaryId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      resourceType: uploadResult.resource_type,
      format: format,
      duration: uploadResult.duration || null,
      uploadedBy: req.body.uploadedBy || null,
      description: req.body.description || '',
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
      isPublic: req.body.isPublic === 'true'
    };

    console.log('💾 Guardando en base de datos:', {
      filename: fileData.filename,
      format: fileData.format,
      size: fileData.size
    });

    const newFile = await File.create(fileData);

    res.status(201).json({
      success: true,
      message: 'Archivo de audio subido exitosamente',
      data: newFile
    });

  } catch (error) {
    console.error('❌ Error al subir archivo de audio:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo de audio',
      error: error.message,
      details: error.error || error.http_code || null
    });
  }
};

// Controlador para subir archivo comprimido
const uploadArchiveFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    // Crear registro en la base de datos
    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: 'archive',
      mimeType: req.file.mimetype,
      size: req.file.size,
      cloudinaryId: req.file.filename,
      cloudinaryUrl: req.file.path,
      secureUrl: req.file.path,
      resourceType: 'raw',
      format: req.file.format || req.file.originalname.split('.').pop(),
      uploadedBy: req.body.uploadedBy || null,
      description: req.body.description || '',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      isPublic: req.body.isPublic === 'true'
    };

    const newFile = await File.create(fileData);

    res.status(201).json({
      success: true,
      message: 'Archivo comprimido subido exitosamente',
      data: newFile
    });

  } catch (error) {
    console.error('Error al subir archivo comprimido:', error);
    
    // Si hubo error, intentar eliminar el archivo de Cloudinary
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      } catch (cleanupError) {
        console.error('Error al limpiar archivo de Cloudinary:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo comprimido',
      error: error.message
    });
  }
};

// Crear registro de archivo después de signed upload directo a Cloudinary
const createFileRecord = async (req, res) => {
  try {
    // Asegurar conexión a base de datos (para Vercel)
    await connectDB();
    
    const {
      filename,
      originalName,
      fileType,
      mimeType,
      size,
      cloudinaryId,
      cloudinaryUrl,
      secureUrl,
      resourceType,
      format,
      duration,
      width,
      height,
      uploadedBy,
      description,
      tags,
      isPublic
    } = req.body;

    // Validar campos requeridos
    if (!filename || !originalName || !fileType || !cloudinaryId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: filename, originalName, fileType, cloudinaryId'
      });
    }

    // Crear registro en la base de datos
    const fileData = {
      filename,
      originalName,
      fileType,
      mimeType: mimeType || 'application/octet-stream',
      size: size || 0,
      cloudinaryId,
      cloudinaryUrl,
      secureUrl,
      resourceType: resourceType || 'raw',
      format,
      duration: duration || null,
      width: width || null,
      height: height || null,
      uploadedBy: uploadedBy || null,
      description: description || '',
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic === true || isPublic === 'true'
    };

    console.log('💾 Creando registro de archivo después de signed upload:', {
      filename: fileData.filename,
      cloudinaryId: fileData.cloudinaryId,
      fileType: fileData.fileType
    });

    const newFile = await File.create(fileData);

    res.status(201).json({
      success: true,
      message: 'Archivo registrado exitosamente',
      data: newFile
    });

  } catch (error) {
    console.error('❌ Error al crear registro de archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el archivo en la base de datos',
      error: error.message
    });
  }
};

// Obtener todos los archivos (con paginación y filtros)
const getAllFiles = async (req, res) => {
  try {
    // Asegurar conexión a base de datos (para Vercel)
    await connectDB();
    
    const { 
      page = 1, 
      limit = 20, 
      fileType, 
      uploadedBy, 
      isPublic,
      search 
    } = req.query;

    const query = {};
    
    if (fileType) query.fileType = fileType;
    if (uploadedBy) query.uploadedBy = uploadedBy;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      data: files,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalFiles: count
    });

  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los archivos',
      error: error.message
    });
  }
};

// Obtener un archivo por ID
const getFileById = async (req, res) => {
  try {
    // Asegurar conexión a base de datos (para Vercel)
    await connectDB();
    
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el archivo',
      error: error.message
    });
  }
};

// Actualizar información del archivo
const updateFile = async (req, res) => {
  try {
    const { description, tags, isPublic } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Archivo actualizado exitosamente',
      data: file
    });

  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el archivo',
      error: error.message
    });
  }
};

// Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    // Asegurar conexión a base de datos (para Vercel)
    await connectDB();
    
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryId, { 
      resource_type: file.resourceType 
    });

    // Eliminar de la base de datos
    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo',
      error: error.message
    });
  }
};

// Descargar/obtener URL de descarga del archivo
const getDownloadUrl = async (req, res) => {
  try {
    // Asegurar conexión a base de datos (para Vercel)
    await connectDB();
    
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Generar URL de descarga temporal (válida por 1 hora)
    // Incluir el formato explícitamente para archivos de audio
    const downloadUrl = cloudinary.url(file.cloudinaryId, {
      resource_type: file.resourceType || 'video',
      type: 'upload',
      format: file.format, // Especificar formato explícitamente (mp3, wav, etc.)
      flags: 'attachment',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    });

    console.log('📥 URL de descarga generada:', {
      cloudinaryId: file.cloudinaryId,
      format: file.format,
      resourceType: file.resourceType,
      url: downloadUrl
    });

    res.status(200).json({
      success: true,
      data: {
        downloadUrl,
        filename: file.originalName,
        expiresIn: '1 hora'
      }
    });

  } catch (error) {
    console.error('Error al generar URL de descarga:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar URL de descarga',
      error: error.message
    });
  }
};

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  console.error('🚨 Multer Error:', {
    message: error.message,
    name: error.name,
    code: error.code,
    field: error.field,
    stack: error.stack
  });
  
  // Log adicional si hay información de Cloudinary
  if (error.storageErrors) {
    console.error('📦 Storage Errors:', error.storageErrors);
  }
  
  // Log del error completo para debugging
  console.error('🔍 Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const fileType = req.path.includes('audio') ? 'audio' : 'archivo comprimido';
      const limit = req.path.includes('audio') ? '100MB' : '10MB';
      return res.status(400).json({
        success: false,
        message: `El ${fileType} excede el límite de ${limit}`,
        error: 'LIMIT_FILE_SIZE'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
      error: error.code
    });
  }
  
  // Error del fileFilter (tipo de archivo no permitido)
  if (error.message && error.message.includes('no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  // Error genérico de upload (probablemente de Cloudinary)
  if (error.message === 'invalid file') {
    return res.status(500).json({
      success: false,
      message: 'Error al subir el archivo a Cloudinary. Por favor verifica las credenciales y límites de tu cuenta.',
      error: 'CLOUDINARY_UPLOAD_ERROR',
      details: error.storageErrors || []
    });
  }
  
  // Si es un error de Cloudinary relacionado con el tamaño
  if (error.message && error.message.includes('File size too large')) {
    return res.status(400).json({
      success: false,
      message: 'El archivo excede el límite permitido por Cloudinary. Para archivos comprimidos el límite es 10MB en el plan gratuito.',
      error: 'CLOUDINARY_SIZE_LIMIT'
    });
  }
  
  next(error);
};

// Generar parámetros firmados para subidas directas (archivos grandes >10MB)
const generateSignedUploadParams = async (req, res) => {
  try {
    const { folder, resourceType } = req.query;
    
    // Validar parámetros
    const allowedFolders = ['audio_files', 'archive_files'];
    const allowedResourceTypes = ['video', 'raw'];
    
    if (!folder || !allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: `Folder inválido. Valores permitidos: ${allowedFolders.join(', ')}`
      });
    }
    
    if (!resourceType || !allowedResourceTypes.includes(resourceType)) {
      return res.status(400).json({
        success: false,
        message: `ResourceType inválido. Valores permitidos: ${allowedResourceTypes.join(', ')}`
      });
    }
    
    // Generar timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parámetros para la firma
    // IMPORTANTE: NO incluir resource_type aquí porque ya está en la URL del endpoint
    // Solo los parámetros que se enviarán en el FormData deben estar en la firma
    const uploadParams = {
      timestamp: timestamp,
      folder: folder
    };
    
    // Generar firma
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );
    
    // Devolver todos los parámetros necesarios para el frontend
    res.json({
      success: true,
      data: {
        signature: signature,
        timestamp: timestamp,
        folder: folder,
        resource_type: resourceType, // Solo para información, no va en la firma
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
      },
      message: 'Parámetros de subida generados exitosamente. Válidos por 1 hora.'
    });
    
  } catch (error) {
    console.error('Error al generar parámetros de subida firmados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar parámetros de subida',
      error: error.message
    });
  }
};

// Endpoint de diagnóstico para verificar configuración de Cloudinary
const testCloudinaryConnection = async (req, res) => {
  try {
    // Verificar que las variables de entorno estén configuradas
    const configCheck = {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    };

    if (!configCheck.cloud_name || !configCheck.api_key || !configCheck.api_secret) {
      return res.status(500).json({
        success: false,
        message: 'Configuración de Cloudinary incompleta',
        config: configCheck
      });
    }

    // Intentar hacer ping a Cloudinary
    const pingResult = await cloudinary.api.ping();

    // Obtener información de uso
    const usage = await cloudinary.api.usage();

    res.json({
      success: true,
      message: 'Cloudinary configurado correctamente',
      data: {
        status: pingResult.status,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        usage: {
          bandwidth: {
            used: usage.bandwidth.usage,
            limit: usage.bandwidth.limit,
            percentage: ((usage.bandwidth.usage / usage.bandwidth.limit) * 100).toFixed(2) + '%'
          },
          storage: {
            used: usage.storage.usage,
            limit: usage.storage.limit,
            percentage: ((usage.storage.usage / usage.storage.limit) * 100).toFixed(2) + '%'
          },
          credits: usage.credits
        }
      }
    });

  } catch (error) {
    console.error('Error verificando conexión con Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al conectar con Cloudinary',
      error: error.message,
      details: error.error || error
    });
  }
};

module.exports = {
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
};
