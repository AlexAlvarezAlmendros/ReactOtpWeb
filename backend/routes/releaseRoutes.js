const express = require('express');
const imageUpload = require('../middleware/imageUpload');
const {
    getReleases,
    getRelease,
    createRelease,
    updateRelease,
    deleteRelease,
    getReleasesByArtist
} = require('../controllers/releaseController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions, checkOwnership } = require('../middleware/permissions');

const router = express.Router();

// GET todos los releases (público)
router.get('/', getReleases);

// GET releases por nombre de artista en subtitle (público)
router.get('/artist/:artist', getReleasesByArtist);

// GET un solo release por ID (público)
router.get('/:id', getRelease);

// POST (crear) un nuevo release (requiere autenticación y permisos)
router.post('/', 
  checkJwt, 
  checkPermissions(['write:releases']),
  imageUpload.single('image'), // Acepta campo 'image' opcional
  createRelease
);

// PATCH (actualizar) un release (requiere ser dueño o admin)
router.patch('/:id', 
  checkJwt, 
  checkPermissions(['write:releases']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional
  updateRelease
);

// PUT (actualizar) un release (requiere ser dueño o admin)
router.put('/:id', 
  checkJwt, 
  checkPermissions(['write:releases']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional
  updateRelease
);

// DELETE un release (requiere ser dueño o admin)
router.delete('/:id', 
  checkJwt, 
  checkPermissions(['delete:releases']), 
  checkOwnership,
  deleteRelease
);

module.exports = router;

