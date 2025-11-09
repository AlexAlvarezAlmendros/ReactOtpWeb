import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useCallback } from 'react'

// Estado global para tracking de logs de Auth (compartido entre todas las instancias)
const globalAuthLogTracker = {
  lastUserId: null,
  lastAuthState: null,
  hasLogged: false
}

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0()

  // Tracking global para reducir logs redundantes de Auth
  const shouldLogAuth = useMemo(() => {
    const currentState = `${isLoading}-${isAuthenticated}-${user?.sub || 'null'}-${error || 'null'}`

    // Si es exactamente el mismo estado, no loggear
    if (globalAuthLogTracker.lastAuthState === currentState && globalAuthLogTracker.hasLogged) {
      return false
    }

    // Si cambió el estado, actualizar tracker y permitir log
    globalAuthLogTracker.lastAuthState = currentState
    globalAuthLogTracker.hasLogged = true
    return true
  }, [isLoading, isAuthenticated, user?.sub, error])

  // Debug logging optimizado
  useEffect(() => {
    if (shouldLogAuth) {
      console.log('Auth State:', {
        isLoading,
        isAuthenticated,
        user: user ? user.email : null,
        error
      })
    }
  }, [shouldLogAuth, isLoading, isAuthenticated, user, error])

  const login = useCallback(() => {
    loginWithRedirect()
  }, [loginWithRedirect])

  const logoutUser = useCallback(() => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }, [logout])

  const getToken = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado')
      }

      const tokenOptions = {}

      // Incluir audience si está configurado
      if (import.meta.env.VITE_AUTH0_AUDIENCE) {
        tokenOptions.authorizationParams = {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      }

      const token = await getAccessTokenSilently(tokenOptions)
      return token
    } catch (error) {
      console.error('Error obteniendo token:', error)
      
      // Si falla la obtención silenciosa del token por refresh token faltante
      if (error.error === 'missing_refresh_token' || error.message?.includes('Missing Refresh Token')) {
        console.warn('🔄 Missing refresh token, necesario volver a autenticarse')
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.')
      }
      
      throw new Error('No se pudo obtener el token de acceso')
    }
  }, [isAuthenticated, getAccessTokenSilently])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
    getToken
  }
}
