import { useNavigate } from 'react-router-dom'
import './CreateCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import ReleaseForm from '../Forms/ReleaseForm.jsx'
import ArtistForm from '../Forms/ArtistForm.jsx'
import EventForm from '../Forms/EventForm.jsx'
import BeatForm from '../Forms/BeatForm.jsx'

export default function CreateCard () {
  const [selectedForm, setSelectedForm] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const handleFormSelect = (formType) => {
    setSelectedForm(formType)
    setSuccessMessage('') // Reset success message when changing form
  }

  const handleSuccess = (message) => {
    setSuccessMessage(message)
  }

  return (
    <>
    <div className='createCardModal'>
        <h2>{selectedForm ? `Crear nueva tarjeta de ${selectedForm}` : 'Que quieres añadir?'}</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}

        <div className='createCardModal__buttons'>
            <button onClick={() => handleFormSelect('Release')}>Nuevo Release</button>
            <button onClick={() => handleFormSelect('Artista')}>Nuevo Artista</button>
            <button onClick={() => handleFormSelect('Evento')}>Nuevo Evento</button>
            <button onClick={() => handleFormSelect('Beat')}>Nuevo Beat</button>
            <button onClick={() => navigate('/admin/newsletter')}>Crear Newsletter</button>
        </div>

        {selectedForm === 'Release' && <ReleaseForm onSuccess={handleSuccess} />}
        {selectedForm === 'Artista' && <ArtistForm onSuccess={handleSuccess} />}
        {selectedForm === 'Evento' && <EventForm onSuccess={handleSuccess} />}
        {selectedForm === 'Beat' && <BeatForm onSuccess={handleSuccess} />}
    </div>
    </>
  )
}
