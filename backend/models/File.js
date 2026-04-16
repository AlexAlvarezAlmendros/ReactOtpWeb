const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['audio', 'archive'] // audio para mp3/wav, archive para zip/rar
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true // tamaño en bytes
  },
  cloudinaryId: {
    type: String,
    required: true,
    unique: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['video', 'raw'] // Cloudinary usa 'video' para audio y 'raw' para otros archivos
  },
  format: {
    type: String,
    required: true // mp3, wav, zip, rar, etc.
  },
  duration: {
    type: Number, // duración en segundos (solo para archivos de audio)
    default: null
  },
  uploadedBy: {
    type: String, // Puede ser el ID del usuario que subió el archivo
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt y updatedAt
});

// Índices para búsquedas más rápidas
fileSchema.index({ fileType: 1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ createdAt: -1 });

const File = mongoose.model('File', fileSchema);

module.exports = File;
