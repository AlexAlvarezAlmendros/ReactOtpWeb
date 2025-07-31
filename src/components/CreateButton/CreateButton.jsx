import { NavLink } from 'react-router-dom'
import './CreateButton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProtectedComponent from '../Auth/ProtectedComponent'

export default function CreateButton () {
  return (
    <ProtectedComponent permission="write:releases">
      <NavLink to='/crear' className='create-card-button' aria-label='Crear nueva tarjeta'>
          <FontAwesomeIcon icon={['fas', 'plus']} />
      </NavLink>
    </ProtectedComponent>
  )
}
