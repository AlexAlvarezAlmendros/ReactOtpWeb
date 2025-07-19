import { NavLink } from 'react-router-dom'
import '../Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function EventsCard ({ card }) {
  return (
    <article className='card'>
      <img src={card.img} alt='Portada de la obra' />
      <h2>{card.title}</h2>
      <p>{card.resume}</p>
      <div className='card__buttons'>
        <NavLink to={card.spotifyLink} aria-label='Spotify'><FontAwesomeIcon icon={['fab', 'spotify']} /></NavLink>
        <NavLink to={card.youtubeLink} aria-label='Youtube'><FontAwesomeIcon icon={['fab', 'youtube']} /></NavLink>
        <NavLink to={card.instagramLink} aria-label='Instagram'><FontAwesomeIcon icon={['fab', 'instagram']} /></NavLink>
        <NavLink to={card.appleLink} aria-label='Apple'><FontAwesomeIcon icon={['fab', 'apple']} /></NavLink>
      </div>
    </article>
  )
}

export default EventsCard
