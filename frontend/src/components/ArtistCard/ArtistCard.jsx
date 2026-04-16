import '../Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'
import LazyImage from '../LazyImage/LazyImage'

function ArtistCard ({ card }) {
  const availableLinks = [
    { link: card.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify' },
    { link: card.youtubeLink, icon: ['fab', 'youtube'], label: 'Youtube' },
    { link: card.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram' },
    { link: card.appleLink, icon: ['fab', 'apple'], label: 'Apple' },
    { link: card.soundcloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud' }
  ].filter(item => item.link)

  const showLabels = availableLinks.length === 1

  return (
    <article className='card'>
      <NavLink to={`/artistas/${card.id}`} className="card-image-link">
        <LazyImage src={card.img} alt='Portada de la obra' />
      </NavLink>
      <div className='card-content'>
        <div>
          <h2>{card.title}</h2>
        </div>
        <div className='card__buttons'>
          {availableLinks.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={item.label}
            >
              <FontAwesomeIcon icon={item.icon} />
              {showLabels && <span style={{ marginLeft: '8px' }}>{item.label}</span>}
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

export default ArtistCard
