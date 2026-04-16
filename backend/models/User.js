const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // ID del usuario de Auth0
  auth0Id: {
    type: String,
    required: true,
    unique: true
    // index: true eliminado - ya se crea con unique: true
  },
  
  // Información básica
  email: {
    type: String,
    required: true,
    unique: true
    // index: true eliminado - ya se crea con unique: true
  },
  
  name: {
    type: String,
    required: true
  },

  firstName: {
    type: String,
    default: ''
  },

  lastName: {
    type: String,
    default: ''
  },

  linkedArtistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    default: null
  },
  
  // Sistema de roles
  role: {
    type: String,
    enum: ['user', 'artist', 'staff', 'admin'],
    default: 'user'
  },
  
  // Permisos específicos por evento (opcional)
  eventPermissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  // Metadata
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
// auth0Id y email ya tienen índice por unique: true
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
