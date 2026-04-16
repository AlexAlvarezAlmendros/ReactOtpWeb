import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const SESSION_EXPIRED_ERRORS = [
  'missing_refresh_token',
  'invalid_grant',
  'login_required',
  'consent_required'
]

/**
 * Componente silencioso que comprueba la validez de la sesión al cargar la página.
 * Si el token de refresco ha expirado o la sesión de Auth0 ya no es válida,
 * cierra la sesión automáticamente y redirige al usuario a la página de login.
 */
function SessionGuard () {
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return

    const checkSession = async () => {
      try {
        // cacheMode por defecto ('on'): usa el token en caché si es válido,
        // y solo intenta renovarlo con el refresh token si ha expirado.
        // Usar 'off' causa problemas justo después del callback de login.
        const tokenOptions = {}
        if (import.meta.env.VITE_AUTH0_AUDIENCE) {
          tokenOptions.authorizationParams = {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        }
        await getAccessTokenSilently(tokenOptions)
      } catch (error) {
        const isExpired =
          SESSION_EXPIRED_ERRORS.includes(error.error) ||
          error.message?.includes('Missing Refresh Token') ||
          error.message?.includes('Invalid refresh token')

        if (isExpired) {
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      }
    }

    checkSession()
  }, [isAuthenticated, isLoading, getAccessTokenSilently, logout])

  return null
}

export default SessionGuard
