import { NavLink } from 'react-router-dom'
import '../Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function ReleaseCard ({ card }) {
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
      <img src={card.img} alt='Portada de la obra' />
      <div className='card-content'>
        <div>
          <h2>{card.title}</h2>
          <p>{card.subtitle}</p>
        </div>
        <div className='card__buttons'>
          {availableLinks.map((item, index) => (
            <NavLink key={index} to={item.link} aria-label={item.label}>
              <FontAwesomeIcon icon={item.icon} />
              {showLabels && <span style={{ marginLeft: '8px' }}>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>
    </article>
  )
}

export default ReleaseCard
