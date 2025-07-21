import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useReleases } from '../../hooks/useReleases'
import { useArtists } from '../../hooks/useArtists'
import { useEvents } from '../../hooks/useEvents'
import { useDelete } from '../../hooks/useDelete'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReleaseCard from '../ReleaseCard/ReleaseCard'
import ArtistCard from '../ArtistCard/ArtistCard'
import EventsCard from '../EventsCard/EventsCard'
import EditModal from '../EditModal/EditModal'
import './ManageCards.css'

function ManageCards () {
  const { user, isAuthenticated } = useAuth()
  const { isAdmin } = usePermissions()
  const { deleteItem, loading: deleteLoading, error: deleteError } = useDelete()
  
  const [activeTab, setActiveTab] = useState('releases')
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { type, id, title }
  const [editModal, setEditModal] = useState(null) // { item, type }

  // Configurar filtros basados en permisos
  const filterOptions = isAdmin ? {} : { userId: user?.sub }

  // Hooks para obtener datos
  const { 
    releases, 
    loading: releasesLoading, 
    error: releasesError, 
    refetch: refetchReleases 
  } = useReleases(filterOptions)
  
  const { 
    artists, 
    loading: artistsLoading, 
    error: artistsError, 
    refetch: refetchArtists 
  } = useArtists(filterOptions)
  
  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError, 
    refetch: refetchEvents 
  } = useEvents(filterOptions)

  // Función para manejar la eliminación
  const handleDelete = async (type, id, title) => {
    setConfirmDelete({ type, id, title })
  }

  // Función para manejar la edición
  const handleEdit = (type, item) => {
    setEditModal({ item, type })
  }

  // Confirmar eliminación
  const confirmDeleteAction = async () => {
    if (!confirmDelete) return

    const { type, id } = confirmDelete
    const success = await deleteItem(type, id)
    
    if (success) {
      setDeleteSuccess(`${confirmDelete.title} eliminado correctamente`)
      setConfirmDelete(null)
      
      // Refrescar los datos correspondientes
      switch (type) {
        case 'release':
          refetchReleases()
          break
        case 'artist':
          refetchArtists()
          break
        case 'event':
          refetchEvents()
          break
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setDeleteSuccess('')
      }, 3000)
    } else {
      // Si hay error relacionado con sesión expirada, cerrar el modal
      if (deleteError && deleteError.includes('Sesión expirada')) {
        setConfirmDelete(null)
      }
    }
  }

  // Cancelar eliminación
  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  // Manejar éxito de edición
  const handleEditSuccess = (updatedItem) => {
    setDeleteSuccess(`${updatedItem.title || updatedItem.name} actualizado correctamente`)
    
    // Refrescar los datos correspondientes
    switch (editModal.type) {
      case 'release':
        refetchReleases()
        break
      case 'artist':
        refetchArtists()
        break
      case 'event':
        refetchEvents()
        break
    }
    
    // Cerrar modal
    setEditModal(null)
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      setDeleteSuccess('')
    }, 3000)
  }

  // Cerrar modal de edición
  const closeEditModal = () => {
    setEditModal(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="manage-cards">
        <p>Debes estar autenticado para gestionar tus elementos.</p>
      </div>
    )
  }

  const renderCards = () => {
    let items = []
    let loading = false
    let error = null

    switch (activeTab) {
      case 'releases':
        items = releases || []
        loading = releasesLoading
        error = releasesError
        break
      case 'artists':
        items = artists || []
        loading = artistsLoading
        error = artistsError
        break
      case 'events':
        items = events || []
        loading = eventsLoading
        error = eventsError
        break
    }

    if (loading) {
      return <div className="loading">Cargando...</div>
    }

    if (error) {
      return <div className="error">Error: {error}</div>
    }

    if (items.length === 0) {
      return (
        <div className="no-items">
          <p>No hay {activeTab} {isAdmin ? 'en el sistema' : 'creados por ti'}.</p>
        </div>
      )
    }

    return (
      <div className="cards-grid">
        {items.map((item) => {
          const CardComponent = activeTab === 'releases' ? ReleaseCard :
                               activeTab === 'artists' ? ArtistCard : EventsCard
          
          return (
            <div key={item.id} className="card-container">
              <CardComponent card={item} />
              <div className="card-actions">
                <button 
                  className="edit-button"
                  onClick={() => handleEdit(activeTab.slice(0, -1), item)}
                  title="Editar"
                >
                  <FontAwesomeIcon icon="edit" />
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(activeTab.slice(0, -1), item.id, item.title || item.name)}
                  disabled={deleteLoading}
                  title="Eliminar"
                >
                  <FontAwesomeIcon icon="trash" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="manage-cards">
      <h2>{isAdmin ? 'Gestionar todos los elementos' : 'Mis elementos creados'}</h2>
      
      {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
      {deleteError && (
        <div className="error-message">
          {deleteError}
          {deleteError.includes('Sesión expirada') && (
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0e0e0e',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Recargar página
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabs para cambiar entre tipos */}
      <div className="tabs">
        <button 
          className={activeTab === 'releases' ? 'active' : ''}
          onClick={() => setActiveTab('releases')}
        >
          Releases
        </button>
        <button 
          className={activeTab === 'artists' ? 'active' : ''}
          onClick={() => setActiveTab('artists')}
        >
          Artistas
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Eventos
        </button>
      </div>

      {/* Contenido de las cards */}
      {renderCards()}

      {/* Modal de confirmación */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar "{confirmDelete.title}"?</p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button 
                className="cancel-button" 
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button 
                className="confirm-button" 
                onClick={confirmDeleteAction}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editModal && (
        <EditModal 
          item={editModal.item}
          type={editModal.type}
          onClose={closeEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

export default ManageCards
