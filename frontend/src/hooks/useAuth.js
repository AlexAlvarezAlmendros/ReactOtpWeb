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
    // Intentionally no console output in production.
    // `shouldLogAuth` kept for potential future telemetry hooks.
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

  const getToken = useCallback(async (retryCount = 0) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado')
      }

      const tokenOptions = {
        cacheMode: 'on', // Usar cache si el token aún es válido
      }

      // Incluir audience si está configurado
      if (import.meta.env.VITE_AUTH0_AUDIENCE) {
        tokenOptions.authorizationParams = {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      }

      const token = await getAccessTokenSilently(tokenOptions)
      return token
    } catch (error) {
      // Handle known token errors without logging to console.
      if (error.error === 'missing_refresh_token' || 
          error.error === 'invalid_grant' || 
          error.message?.includes('Missing Refresh Token') ||
          error.message?.includes('Invalid refresh token')) {
        setTimeout(() => {
          loginWithRedirect({
            appState: { returnTo: window.location.pathname }
          })
        }, 2000)
        throw new Error('Sesión expirada. Redirigiendo al login...')
      }

      if (retryCount === 0 && (error.error === 'timeout' || error.error === 'network_error')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getToken(1)
      }

      throw new Error('No se pudo obtener el token de acceso')
    }
  }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect])

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
