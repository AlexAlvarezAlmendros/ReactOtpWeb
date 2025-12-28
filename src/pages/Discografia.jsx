import { useCallback } from 'react'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './InfiniteScroll.css'

const API_URL = import.meta.env.VITE_API_URL
const RELEASES_ENDPOINT = `${API_URL}/releases`

function Discografia () {
  const fetchReleases = useCallback(async (options) => {
    const params = new URLSearchParams()
    params.append('page', options.page.toString())
    params.append('count', options.count.toString())
    params.append('sortBy', 'date')
    params.append('sortOrder', 'desc')

    const response = await fetch(`${RELEASES_ENDPOINT}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Error al cargar lanzamientos')
    }
    
    const responseData = await response.json()
    const releasesFromApi = responseData.data || responseData
    const paginationData = responseData.pagination || {}

    const mappedCards = releasesFromApi.map(release => ({
      id: release._id,
      title: release.title,
      subtitle: release.subtitle,
      description: release.description,
      date: release.date,
      type: release.type,
      spotifyLink: release.spotifyLink,
      appleMusicLink: release.appleMusicLink,
      youtubeLink: release.youtubeLink,
      img: release.img
    }))

    return { data: mappedCards, pagination: paginationData }
  }, [])

  const { items: releases, loading, error, isLoadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    fetchReleases,
    { initialCount: 20, threshold: 500 }
  )

  return (
    <>
      <h1>Nuestra Discografía</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <Cards cards={releases} type={'release'} loading={loading} />
      
      {isLoadingMore && (
        <div className="infinite-scroll-loader">
          <LoadingSpinner />
          <p>Cargando más lanzamientos...</p>
        </div>
      )}
      
      {!loading && hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      
      {!loading && !hasMore && releases.length > 0 && (
        <div className="infinite-scroll-end">
          <p>Has visto toda la discografía</p>
        </div>
      )}
      
      <CreateButton />
    </>
  )
}

export default Discografia