import { useState } from 'react'
import './ArtistasMasActivos.css'
import { Cards } from '../CardList/CardList'
import { useArtists } from '../../hooks/useArtists'

export function ArtistasMasActivos () {
  const [currentPage] = useState(1)
  const [filters] = useState({
    count: 3,
    sortBy: 'date',
    sortOrder: 'asc'
  })

  const {
    artists: cards,
    loading,
    error
  } = useArtists({
    ...filters,
    page: currentPage
  })

  return (
    <section>
      <h2 className='artistas-activos-title'>Artistas más activos</h2>
      <div className='artistas-activos-list'>
        {error && <p>Error: {error}</p>}
        <Cards cards={cards} type={'artist'} loading={loading} skeletonCount={3} />
      </div>
    </section>
  )
}
