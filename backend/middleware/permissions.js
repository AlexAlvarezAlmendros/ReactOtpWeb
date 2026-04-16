const { getUserPermissionsAndRoles, isUserAdmin } = require('../utils/authHelpers');

const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      console.log('🚀 checkPermissions middleware started');
      console.log('🔍 req.user exists:', !!req.user);
      console.log('🔍 req.auth exists:', !!req.auth);
      console.log('🔍 req.auth content:', JSON.stringify(req.auth, null, 2));
      
      // express-jwt v8+ usa req.auth en lugar de req.user
      const user = req.auth || req.user;
      
      if (!user) {
        console.log('❌ No user in request');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { permissions, roles } = getUserPermissionsAndRoles(user);

      console.log('🔍 Checking permissions for user:', user.email || user.sub);
      console.log('📋 Required permissions:', requiredPermissions);
      console.log('✅ User permissions:', permissions);
      console.log('👤 User roles:', roles);

      // Función para mapear roles a permisos (igual que en el frontend)
      const mapRolesToPermissions = (userRoles) => {
        let mappedPermissions = [];
        
        if (userRoles.includes('Admin') || userRoles.includes('admin')) {
          mappedPermissions = [
            'admin:all',
            'read:releases', 'write:releases', 'delete:releases',
            'read:artists', 'write:artists', 'delete:artists',
            'read:events', 'write:events', 'delete:events',
            'read:studios', 'write:studios', 'delete:studios',
            'read:beats', 'write:beats', 'delete:beats'
          ];
        } else if (userRoles.includes('Editor') || userRoles.includes('editor')) {
          mappedPermissions = [
            'read:releases', 'write:releases',
            'read:artists', 'write:artists',
            'read:events', 'write:events',
            'read:studios', 'write:studios',
            'read:beats', 'write:beats'
          ];
        } else if (userRoles.includes('User') || userRoles.includes('user')) {
          mappedPermissions = [
            'read:releases', 'read:artists', 'read:events', 'read:studios', 'read:beats'
          ];
        }
        
        return mappedPermissions;
      };

      // Obtener permisos finales (directos o mapeados desde roles)
      let finalPermissions = [...permissions];
      
      // Si no hay permisos directos pero sí roles, mapear desde roles
      if (finalPermissions.length === 0 && roles.length > 0) {
        finalPermissions = mapRolesToPermissions(roles);
        console.log('🔄 Mapped permissions from roles:', finalPermissions);
      }

      // Verificar permisos
      const hasPermissions = requiredPermissions.every(permission => 
        finalPermissions.includes(permission) || finalPermissions.includes('admin:all')
      );
      
      if (!hasPermissions) {
        console.log('❌ Permission denied');
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermissions,
          userPermissions: finalPermissions,
          userRoles: roles
        });
      }

      console.log('✅ Permission granted');
      next();
    } catch (error) {
      console.error('❌ Error in permissions middleware:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
};

const checkOwnership = (req, res, next) => {
  try {
    // express-jwt v8+ usa req.auth en lugar de req.user
    const user = req.auth || req.user;
    const userId = user.sub;

    // Admin puede acceder a todo
    if (isUserAdmin(user)) {
      console.log('🔑 Admin access granted for user:', user.email || userId);
      return next();
    }
    
    // Para recursos existentes, verificar ownership en el controller
    req.checkOwnership = true;
    req.authenticatedUserId = userId;
    
    console.log('📝 Ownership check required for user:', user.email || userId);
    next();
  } catch (error) {
    console.error('❌ Error in ownership middleware:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { checkPermissions, checkOwnership };