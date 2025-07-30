import { useMobileNavContext } from '../../contexts/MobileNavContext'
import MobileNavPanel from './MobileNavPanel'
import MobileNavOverlay from './MobileNavOverlay'

/**
 * Contenedor que maneja solo el panel y overlay de navegación móvil
 * El botón hamburguesa se maneja por separado en el Header
 */
function MobileNavContainer () {
  const { isOpen, closePanel } = useMobileNavContext()

  return (
    <>
      <MobileNavOverlay isOpen={isOpen} onClose={closePanel} />
      <MobileNavPanel isOpen={isOpen} onClose={closePanel} />
    </>
  )
}

export default MobileNavContainer
