const express = require('express');
const router = express.Router();
const {
	createCheckoutSession,
	handleWebhook,
	getTicketInfo,
	validateTicketByCode,
	downloadTicket,
	verifyTicket,
	validateTicket,
	getMyTickets,
	getEventSales,
	debugGetAllTickets
} = require('../controllers/ticketController');
const { checkJwt, requireStaffOrAdmin, requireAdmin } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

/**
 * POST /api/tickets/create-checkout-session
 * Crear una sesión de Stripe Checkout
 * Público
 */
router.post('/create-checkout-session', createCheckoutSession);

/**
 * NOTA: El webhook está configurado directamente en index.js
 * porque necesita express.raw() antes de express.json()
 * Ver: app.post('/api/tickets/webhook', ...)
 */

/**
 * GET /api/tickets/my-tickets
 * Obtener los tickets del usuario autenticado
 * Requiere autenticación
 * IMPORTANTE: Esta ruta debe estar ANTES de /verify/:ticketCode
 */
router.get('/my-tickets', checkJwt, getMyTickets);

/**
 * GET /api/tickets/event/:eventId/sales
 * Obtener estadísticas de ventas de un evento
 * Requiere autenticación de admin
 */
router.get('/event/:eventId/sales', checkJwt, checkPermissions(['admin:all']), getEventSales);

/**
 * GET /api/tickets/info/:validationCode
 * Obtener información pública del ticket
 * NO requiere autenticación (para que cualquiera pueda ver info básica)
 */
router.get('/info/:validationCode', getTicketInfo);

/**
 * POST /api/tickets/validate/:validationCode
 * Validar un ticket (marcar como usado)
 * Requiere autenticación + rol staff o admin
 */
router.post('/validate/:validationCode', checkJwt, requireStaffOrAdmin, validateTicketByCode);

/**
 * GET /api/tickets/download/:ticketId
 * Descargar el PDF del ticket
 * Requiere autenticación (solo el comprador)
 */
router.get('/download/:ticketId', checkJwt, downloadTicket);

/**
 * GET /api/tickets/verify/:ticketCode
 * Verificar la validez de un ticket (método antiguo, mantener por compatibilidad)
 * Público (para que puedan verificar en la puerta)
 */
router.get('/verify/:ticketCode', verifyTicket);

/**
 * POST /api/tickets/validate-old/:ticketCode
 * Marcar un ticket como validado (método antiguo, mantener por compatibilidad)
 * Requiere autenticación de admin
 */
router.post('/validate-old/:ticketCode', checkJwt, checkPermissions(['admin:all']), validateTicket);

/**
 * GET /api/tickets/debug/all
 * Ver TODOS los tickets en la base de datos
 * NO requiere autenticación (solo para debugging)
 */
router.get('/debug/all', debugGetAllTickets);

module.exports = router;
