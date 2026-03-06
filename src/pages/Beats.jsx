import { useCallback, useState, useEffect } from 'react'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import BeatsFilterBar from '../components/BeatsFilterBar/BeatsFilterBar'
import BeatListRow from '../components/BeatCard/BeatListRow'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useArtistsWithBeats } from '../hooks/useArtistsWithBeats'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { SkeletonList } from '../components/Skeleton/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './InfiniteScroll.css'
import './Beats.css'

const API_URL = import.meta.env.VITE_API_URL
const BEATS_ENDPOINT = `${API_URL}/beats`

const INITIAL_FILTERS = {
  genre: '',
  artistId: '',
  key: '',
  bpmMin: '',
  bpmMax: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

function Beats () {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [viewMode, setViewMode] = useState('list') // 'grid' | 'list'

  const { artists } = useArtistsWithBeats()

  const fetchBeats = useCallback(async (options) => {
    const params = new URLSearchParams()
    params.append('page', options.page.toString())
    params.append('count', options.count.toString())
    params.append('sortBy', options.sortBy || 'createdAt')
    params.append('sortOrder', options.sortOrder || 'desc')

    if (options.genre) params.append('genre', options.genre)
    if (options.key) params.append('key', options.key)
    if (options.bpmMin) params.append('bpmMin', options.bpmMin.toString())
    if (options.bpmMax) params.append('bpmMax', options.bpmMax.toString())

    const response = await fetch(`${BEATS_ENDPOINT}?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Error al cargar beats')
    }

    const responseData = await response.json()
    const beatsFromApi = responseData.data || responseData
    const paginationData = responseData.pagination || {}

    return { data: beatsFromApi, pagination: paginationData }
  }, [])

  const { items: rawBeats, loading, error, isLoadingMore, hasMore, sentinelRef } = useInfiniteScroll(
    fetchBeats,
    { initialCount: 20, threshold: 500, filters }
  )

  // Filtro client-side por productor (el backend no soporta este filtro)
  const beats = filters.artistId
    ? rawBeats.filter(b => {
        const producerId = typeof b.producer === 'object' ? b.producer?._id : b.producer
        return producerId === filters.artistId
      })
    : rawBeats

  // Sincronizar la playlist del AudioPlayer con la lista de beats visible
  const { setPlaylist } = useAudioPlayer()

  useEffect(() => {
    const beatIds = beats.map(b => b._id || b.id).filter(Boolean)
    setPlaylist(beatIds)
    return () => setPlaylist([])
  }, [beats, setPlaylist])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleReset = () => {
    setFilters(INITIAL_FILTERS)
  }

  return (
    <>
      <div className="beats-page-header">
        <h1>Nuestros Beats</h1>
        <div className="beats-view-toggle">
          <button
            className={`beats-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Vista en grid"
            type="button"
          >
            <FontAwesomeIcon icon={['fas', 'table-cells']} />
          </button>
          <button
            className={`beats-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="Vista en lista"
            type="button"
          >
            <FontAwesomeIcon icon={['fas', 'list']} />
          </button>
        </div>
      </div>

      <BeatsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        artists={artists}
      />

      {error && <p className="error-message">Error: {error}</p>}

      {viewMode === 'grid'
        ? <Cards cards={beats} type="beat" loading={loading} />
        : loading
          ? <SkeletonList count={8} />
          : beats.length === 0
            ? <div className="card-list-empty"><p>No hay beats disponibles</p></div>
            : (
              <div className="beats-list-view">
                {beats.map(beat => (
                  <BeatListRow key={beat._id || beat.id} card={beat} />
                ))}
              </div>
            )}

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
