import { useState } from 'react'
import CreateCard from '../components/CreateCard/CreateCard.jsx'
import ManageCards from '../components/ManageCards/ManageCards.jsx'
import { useAuth } from '../hooks/useAuth.js'

function Create () {
  const { isAuthenticated } = useAuth()
  const [activeSection, setActiveSection] = useState('create')

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
        <h2>Acceso restringido</h2>
        <p>Debes estar autenticado para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '2rem 0', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={() => setActiveSection('create')}
            style={{
              backgroundColor: activeSection === 'create' ? '#ffffff' : '#1b1b1b',
              color: activeSection === 'create' ? '#0e0e0e' : '#ffffff',
              border: '1px solid #333',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Crear Nuevo
          </button>
          <button 
            onClick={() => setActiveSection('manage')}
            style={{
              backgroundColor: activeSection === 'manage' ? '#ffffff' : '#1b1b1b',
              color: activeSection === 'manage' ? '#0e0e0e' : '#ffffff',
              border: '1px solid #333',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Gestionar Elementos
          </button>
        </div>
      </div>

      {activeSection === 'create' ? <CreateCard /> : <ManageCards />}
    </>
  )
}

export default Create
