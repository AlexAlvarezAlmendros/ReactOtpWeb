import { useState } from 'react'
import './UltimosBeats.css'
import { Cards } from '../CardList/CardList'
import { useBeats } from '../../hooks/useBeats'

export function UltimosBeats () {
  const [currentPage] = useState(1)
  const [filters] = useState({
    count: 3,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const {
    beats: cards,
    loading,
    error
  } = useBeats({
    ...filters,
    page: currentPage
  })

  return (
    <section>
      <h2 className='ultimos-beats-title'>Últimos Beats</h2>
      <div className='ultimos-beats-list'>
        {error && <p>Error: {error}</p>}
        <Cards cards={cards} type={'beat'} loading={loading} skeletonCount={3} />
      </div>
    </section>
  )
}
