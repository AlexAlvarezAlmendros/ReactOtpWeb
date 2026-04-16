const express = require('express');
const {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getNewsletterSubscriptions,
    checkSubscriptionStatus,
    deleteSubscription,
    checkSubscriptionRateLimit,
    sendScheduledNewsletters
} = require('../controllers/newsletterController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

const router = express.Router();

// POST - Suscribirse a la newsletter (público con rate limiting)
router.post('/subscribe', 
    checkSubscriptionRateLimit,
    subscribeToNewsletter
);

// POST - Desuscribirse de la newsletter (público con rate limiting)
router.post('/unsubscribe', 
    checkSubscriptionRateLimit,
    unsubscribeFromNewsletter
);

// GET - Verificar estado de suscripción (público)
router.get('/status', 
    checkSubscriptionStatus
);

// GET - Obtener todas las suscripciones (solo admin)
router.get('/subscriptions', 
    checkJwt,
    checkPermissions(['admin:all']),
    getNewsletterSubscriptions
);

// DELETE - Eliminar suscripción permanentemente (solo admin)
router.delete('/subscriptions/:id', 
    checkJwt,
    checkPermissions(['admin:all']),
    deleteSubscription
);

// POST/GET - Enviar newsletters programadas (se puede usar con Vercel Cron o manualmente)
// Protegido con token en header para seguridad
// Vercel Cron usa GET con Authorization Bearer header
router.get('/send-scheduled', 
    sendScheduledNewsletters
);
router.post('/send-scheduled', 
    sendScheduledNewsletters
);

module.exports = router;
