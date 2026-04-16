import { useCallback } from 'react'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './InfiniteScroll.css'

const API_URL = import.meta.env.VITE_API_URL
const EVENTS_ENDPOINT = `${API_URL}/events`

function Eventos () {
  const fetchEvents = useCallback(async (options) => {
    const params = new URLSearchParams()
    params.append('page', options.page.toString())
    params.append('count', options.count.toString())
    params.append('sortBy', 'date')
    params.append('sortOrder', 'desc')

    const response = await fetch(`${EVENTS_ENDPOINT}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Error al cargar eventos')
    }
    
    const responseData = await response.json()
    const eventsFromApi = responseData.data || responseData
    const paginationData = responseData.pagination || {}

    const mappedCards = eventsFromApi.map((event) => ({
      id: event._id,
      title: event.name,
      subtitle: event.location || event.type,
      description: event.description,
      date: event.date,
      location: event.location,
      ticketLink: event.ticketLink,
      spotifyLink: event.spotifyLink,
      appleMusicLink: event.appleMusicLink,
      appleLink: event.appleMusicLink,
      youtubeLink: event.youtubeLink,
      instagramLink: event.instagramLink,
      img: event.img,
      // Campos para tickets
      ticketsEnabled: event.ticketsEnabled,
      externalTicketUrl: event.externalTicketUrl,
      availableTickets: event.availableTickets,
      saleStartDate: event.saleStartDate,
      saleEndDate: event.saleEndDate
    }))

    return { data: mappedCards, pagination: paginationData }
  }, [])

  const { items: events, loading, error, isLoadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    fetchEvents,
    { initialCount: 20, threshold: 500 }
  )

  return (
    <>
      <h1>Últimos Eventos</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <Cards cards={events} type={'event'} loading={loading} />
      
      {isLoadingMore && (
        <div className="infinite-scroll-loader">
          <LoadingSpinner />
          <p>Cargando más eventos...</p>
        </div>
      )}
      
      {!loading && hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      
      {!loading && !hasMore && events.length > 0 && (
        <div className="infinite-scroll-end">
          <p>Has visto todos los eventos</p>
        </div>
      )}
      
      <CreateButton />
    </>
  )
}

export default Eventos
