import { useMemo } from 'react'
import { useAuth } from './useAuth'

export function useUser () {
  const { user: auth0User, isAuthenticated, isLoading } = useAuth()

  // Extraer rol directamente del token JWT con custom namespace
  const role = useMemo(() => {
    if (!isAuthenticated || !auth0User) return 'user'

    // Auth0 guarda los roles en el namespace personalizado
    const rolesFromToken = auth0User['https://otp-records.com/roles'] 
      || auth0User['http://otp-records.com/roles']
      || auth0User.roles
      || []

    // Si hay roles, tomar el primero (o el más privilegiado)
    if (Array.isArray(rolesFromToken) && rolesFromToken.length > 0) {
      // Prioridad: admin > staff > user
      if (rolesFromToken.includes('admin') || rolesFromToken.includes('Admin')) return 'admin'
      if (rolesFromToken.includes('staff') || rolesFromToken.includes('Staff')) return 'staff'
      return 'user'
    }

    return 'user'
  }, [isAuthenticated, auth0User])

  // Construir objeto user con datos de Auth0
  const user = useMemo(() => {
    if (!isAuthenticated || !auth0User) return null

    return {
      id: auth0User.sub,
      auth0Id: auth0User.sub,
      email: auth0User.email 
        || auth0User['https://otp-records.com/email']
        || auth0User['http://otp-records.com/email'],
      name: auth0User.name 
        || auth0User['https://otp-records.com/name']
        || auth0User['http://otp-records.com/name']
        || auth0User.nickname,
      role
    }
  }, [isAuthenticated, auth0User, role])

  // Propiedades derivadas para facilitar el uso
  const isStaff = role === 'staff'
  const isAdmin = role === 'admin'
  const canValidateTickets = isStaff || isAdmin

  return {
    user,
    loading: isLoading,
    error: null,
    isStaff,
    isAdmin,
    canValidateTickets
  }
}
