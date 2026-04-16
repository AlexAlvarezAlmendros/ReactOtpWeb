const express = require('express');
const {
    getStudios,
    getStudio,
    createStudio,
    updateStudio,
    deleteStudio
} = require('../controllers/studioController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions, checkOwnership } = require('../middleware/permissions');

const router = express.Router();

// GET todos los estudios (público)
router.get('/', getStudios);

// GET un solo estudio por ID (público)
router.get('/:id', getStudio);

// POST (crear) un nuevo estudio (requiere autenticación y permisos)
router.post('/', 
  checkJwt, 
  checkPermissions(['write:studios']), 
  createStudio
);

// PATCH (actualizar) un estudio (requiere ser dueño o admin)
router.patch('/:id', 
  checkJwt, 
  checkPermissions(['write:studios']), 
  checkOwnership,
  updateStudio
);

// PUT (actualizar) un estudio (requiere ser dueño o admin)
router.put('/:id', 
  checkJwt, 
  checkPermissions(['write:studios']), 
  checkOwnership,
  updateStudio
);

// DELETE un estudio (requiere ser dueño o admin)
router.delete('/:id', 
  checkJwt, 
  checkPermissions(['delete:studios']), 
  checkOwnership,
  deleteStudio
);

module.exports = router;

