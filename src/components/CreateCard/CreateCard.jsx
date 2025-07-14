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
        <h2>Crear nueva tarjeta</h2>
        <div className='createCardModal__buttons'>
            <button onClick={() => handleFormSelect('release')}>Nuevo Release</button>
            <button onClick={() => handleFormSelect('artist')}>Nuevo Artista</button>
            <button onClick={() => handleFormSelect('event')}>Nuevo Evento</button>
        </div>

        {selectedForm === 'release' && <ReleaseForm />}
        {selectedForm === 'artist' && <ArtistForm />}
        {selectedForm === 'event' && <EventForm />}
    </div>
    </>
  )
}
