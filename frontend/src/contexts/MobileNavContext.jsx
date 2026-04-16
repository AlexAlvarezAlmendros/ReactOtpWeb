import { createContext, useContext, useState } from 'react'

const MobileNavContext = createContext()

export function MobileNavProvider ({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const togglePanel = () => {
    setIsOpen(prev => !prev)
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  const openPanel = () => {
    setIsOpen(true)
  }

  return (
    <MobileNavContext.Provider value={{
      isOpen,
      togglePanel,
      closePanel,
      openPanel
    }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNavContext () {
  const context = useContext(MobileNavContext)
  if (!context) {
    throw new Error('useMobileNavContext must be used within a MobileNavProvider')
  }
  return context
}
