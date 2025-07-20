import { useState } from 'react'
import './ArtistasMasActivos.css'
import { Cards } from '../CardList/CardList'
import { useArtists } from '../../hooks/useArtists'

export function ArtistasMasActivos () {
  const [currentPage] = useState(1)
  const [filters] = useState({
    count: 3,
    sortBy: 'date',
    sortOrder: 'desc'
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
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && (
          <>
            <Cards cards={cards} type={'artist'} />
          </>
        )}
      </div>
    </section>
  )
}
