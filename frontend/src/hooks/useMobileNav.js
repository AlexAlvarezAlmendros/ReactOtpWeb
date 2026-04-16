import { useState, useEffect } from 'react'

/**
 * Hook personalizado para manejar el estado del panel de navegación móvil
 * Incluye manejo de eventos de teclado y prevención de scroll
 */
export function useMobileNav () {
  const [isOpen, setIsOpen] = useState(false)

  // Función para abrir el panel
  const openPanel = () => setIsOpen(true)

  // Función para cerrar el panel
  const closePanel = () => setIsOpen(false)

  // Función para alternar el estado
  const togglePanel = () => setIsOpen(prev => !prev)

  // Efecto para manejar eventos de teclado y scroll
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el panel está abierto
      document.body.style.overflow = 'hidden'

      // Manejar tecla ESC para cerrar
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          closePanel()
        }
      }

      document.addEventListener('keydown', handleEscape)

      // Cleanup
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      // Restaurar scroll cuando el panel se cierra
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return {
    isOpen,
    openPanel,
    closePanel,
    togglePanel
  }
}
