import { useMobileNav } from '../../hooks/useMobileNav'
import MobileNavToggle from './MobileNavToggle'
import MobileNavPanel from './MobileNavPanel'
import MobileNavOverlay from './MobileNavOverlay'

/**
 * Componente principal que maneja toda la navegación móvil
 * Incluye el botón hamburguesa, overlay y panel deslizante
 */
function MobileNav () {
  const { isOpen, togglePanel, closePanel } = useMobileNav()

  return (
    <>
      <MobileNavToggle isOpen={isOpen} onToggle={togglePanel} />
      <MobileNavOverlay isOpen={isOpen} onClose={closePanel} />
      <MobileNavPanel isOpen={isOpen} onClose={closePanel} />
    </>
  )
}

export default MobileNav
