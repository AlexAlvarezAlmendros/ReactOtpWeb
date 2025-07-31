import { useAuth } from '../../hooks/useAuth'
import './LogoutButton.css'

export default function LogoutButton () {
  const { logout, user } = useAuth()

  return (
    <div className="logout-container">
      <button
        className="logout-button"
        onClick={logout}
      >
        Cerrar Sesión
      </button>
    </div>
  )
}
