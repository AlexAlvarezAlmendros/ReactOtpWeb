import { useAuth } from '../../hooks/useAuth'
import './LoginButton.css'

export default function LoginButton () {
  const { login, isLoading } = useAuth()

  if (isLoading) {
    return <div className="login-loading">Cargando...</div>
  }

  return (
    <button
      className="login-button"
      onClick={login}
      disabled={isLoading}
    >
      Iniciar Sesión
    </button>
  )
}
