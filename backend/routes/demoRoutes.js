const express = require('express');
const { createDemo, listDemos, updateDemo, checkDemoRateLimit } = require('../controllers/demoController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

const router = express.Router();

// Pública: formulario de /enviar-maqueta.
router.post('/', checkDemoRateLimit, createDemo);

// Panel de gestión.
router.get('/', checkJwt, checkPermissions(['admin:all']), listDemos);
router.patch('/:id', checkJwt, checkPermissions(['admin:all']), updateDemo);

module.exports = router;
