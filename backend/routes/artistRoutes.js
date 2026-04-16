const express = require('express');
const imageUpload = require('../middleware/imageUpload');
const {
    getArtists,
    getArtist,
    createArtist,
    updateArtist,
    deleteArtist
} = require('../controllers/artistController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions, checkOwnership } = require('../middleware/permissions');

const router = express.Router();

// GET todos los artistas (público)
router.get('/', getArtists);

// GET un solo artista por ID (público)
router.get('/:id', getArtist);

// POST (crear) un nuevo artista (requiere autenticación y permisos)
router.post('/', 
  checkJwt, 
  checkPermissions(['write:artists']),
  imageUpload.single('image'), // Acepta campo 'image' opcional
  createArtist
);

// PATCH (actualizar) un artista (requiere ser dueño o admin)
router.patch('/:id', 
  checkJwt, 
  checkPermissions(['write:artists']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional
  updateArtist
);

// PUT (actualizar) un artista (requiere ser dueño o admin)
router.put('/:id', 
  checkJwt, 
  checkPermissions(['write:artists']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional
  updateArtist
);

// DELETE un artista (requiere ser dueño o admin)
router.delete('/:id', 
  checkJwt, 
  checkPermissions(['delete:artists']), 
  checkOwnership,
  deleteArtist
);

module.exports = router;

