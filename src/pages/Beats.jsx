import { useCallback } from 'react'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './InfiniteScroll.css'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

function Beats () {
  const fetchBeats = useCallback(async (options) => {
    const params = new URLSearchParams()
    params.append('page', options.page.toString())
    params.append('count', options.count.toString())
    params.append('sortBy', 'createdAt')
    params.append('sortOrder', 'desc')

    const response = await fetch(`${BEATS_ENDPOINT}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Error al cargar beats')
    }
    
    const responseData = await response.json()
    const beatsFromApi = responseData.data || responseData
    const paginationData = responseData.pagination || {}

    return { data: beatsFromApi, pagination: paginationData }
  }, [])

  const { items: beats, loading, error, isLoadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    fetchBeats,
    { initialCount: 20, threshold: 500 }
  )
  
  return (
    <>
      <h1>Nuestros Beats</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <Cards cards={beats} type={'beat'} loading={loading} />
      
      {isLoadingMore && (
        <div className="infinite-scroll-loader">
          <LoadingSpinner />
          <p>Cargando más beats...</p>
        </div>
      )}
      
      {!loading && hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      
      {!loading && !hasMore && beats.length > 0 && (
        <div className="infinite-scroll-end">
          <p>Has visto todos los beats</p>
        </div>
      )}
      
      <CreateButton />
    </>
  )
}

export default Beats
