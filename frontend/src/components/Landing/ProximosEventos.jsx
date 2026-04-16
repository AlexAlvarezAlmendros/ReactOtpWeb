import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ProximosEventos.css'
import { Cards } from '../CardList/CardList'
import { useEvents } from '../../hooks/useEvents'
import LazyImage from '../LazyImage/LazyImage'

export function ProximosEventos () {
  const [currentPage] = useState(1)
  const [filters] = useState({
    count: 3,
    sortBy: 'date',
    sortOrder: 'asc',
    dateMin: new Date().toISOString() // Solo eventos futuros
  })

  const {
    events: cards,
    loading,
    error
  } = useEvents({
    ...filters,
    page: currentPage
  })

  // Detectar si es mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Actualizar estado al cambiar el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Vista especial para un solo evento (solo en desktop)
  if (!loading && !error && cards.length === 1 && !isMobile) {
    const event = cards[0]
    const hasExternalTickets = event.externalTicketUrl && event.externalTicketUrl.trim() !== ''
    const hasInternalTickets = event.ticketsEnabled && event.availableTickets > 0

    return (
      <section className='proximos-eventos-section'>
        <h2 className='proximos-eventos-title'>Próximo evento</h2>
        <div className='evento-destacado'>
          <div className='evento-destacado-imagen'>
            <LazyImage src={event.img} alt={event.title} />
          </div>
          <div className='evento-destacado-info'>
            <div className='evento-destacado-header'>
              <h3 className='evento-destacado-titulo'>{event.title}</h3>
              <div className='evento-destacado-underline'></div>
              <div className='evento-destacado-meta'>
                {event.date && (
                  <div className='evento-destacado-fecha'>
                    <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                )}
                {event.location && (
                  <div className='evento-destacado-ubicacion'>
                    <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className='evento-destacado-acciones'>
              {hasExternalTickets ? (
                <a 
                  href={event.externalTicketUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className='evento-destacado-btn-comprar'
                >
                  <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
                  Comprar Entradas
                </a>
              ) : hasInternalTickets ? (
                <Link 
                  to={`/eventos/${event.id}`} 
                  className='evento-destacado-btn-comprar'
                >
                  <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
                  Comprar Entradas
                </Link>
              ) : (
                <Link 
                  to={`/eventos/${event.id}`} 
                  className='evento-destacado-btn-detalles'
                >
                  Ver Detalles
                  <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay eventos, no mostrar nada
  if (!loading && !error && cards.length === 0) return null

  // Vista normal para múltiples eventos
  return (
    <section>
      <h2 className='proximos-eventos-title'>Próximos eventos</h2>
      <div className='proximos-eventos-list'>
        {error && <p>Error: {error}</p>}
        <Cards cards={cards} type={'event'} loading={loading} skeletonCount={3} />
      </div>
    </section>
  )
}
