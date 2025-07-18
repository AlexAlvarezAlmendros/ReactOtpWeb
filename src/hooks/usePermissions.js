import { useAuth } from './useAuth'
import { useMemo, useCallback } from 'react'

// Estado global para tracking de logs (compartido entre todas las instancias)
const globalLogTracker = {
  lastUserId: null,
  hasLogged: false
}

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth()

  // Tracking global mejorado para reducir logs redundantes
  const shouldLog = useMemo(() => {
    if (!user?.sub) return false

    // Si es el mismo usuario y ya se loggeó, no volver a loggear
    if (globalLogTracker.lastUserId === user.sub && globalLogTracker.hasLogged) {
      return false
    }

    // Si es un usuario nuevo o primera vez, actualizar tracker y permitir log
    globalLogTracker.lastUserId = user.sub
    globalLogTracker.hasLogged = true
    return true
  }, [user?.sub])

  // Memoizar roles para evitar recálculos innecesarios
  const roles = useMemo(() => {
    if (!isAuthenticated || !user) return []

    const rolesResult = user['https://otp-records.com/roles'] ||
                       user.roles ||
                       user.app_metadata?.roles ||
                       []

    if (shouldLog) {
      console.log('🔵 Roles calculated for user:', user.email)
    }
    return Array.isArray(rolesResult) ? rolesResult : []
  }, [isAuthenticated, user, shouldLog])

  // Memoizar permisos usando la clave estable
  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) return []

    let permissionsResult = user['https://otp-records.com/permissions'] ||
                           user.permissions ||
                           user.app_metadata?.permissions ||
                           user.user_metadata?.permissions ||
                           []

    // SOLUCIÓN TEMPORAL: Si no hay permisos pero sí roles, mapear desde roles
    if (!permissionsResult || permissionsResult.length === 0) {
      if (shouldLog) {
        console.log('🟡 Mapping permissions from roles for:', user.email)
      }

      if (roles.includes('Admin') || roles.includes('admin')) {
        permissionsResult = [
          'admin:all',
          'read:releases', 'write:releases', 'delete:releases',
          'read:artists', 'write:artists', 'delete:artists',
          'read:events', 'write:events', 'delete:events',
          'read:studios', 'write:studios', 'delete:studios'
        ]
        if (shouldLog) {
          console.log('🟢 Admin permissions mapped')
        }
      } else if (roles.includes('Editor') || roles.includes('editor')) {
        permissionsResult = [
          'read:releases', 'write:releases',
          'read:artists', 'write:artists',
          'read:events', 'write:events',
          'read:studios', 'write:studios'
        ]
        if (shouldLog) {
          console.log('🟢 Editor permissions mapped')
        }
      } else if (roles.includes('User') || roles.includes('user')) {
        permissionsResult = [
          'read:releases', 'read:artists', 'read:events', 'read:studios'
        ]
        if (shouldLog) {
          console.log('🟢 User permissions mapped')
        }
      }
    } else {
      if (shouldLog) {
        console.log('🟢 Direct permissions found for:', user.email)
      }
    }

    return Array.isArray(permissionsResult) ? permissionsResult : []
  }, [isAuthenticated, roles, user, shouldLog])

  // Métodos memoizados para verificación
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission) || permissions.includes('admin:all')
  }, [permissions])

  const hasRole = useCallback((role) => {
    return roles.includes(role)
  }, [roles])

  const hasAnyPermission = useCallback((permissionsList) => {
    return permissionsList.some(permission =>
      permissions.includes(permission) || permissions.includes('admin:all')
    )
  }, [permissions])

  const hasAllPermissions = useCallback((permissionsList) => {
    if (permissions.includes('admin:all')) return true
    return permissionsList.every(permission => permissions.includes(permission))
  }, [permissions])

  // Métodos específicos para entidades
  const canCreate = useCallback((entity = null) => {
    if (!entity) {
      return hasAnyPermission(['write:releases', 'write:artists', 'write:events', 'write:studios'])
    }
    return hasPermission(`write:${entity}`)
  }, [hasAnyPermission, hasPermission])

  const canEdit = useCallback((entity = null) => {
    if (!entity) {
      return hasAnyPermission(['write:releases', 'write:artists', 'write:events', 'write:studios'])
    }
    return hasPermission(`write:${entity}`)
  }, [hasAnyPermission, hasPermission])

  const canDelete = useCallback((entity = null) => {
    if (!entity) {
      return hasAnyPermission(['delete:releases', 'delete:artists', 'delete:events', 'delete:studios'])
    }
    return hasPermission(`delete:${entity}`)
  }, [hasAnyPermission, hasPermission])

  const canRead = useCallback((entity = null) => {
    if (!entity) {
      return hasAnyPermission(['read:releases', 'read:artists', 'read:events', 'read:studios'])
    }
    return hasPermission(`read:${entity}`)
  }, [hasAnyPermission, hasPermission])

  return {
    // Métodos básicos de verificación
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,

    // Métodos específicos de acciones CRUD
    canCreate,
    canEdit,
    canDelete,
    canRead,

    // Propiedades de conveniencia
    isAdmin: hasPermission('admin:all') || hasRole('admin'),
    isEditor: hasRole('editor'),
    isUser: hasRole('user'),

    // Datos sin procesar (ya memoizados)
    permissions,
    roles,

    // Estado de autenticación
    isAuthenticated
  }
}
