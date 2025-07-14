import './CreateCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import ReleaseForm from '../Forms/ReleaseForm.jsx'
import ArtistForm from '../Forms/ArtistForm.jsx'
import EventForm from '../Forms/EventForm.jsx'

export default function CreateCard () {
  const [selectedForm, setSelectedForm] = useState(null)

  const handleFormSelect = (formType) => {
    setSelectedForm(formType)
  }

  return (
    <>
    <button className='create-card' aria-label='Crear nueva tarjeta'>
        <FontAwesomeIcon icon={['fas', 'plus']} />
    </button>

    <div className='createCardModal'>
        <h2>{selectedForm ? `Crear nueva tarjeta de ${selectedForm}` : 'Que quieres añadir?'}</h2>
        <div className='createCardModal__buttons'>
            <button onClick={() => handleFormSelect('Release')}>Nuevo Release</button>
            <button onClick={() => handleFormSelect('Artista')}>Nuevo Artista</button>
            <button onClick={() => handleFormSelect('Evento')}>Nuevo Evento</button>
        </div>

        {selectedForm === 'Release' && <ReleaseForm />}
        {selectedForm === 'Artista' && <ArtistForm />}
        {selectedForm === 'Evento' && <EventForm />}
    </div>
    </>
  )
}
