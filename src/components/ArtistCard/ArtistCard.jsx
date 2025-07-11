import './ArtistCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function ArtistCard ({ card }) {
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
        <NavLink to={card.soundcloudLink} aria-label='SoundCloud'><FontAwesomeIcon icon={['fab', 'soundcloud']} /></NavLink>
      </div>
    </article>
  )
}

export default ArtistCard
