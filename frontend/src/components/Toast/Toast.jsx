import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useToast } from '../../contexts/ToastContext'
import './Toast.css'

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

function Toast({ id, message, type, duration }) {
  const { removeToast } = useToast()

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, removeToast])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle'
      case 'error':
        return 'exclamation-circle'
      case 'warning':
        return 'exclamation-triangle'
      case 'loading':
        return 'spinner'
      default:
        return 'info-circle'
    }
  }

  const getIconSpin = () => type === 'loading'

  return (
    <div className={`toast toast-${type}`} data-toast-id={id}>
      <div className="toast-icon">
        <FontAwesomeIcon icon={getIcon()} spin={getIconSpin()} />
      </div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={() => removeToast(id)}
        aria-label="Cerrar notificación"
      >
        <FontAwesomeIcon icon="times" />
      </button>
    </div>
  )
}

export default ToastContainer
