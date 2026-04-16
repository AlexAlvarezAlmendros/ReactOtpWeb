import './MobileNavToggle.css'

/**
 * Botón hamburguesa para abrir/cerrar el panel de navegación móvil
 * @param {boolean} isOpen - Estado del panel (abierto/cerrado)
 * @param {function} onToggle - Función para cambiar el estado del panel
 */
function MobileNavToggle ({ isOpen, onToggle }) {
  return (
    <button
      className={`mobile-nav-toggle ${isOpen ? 'active' : ''}`}
      onClick={onToggle}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isOpen}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  )
}

export default MobileNavToggle
