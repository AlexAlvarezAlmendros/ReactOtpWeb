const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');
const User = require('../models/User');

// Log de variables de entorno
console.log('🔐 Auth0 config:');
console.log('  - Domain:', process.env.AUTH0_DOMAIN);
console.log('  - Audience:', process.env.AUTH0_AUDIENCE);
console.log('  - JWKS URI:', `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`);

const checkJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  onExpired: (req, res, err) => {
    console.log('❌ Token expired:', err.message);
  }
});

// Middleware para logging
const logJwtResult = (req, res, next) => {
  console.log('🔐 JWT middleware result:');
  console.log('✅ User authenticated:', !!req.user);
  if (req.user) {
    console.log('👤 User sub:', req.user.sub);
    console.log('📧 User email:', req.user.email);
    console.log('🔑 Token content keys:', Object.keys(req.user));
  }
  next();
};

// Middleware para cargar el rol del usuario desde la BD
const loadUserRole = async (req, res, next) => {
  try {
    if (!req.auth && !req.user) {
      return next();
    }

    const auth0Id = (req.auth || req.user).sub;
    const user = await User.findOne({ auth0Id });

    if (user) {
      req.userRole = user.role;
      req.userId = user._id;
    } else {
      // Usuario no existe en BD local, es 'user' por defecto
      req.userRole = 'user';
    }

    next();
  } catch (error) {
    console.error('Error loading user role:', error);
    req.userRole = 'user'; // Default en caso de error
    next();
  }
};

// Middleware para requerir rol staff o admin
const requireStaffOrAdmin = async (req, res, next) => {
  try {
    const authData = req.auth || req.user;
    
    if (!authData) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log('🔐 requireStaffOrAdmin - Checking roles...');
    console.log('📋 Auth data:', JSON.stringify(authData, null, 2));

    // Extraer roles del token (custom claim de Auth0)
    const roles = authData['https://otp-records.com/roles'] 
      || authData['http://otp-records.com/roles'] 
      || authData.roles 
      || [];

    console.log('🎭 Roles from token:', roles);

    // Normalizar roles a minúsculas para comparación case-insensitive
    const normalizedRoles = Array.isArray(roles) 
      ? roles.map(r => r.toLowerCase()) 
      : [];

    // Verificar si tiene rol de staff o admin
    const hasPermission = normalizedRoles.includes('staff') || normalizedRoles.includes('admin');

    if (!hasPermission) {
      console.log('❌ Access denied - User roles:', roles);
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Se requiere rol de staff o administrador',
        yourRoles: roles
      });
    }

    console.log('✅ Access granted - User has permission');

    // Opcionalmente cargar datos del usuario de la BD para tener el _id
    const auth0Id = authData.sub;
    const user = await User.findOne({ auth0Id });
    
    if (user) {
      req.userId = user._id;
      req.userDoc = user;
    }

    // Guardar roles en request
    req.userRole = normalizedRoles.includes('admin') ? 'admin' : 'staff';
    req.userRoles = roles;

    next();
  } catch (error) {
    console.error('❌ Error in requireStaffOrAdmin:', error);
    res.status(500).json({ error: 'Error verificando permisos' });
  }
};

// Middleware para requerir solo admin
const requireAdmin = async (req, res, next) => {
  try {
    const authData = req.auth || req.user;
    
    if (!authData) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log('🔐 requireAdmin - Checking roles...');
    console.log('📋 Auth data:', JSON.stringify(authData, null, 2));

    // Extraer roles del token (custom claim de Auth0)
    const roles = authData['https://otp-records.com/roles'] 
      || authData['http://otp-records.com/roles'] 
      || authData.roles 
      || [];

    console.log('🎭 Roles from token:', roles);

    // Normalizar roles a minúsculas para comparación case-insensitive
    const normalizedRoles = Array.isArray(roles) 
      ? roles.map(r => r.toLowerCase()) 
      : [];

    // Verificar si tiene rol de admin
    const isAdmin = normalizedRoles.includes('admin');

    if (!isAdmin) {
      console.log('❌ Access denied - User roles:', roles);
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Se requiere rol de administrador',
        yourRoles: roles
      });
    }

    console.log('✅ Access granted - User is admin');

    // Opcionalmente cargar datos del usuario de la BD para tener el _id
    const auth0Id = authData.sub;
    const user = await User.findOne({ auth0Id });
    
    if (user) {
      req.userId = user._id;
      req.userDoc = user;
    }

    req.userRole = 'admin';
    req.userRoles = roles;

    next();
  } catch (error) {
    console.error('❌ Error in requireAdmin:', error);
    res.status(500).json({ error: 'Error verificando permisos' });
  }
};

// Middleware opcional de JWT: intenta autenticar pero no falla si no hay token
const optionalJwt = (req, res, next) => {
  // Si no hay header Authorization, continuar sin autenticar
  if (!req.headers.authorization) {
    return next();
  }
  // Intentar autenticar; si falla, continuar sin autenticar
  checkJwt(req, res, (err) => {
    if (err) {
      // Token inválido o expirado: continuar como usuario no autenticado
      return next();
    }
    next();
  });
};

module.exports = { 
  checkJwt, 
  optionalJwt,
  logJwtResult, 
  loadUserRole,
  requireStaffOrAdmin,
  requireAdmin
};
