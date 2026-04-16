const express = require('express');
const imageUpload = require('../middleware/imageUpload');
const {
    getBeats,
    getBeat,
    createBeat,
    updateBeat,
    deleteBeat,
    createCheckoutSession
} = require('../controllers/beatController');
const { checkJwt, optionalJwt } = require('../middleware/auth');
const { checkPermissions, checkOwnership } = require('../middleware/permissions');

const router = express.Router();

// GET all beats (public, but returns full file data if authenticated)
router.get('/', optionalJwt, getBeats);

// POST create checkout session for beat purchase (public - no auth required)
// IMPORTANTE: Debe estar ANTES de /:id para evitar conflictos
router.post('/create-checkout-session',
  createCheckoutSession
);

// GET a single beat by ID (public, but returns full data if authenticated)
router.get('/:id', optionalJwt, getBeat);

// POST (create) a new beat (requires auth and permissions)
router.post('/', 
  checkJwt, 
  checkPermissions(['write:beats']),
  imageUpload.single('image'), // Acepta campo 'image' opcional para coverUrl
  createBeat
);

// PATCH (update) a beat (requires owner or admin)
router.patch('/:id', 
  checkJwt, 
  checkPermissions(['write:beats']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional para coverUrl
  updateBeat
);

// PUT (update) a beat (requires owner or admin)
router.put('/:id', 
  checkJwt, 
  checkPermissions(['write:beats']), 
  checkOwnership,
  imageUpload.single('image'), // Acepta campo 'image' opcional para coverUrl
  updateBeat
);

// DELETE a beat (requires owner or admin)
router.delete('/:id', 
  checkJwt, 
  checkPermissions(['delete:beats']), 
  checkOwnership,
  deleteBeat
);

module.exports = router;
