const express = require('express');
const router = express.Router();
const {
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  updateEventPermissions,
  updateProfile
} = require('../controllers/userController');
const { checkJwt, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/users/me
 * Obtener información del usuario actual
 * Requiere autenticación
 */
router.get('/me', checkJwt, getCurrentUser);

/**
 * PATCH /api/users/me
 * Actualizar perfil del usuario actual
 * Requiere autenticación
 */
router.patch('/me', checkJwt, updateProfile);

/**
 * GET /api/users
 * Listar todos los usuarios
 * Requiere autenticación + rol admin
 */
router.get('/', checkJwt, requireAdmin, getAllUsers);

/**
 * PUT /api/users/:id/role
 * Cambiar el rol de un usuario
 * Requiere autenticación + rol admin
 */
router.put('/:id/role', checkJwt, requireAdmin, updateUserRole);

/**
 * PUT /api/users/:id/event-permissions
 * Asignar permisos de eventos específicos a un usuario staff
 * Requiere autenticación + rol admin
 */
router.put('/:id/event-permissions', checkJwt, requireAdmin, updateEventPermissions);

module.exports = router;
