import { NavLink } from 'react-router-dom'
import '../Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LazyImage from '../LazyImage/LazyImage'

function ReleaseCard ({ card }) {
  const availableLinks = [
    { link: card.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify' },
    { link: card.youtubeLink, icon: ['fab', 'youtube'], label: 'Youtube' },
    { link: card.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram' },
    { link: card.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music' },
    { link: card.soundCloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud' }
  ].filter(item => item.link)

  const showLabels = availableLinks.length === 1

  return (
    <article className='card'>
      <div className="card-image-link">
        <LazyImage src={card.img} alt={`Portada de ${card.title}`} />
      </div>
      <div className='card-content'>
        <div>
          <h2>{card.title}</h2>
          {card.subtitle && <p>{card.subtitle}</p>}
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

export default ReleaseCard
