import { useState, useEffect } from 'react'
import { useUpdate } from '../../hooks/useUpdate'
import { useBeat } from '../../hooks/useBeat'
import { useEvent } from '../../hooks/useEvent'
import ReleaseForm from '../Forms/ReleaseForm'
import ArtistForm from '../Forms/ArtistForm'
import EventForm from '../Forms/EventForm'
import BeatForm from '../Forms/BeatForm'
import NewsletterForm from '../Forms/NewsletterForm'
import './EditModal.css'

function EditModal ({ item, type, onClose, onSuccess }) {
  const { updateItem, loading, error } = useUpdate()
  const [updateSuccess, setUpdateSuccess] = useState('')

  // Support both 'id' and '_id' for MongoDB documents
  const itemId = item.id || item._id

  // For beats, fetch individual beat with auth to get all file URLs
  const { beat: fullBeat, loading: beatLoading } = useBeat(
    type === 'beat' ? itemId : null
  )

  // For events, fetch individual event to get all fields (e.g. detailpageUrl)
  const { event: fullEvent, loading: eventLoading } = useEvent(
    type === 'event' ? itemId : null
  )

  // Use the full beat data (with all files) when available, fallback to list item
  const [beatData, setBeatData] = useState(item)
  useEffect(() => {
    if (type === 'beat' && fullBeat) {
      setBeatData(fullBeat)
    }
  }, [type, fullBeat])

  // Use the full event data when available, fallback to list item
  const [eventData, setEventData] = useState(item)
  useEffect(() => {
    if (type === 'event' && fullEvent) {
      setEventData(fullEvent)
    }
  }, [type, fullEvent])

  const handleSuccess = async (formData, imageFile = null) => {
    const result = await updateItem(type, itemId, formData, imageFile)
    
    if (result) {
      setUpdateSuccess(`${item.title || item.name} actualizado correctamente`)
      
      // Llamar al callback de éxito del padre
      onSuccess?.(result)
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const getFormComponent = () => {
    const formProps = {
      onSuccess: handleSuccess,
      initialData: type === 'beat' ? beatData : type === 'event' ? eventData : item,
      isEditMode: true
    }

    // Show loading while fetching full beat data
    if (type === 'beat' && beatLoading) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Cargando datos del beat...</div>
    }

    // Show loading while fetching full event data
    if (type === 'event' && eventLoading) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Cargando datos del evento...</div>
    }

    switch (type) {
      case 'release':
        return <ReleaseForm {...formProps} />
      case 'artist':
        return <ArtistForm {...formProps} />
      case 'event':
        return <EventForm {...formProps} />
      case 'beat':
        return <BeatForm {...formProps} />
      case 'newsletter':
        return <NewsletterForm {...formProps} />
      default:
        return <div>Tipo de formulario no válido</div>
    }
  }

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>Editar {
            type === 'release' ? 'Release' : 
            type === 'artist' ? 'Artista' : 
            type === 'event' ? 'Evento' : 
            type === 'beat' ? 'Beat' : 
            'Newsletter'
          }</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="edit-modal-content">
          {updateSuccess && (
            <div className="success-message">
              {updateSuccess}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
              {error.includes('Sesión expirada') && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.location.reload()}
                    className="reload-button"
                  >
                    Recargar página
                  </button>
                </div>
              )}
            </div>
          )}
          
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">Actualizando...</div>
            </div>
          )}
          
          {getFormComponent()}
        </div>
      </div>
    </div>
  )
}

export default EditModal
