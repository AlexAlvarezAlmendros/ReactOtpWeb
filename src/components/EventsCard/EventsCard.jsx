import { NavLink } from 'react-router-dom'
import '../Card.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function EventsCard ({ card }) {
  const availableLinks = [
    { link: card.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify' },
    { link: card.youtubeLink, icon: ['fab', 'youtube'], label: 'Youtube' },
    { link: card.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram' },
    { link: card.appleLink, icon: ['fab', 'apple'], label: 'Apple' }
  ].filter(item => item.link)

  const showLabels = availableLinks.length === 1

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Verificar si tiene entradas disponibles y dentro de fecha
  const hasAvailableTickets = () => {
    if (!card.ticketsEnabled) return false
    
    // Si son entradas externas, solo verificar que esté habilitado
    if (card.externalTicketUrl) return true
    
    // Para entradas internas, verificar disponibilidad y fechas
    if (card.availableTickets <= 0) return false

    const now = new Date()
    if (card.saleStartDate && now < new Date(card.saleStartDate)) return false
    if (card.saleEndDate && now > new Date(card.saleEndDate)) return false

    return true
  }

  const ticketsAvailable = hasAvailableTickets()

  return (
    <article className='card'>
      <div className="card-image-link">
        <NavLink to={`/eventos/${card.id}`} className="card-image-link">
          <img src={card.img} alt='Portada de la obra' />
        </NavLink>
      </div>
      <div className='card-content'>
        <div>
          <h2>{card.title}</h2>
          {card.date && (
            <p className="event-date">
              <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
              {formatDate(card.date)}
            </p>
          )}
          <p className="event-location">
            <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
            {card.subtitle}
          </p>
        </div>
        
        {/* Mostrar botón de compra si hay entradas disponibles */}
        {ticketsAvailable && (
          card.externalTicketUrl ? (
            <a 
              href={card.externalTicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-buy-tickets-card"
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
              Entradas
            </a>
          ) : (
            <NavLink 
              to={`/eventos/${card.id}`} 
              className="btn-buy-tickets-card"
            >
              <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
              Entradas
            </NavLink>
          )
        )}

        {/* Mostrar botones sociales solo si NO hay entradas disponibles */}
        {!ticketsAvailable && availableLinks.length > 0 && (
          <div className='card__buttons'>
            {availableLinks.map((item, index) => (
              <NavLink key={index} to={item.link} aria-label={item.label}>
                <FontAwesomeIcon icon={item.icon} />
                {showLabels && <span style={{ marginLeft: '8px' }}>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default EventsCard
