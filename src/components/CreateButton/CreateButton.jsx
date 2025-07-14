import { NavLink } from 'react-router-dom'
import './CreateButton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function CreateButton () {
  return (
    <NavLink to='/crear' className='create-card-button' aria-label='Crear nueva tarjeta'>
        <FontAwesomeIcon icon={['fas', 'plus']} />
    </NavLink>
  )
}
