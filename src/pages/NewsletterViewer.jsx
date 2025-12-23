import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BeatCard from '../components/BeatCard/BeatCard'
import ReleaseCard from '../components/ReleaseCard/ReleaseCard'
import EventsCard from '../components/EventsCard/EventsCard'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { useNewsletter } from '../hooks/useNewsletter'
import { useAuth } from '../hooks/useAuth'
import './NewsletterViewer.css'

const API_URL = import.meta.env.VITE_API_URL

function NewsletterViewer () {
  const { slug } = useParams()
  const [newsletter, setNewsletter] = useState(null)
  const [beats, setBeats] = useState([])
  const [releases, setReleases] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  
  const { user, isAuthenticated } = useAuth()
  const { 
    subscribe: subscribeNewsletter, 
    loading: newsletterLoading, 
    error: newsletterError, 
    success: newsletterSuccess,
    checkStatus,
    reset: resetNewsletter 
  } = useNewsletter()

  // Actualizar estado al cambiar el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Verificar si el usuario está suscrito
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isAuthenticated && user?.email) {
        setCheckingSubscription(true)
        const status = await checkStatus(user.email)
        setIsSubscribed(status.subscribed || false)
        setCheckingSubscription(false)
      }
    }

    checkSubscriptionStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email])

  useEffect(() => {
    const fetchNewsletterData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Obtener la newsletter por slug
        const response = await fetch(`${API_URL}/newsletters?slug=${slug}`)
        
        if (!response.ok) {
          throw new Error('Newsletter no encontrada')
        }
        
        const data = await response.json()
        
        // Buscar la newsletter con el slug correcto
        let newsletterData
        if (Array.isArray(data)) {
          newsletterData = data.find(n => n.slug === slug)
        } else if (data.data && Array.isArray(data.data)) {
          newsletterData = data.data.find(n => n.slug === slug)
        } else {
          newsletterData = data.slug === slug ? data : null
        }
        
        if (!newsletterData) {
          throw new Error('Newsletter no encontrada')
        }
        
        setNewsletter(newsletterData)

        // Obtener los datos completos de beats, releases y eventos
        const fetchPromises = []

        // Fetch beats
        if (newsletterData.content?.uniqueBeats?.length > 0) {
          const beatsPromise = Promise.all(
            newsletterData.content.uniqueBeats.map(id =>
              fetch(`${API_URL}/beats/${id}`).then(r => r.ok ? r.json() : null)
            )
          ).then(results => {
            const normalized = results.filter(Boolean).map(beat => ({
              ...beat,
              id: beat.id || beat._id
            }))
            return normalized
          })
          fetchPromises.push(beatsPromise.then(setBeats))
        }

        // Fetch releases
        if (newsletterData.content?.upcomingReleases?.length > 0) {
          const releasesPromise = Promise.all(
            newsletterData.content.upcomingReleases.map(id =>
              fetch(`${API_URL}/releases/${id}`).then(r => r.ok ? r.json() : null)
            )
          ).then(results => {
            const normalized = results.filter(Boolean).map(release => ({
              ...release,
              id: release.id || release._id
            }))
            return normalized
          })
          fetchPromises.push(releasesPromise.then(setReleases))
        }

        // Fetch events
        if (newsletterData.content?.events?.length > 0) {
          const eventsPromise = Promise.all(
            newsletterData.content.events.map(id =>
              fetch(`${API_URL}/events/${id}`).then(r => r.ok ? r.json() : null)
            )
          ).then(results => {
            // Mapear con la misma estructura que useEvents
            const normalized = results.filter(Boolean).map(event => ({
              id: event._id,
              title: event.name,
              subtitle: event.location,
              spotifyLink: event.spotifyLink,
              youtubeLink: event.youtubeLink,
              appleMusicLink: event.appleMusicLink,
              instagramLink: event.instagramLink,
              soundCloudLink: event.soundCloudLink,
              beatStarsLink: event.beatStarsLink,
              video: event.video,
              eventType: event.eventType,
              location: event.location,
              date: event.date,
              img: event.img,
              name: event.name,
              colaborators: event.colaborators,
              description: event.description,
              ticketsEnabled: event.ticketsEnabled || false,
              ticketPrice: event.ticketPrice || 0,
              totalTickets: event.totalTickets || 0,
              availableTickets: event.availableTickets || 0,
              ticketsSold: event.ticketsSold || 0,
              ticketCurrency: event.ticketCurrency || 'EUR',
              saleStartDate: event.saleStartDate || null,
              saleEndDate: event.saleEndDate || null,
              externalTicketUrl: event.externalTicketUrl || ''
            }))
            return normalized
          })
          fetchPromises.push(eventsPromise.then(setEvents))
        }

        await Promise.all(fetchPromises)
        
      } catch (err) {
        console.error('Error fetching newsletter:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchNewsletterData()
    }
  }, [slug])

  if (loading) return (
    <div className='loading-container'>
        <LoadingSpinner />
    </div>
  )

  if (error) return (
    <div className='error-container'>
        <h1>404</h1>
        <p>{error}</p>
        <Link to='/newsletters' style={{ color: '#ff003c' }}>Volver a newsletters</Link>
    </div>
  )

  if (!newsletter) return null

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

  const handleNewsletterEmailChange = (e) => {
    setNewsletterEmail(e.target.value)
    
    if (newsletterError || newsletterSuccess) {
      resetNewsletter()
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await subscribeNewsletter(newsletterEmail, 'newsletter-viewer')
      
      if (result.success) {
        setNewsletterEmail('')
        setIsSubscribed(true)
        
        setTimeout(() => {
          resetNewsletter()
        }, 5000)
      } else {
        setTimeout(() => {
          resetNewsletter()
        }, 5000)
      }
      
    } catch (error) {
      console.error('Error al suscribir a newsletter:', error)
      setTimeout(() => {
        resetNewsletter()
      }, 5000)
    }
  }

  return (
    <div className='newsletter-viewer'>
        <header className='newsletter-header'>
            <h1 className='newsletter-title'>{newsletter.title}</h1>
            {newsletter.createdAt && (
              <span className='newsletter-date'>
                {new Date(newsletter.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
        </header>

        {releases.length > 0 && (
            <section className='newsletter-section'>
                <h2 className='section-title'>Nuevos Lanzamientos</h2>
                <div className='cards-grid'>
                    {releases.map((release) => (
                        <ReleaseCard key={release.id} card={release} />
                    ))}
                </div>
            </section>
        )}

        {events.length > 0 && (
            <section className='newsletter-section'>
                <h2 className='section-title'>
                  {events.length === 1 ? 'Próximo Evento' : 'Próximos Eventos'}
                </h2>
                {events.length === 1 && !isMobile ? (
                  <div className='evento-destacado'>
                    <div className='evento-destacado-imagen'>
                      <img src={events[0].img} alt={events[0].title} />
                    </div>
                    <div className='evento-destacado-info'>
                      <div className='evento-destacado-header'>
                        <h3 className='evento-destacado-titulo'>{events[0].title}</h3>
                        <div className='evento-destacado-underline'></div>
                        <div className='evento-destacado-meta'>
                          {events[0].date && (
                            <div className='evento-destacado-fecha'>
                              <FontAwesomeIcon icon={['fas', 'calendar-alt']} />
                              <span>{formatDate(events[0].date)}</span>
                            </div>
                          )}
                          {events[0].subtitle && (
                            <div className='evento-destacado-ubicacion'>
                              <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                              <span>{events[0].subtitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='evento-destacado-acciones'>
                        {events[0].externalTicketUrl && events[0].externalTicketUrl.trim() !== '' ? (
                          <a 
                            href={events[0].externalTicketUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className='evento-destacado-btn-comprar'
                          >
                            <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
                            Comprar Entradas
                          </a>
                        ) : events[0].ticketsEnabled && events[0].availableTickets > 0 ? (
                          <Link 
                            to={`/eventos/${events[0].id}`} 
                            className='evento-destacado-btn-comprar'
                          >
                            <FontAwesomeIcon icon={['fas', 'ticket-alt']} />
                            Comprar Entradas
                          </Link>
                        ) : (
                          <Link 
                            to={`/eventos/${events[0].id}`} 
                            className='evento-destacado-btn-detalles'
                          >
                            Ver Detalles
                            <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='cards-grid'>
                    {events.map((event) => (
                        <EventsCard key={event.id} card={event} /> 
                    ))}
                  </div>
                )}
            </section>
        )}

        {beats.length > 0 && (
            <section className='newsletter-section'>
                <h2 className='section-title'>Beats Destacados</h2>
                <div className='cards-grid'>
                    {beats.map((beat) => (
                        <BeatCard key={beat.id} card={beat} />
                    ))}
                </div>
            </section>
        )}

        {newsletter.content?.discounts?.length > 0 && (
             <section className={`discounts-container ${!isSubscribed ? 'blurred' : ''}`}>
                <h2>Códigos de Descuento</h2>
                {!isSubscribed && (
                  <div className='subscription-required-message'>
                    <FontAwesomeIcon icon={['fas', 'lock']} />
                    <p>Códigos de descuento solo disponibles para suscriptores</p>
                  </div>
                )}
                <div className={`discounts-grid ${!isSubscribed ? 'blur-content' : ''}`}>
                  {newsletter.content.discounts.map((discount, idx) => (
                      <div key={idx} className='discount-card'>
                          <span className='discount-code'>{discount.code}</span>
                          <div className='discount-desc'>
                              {discount.amount} - {discount.description}
                          </div>
                      </div>
                  ))}
                </div>
            </section>
        )}

        {!isSubscribed && !checkingSubscription && (
          <section className='subscribe-cta'>
            <h2 className='section-title'>Suscríbete a la Newsletter</h2>
            <p>Recibe noticias, beats exclusivos y descuentos cada mes directamente en tu correo.</p>
            
            <form className='newsletter-form-viewer' onSubmit={handleNewsletterSubmit}>
              <div className='newsletter-input-wrapper'>
                <input
                  type='email'
                  value={newsletterEmail}
                  onChange={handleNewsletterEmailChange}
                  placeholder='tu@email.com'
                  className='newsletter-input-viewer'
                  required
                  disabled={newsletterLoading}
                />
                <button
                  type='submit'
                  className={`newsletter-button-viewer ${newsletterLoading ? 'loading' : ''}`}
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? 'Enviando...' : 'Suscribirse'}
                </button>
              </div>
              
              {newsletterSuccess && (
                <div className='newsletter-status success'>
                  <FontAwesomeIcon icon={['fas', 'check-circle']} />
                  ¡Te has suscrito correctamente a nuestra newsletter!
                </div>
              )}
              
              {newsletterError && (
                <div className='newsletter-status error'>
                  <FontAwesomeIcon icon={['fas', 'info-circle']} />
                  {newsletterError}
                </div>
              )}
            </form>
          </section>
        )}
    </div>
  )
}

export default NewsletterViewer
