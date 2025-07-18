import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import LoginButton from './LoginButton'
import './ProtectedComponent.css'

export default function ProtectedComponent ({
  children,
  permission = null,
  role = null,
  fallback = null
}) {
  const { isLoading } = useAuth()
  const { hasPermission, hasRole } = usePermissions()

  if (isLoading) {
    return <div className="protected-loading">Verificando permisos...</div>
  }

  // Si se especifica un permiso específico
  if (permission && !hasPermission(permission)) {
    return fallback || null
  }

  // Si se especifica un rol específico
  if (role && !hasRole(role)) {
    return fallback || null
  }

  return children
}
