import './Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Card ({ img, title, resume }) {
  return (
    <article className='card'>
      <img src={img} alt='Portada de la obra' />
      <h2>{title}</h2>
      <p>{resume}</p>
      <div className='card__buttons'>
        <button aria-label='Spotify'><FontAwesomeIcon icon={['fab', 'spotify']} /></button>
        <button aria-label='Youtube'><FontAwesomeIcon icon={['fab', 'youtube']} /></button>
        <button aria-label='Instagram'><FontAwesomeIcon icon={['fab', 'instagram']} /></button>
        <button aria-label='Apple'><FontAwesomeIcon icon={['fab', 'apple']} /></button>
      </div>
    </article>
  )
}

export default Card
