import { NavLink } from 'react-router-dom'
import './StudioCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function StudioCard ({ card }) {
  return (
    <article className='card'>
      <img src={card.img} alt='Portada de la obra' />
      <h2>{card.title}</h2>
      <p>{card.resume}</p>
      <div className='card__buttons'>
        <NavLink to={card.youtubeLink} aria-label='Youtube'><FontAwesomeIcon icon={['fab', 'youtube']} /></NavLink>
        <NavLink to={card.instagramLink} aria-label='Instagram'><FontAwesomeIcon icon={['fab', 'instagram']} /></NavLink>
      </div>
    </article>
  )
}

export default StudioCard
