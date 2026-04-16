const express = require('express');
const {
    sendContactMessage,
    getContactMessages,
    getContactMessage,
    deleteContactMessage,
    checkEmailService,
    checkContactRateLimit
} = require('../controllers/contactController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

const router = express.Router();

// POST - Enviar mensaje de contacto (público con rate limiting)
router.post('/', 
    checkContactRateLimit,
    sendContactMessage
);

// GET - Health check del servicio de email (público)
router.get('/health', checkEmailService);

// GET - Obtener todos los mensajes de contacto (solo admin)
router.get('/messages', 
    checkJwt,
    checkPermissions(['admin:all']),
    getContactMessages
);

// GET - Obtener un mensaje específico (solo admin)
router.get('/messages/:id', 
    checkJwt,
    checkPermissions(['admin:all']),
    getContactMessage
);

// DELETE - Eliminar mensaje de contacto (solo admin)
router.delete('/messages/:id', 
    checkJwt,
    checkPermissions(['admin:all']),
    deleteContactMessage
);

module.exports = router;
