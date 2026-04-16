// Helper functions para manejo de permisos y roles
const getUserPermissionsAndRoles = (user) => {
  // Buscar permisos en diferentes ubicaciones posibles
  const permissions = user['https://otpwebback-api/permissions'] || 
                     user['https://otp-records.com/permissions'] || 
                     user.permissions ||  // ← Permisos directos del JWT (como en tu token)
                     [];
  
  // Buscar roles en diferentes ubicaciones posibles
  const roles = user['https://otpwebback-api/roles'] || 
               user['https://otp-records.com/roles'] || 
               user.roles || 
               [];

  console.log('🔍 authHelpers - Raw user object keys:', Object.keys(user));
  console.log('🔍 authHelpers - Found permissions:', permissions);
  console.log('🔍 authHelpers - Found roles:', roles);

  return { permissions, roles };
};

const isUserAdmin = (user) => {
  const { permissions, roles } = getUserPermissionsAndRoles(user);
  
  return permissions.includes('admin:all') || 
         roles.includes('Admin') || 
         roles.includes('admin');
};

module.exports = {
  getUserPermissionsAndRoles,
  isUserAdmin
};
