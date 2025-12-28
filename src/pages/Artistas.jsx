import { useCallback } from 'react'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './InfiniteScroll.css'

const API_URL = import.meta.env.VITE_API_URL
const ARTISTS_ENDPOINT = `${API_URL}/artists`

function Artistas () {
  const fetchArtists = useCallback(async (options) => {
    const params = new URLSearchParams()
    params.append('page', options.page.toString())
    params.append('count', options.count.toString())
    params.append('sortBy', 'createdAt')
    params.append('sortOrder', 'asc')

    const response = await fetch(`${ARTISTS_ENDPOINT}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Error al cargar artistas')
    }
    
    const responseData = await response.json()
    const artistsFromApi = responseData.data || responseData
    const paginationData = responseData.pagination || {}

    const mappedCards = artistsFromApi.map((artist) => ({
      id: artist._id,
      title: artist.name,
      subtitle: artist.genre,
      spotifyLink: artist.spotifyLink,
      youtubeLink: artist.youtubeLink,
      appleMusicLink: artist.appleMusicLink,
      instagramLink: artist.instagramLink,
      soundCloudLink: artist.soundCloudLink,
      beatStarsLink: artist.beatStarsLink,
      video: artist.video,
      artistType: artist.artistType,
      genre: artist.genre,
      img: artist.img
    }))

    return { data: mappedCards, pagination: paginationData }
  }, [])

  const { items: artists, loading, error, isLoadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    fetchArtists,
    { initialCount: 20, threshold: 500 }
  )

  return (
    <>
      <h1>Nuestros Artistas</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <Cards cards={artists} type={'artist'} loading={loading} />
      
      {/* Indicador de carga al hacer scroll */}
      {isLoadingMore && (
        <div className="infinite-scroll-loader">
          <LoadingSpinner />
          <p>Cargando más artistas...</p>
        </div>
      )}
      
      {/* Sentinel para Intersection Observer */}
      {!loading && hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      
      {/* Mensaje cuando no hay más items */}
      {!loading && !hasMore && artists.length > 0 && (
        <div className="infinite-scroll-end">
          <p>Has visto todos los artistas</p>
        </div>
      )}
      
      <CreateButton />
    </>
  )
}

export default Artistas
