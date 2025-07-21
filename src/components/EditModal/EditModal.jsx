import { useState } from 'react'
import { useUpdate } from '../../hooks/useUpdate'
import ReleaseForm from '../Forms/ReleaseForm'
import ArtistForm from '../Forms/ArtistForm'
import EventForm from '../Forms/EventForm'
import './EditModal.css'

function EditModal ({ item, type, onClose, onSuccess }) {
  const { updateItem, loading, error } = useUpdate()
  const [updateSuccess, setUpdateSuccess] = useState('')

  const handleSuccess = async (formData) => {
    const result = await updateItem(type, item.id, formData)
    
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
    console.log('🔍 Datos para editar:', item)
    console.log('🔍 Tipo:', type)
    
    const formProps = {
      onSuccess: handleSuccess,
      initialData: item,
      isEditMode: true
    }

    switch (type) {
      case 'release':
        return <ReleaseForm {...formProps} />
      case 'artist':
        return <ArtistForm {...formProps} />
      case 'event':
        return <EventForm {...formProps} />
      default:
        return <div>Tipo de formulario no válido</div>
    }
  }

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>Editar {type === 'release' ? 'Release' : type === 'artist' ? 'Artista' : 'Evento'}</h2>
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
