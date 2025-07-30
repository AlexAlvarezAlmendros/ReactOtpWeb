import './MobileNavOverlay.css'

/**
 * Overlay que aparece detrás del panel móvil para cerrar al hacer clic
 * @param {boolean} isOpen - Estado del panel
 * @param {function} onClose - Función para cerrar el panel
 */
function MobileNavOverlay ({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="mobile-nav-overlay"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

export default MobileNavOverlay
