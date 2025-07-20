import { useState } from 'react'
import './UltimosLanzamientos.css'
import { Cards } from '../CardList/CardList'
import { useReleases } from '../../hooks/useReleases'

export function UltimosLanzamientos () {
  const [currentPage] = useState(1)
  const [filters] = useState({
    count: 3,
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const {
    releases: cards,
    loading,
    error
  } = useReleases({
    ...filters,
    page: currentPage
  })

  return (
    <section>
      <h2 className='ultimos-lanzamientos-title'>Últimos lanzamientos</h2>
      <div className='ultimos-lanzamientos-list'>
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && (
          <>
            <Cards cards={cards} type={'release'} />
          </>
        )}
      </div>
    </section>
  )
}
