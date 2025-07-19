import './UltimosLanzamientos.css'
import { Cards } from '../CardList/CardList'
import { useReleases } from '../../hooks/useReleases'
export function UltimosLanzamientos () {
  const { releases: cards, loading, error } = useReleases()
  return (
    <section className='ultimos-lanzamientos-section'>
      <div className='ultimos-lanzamientos-content'>
        <h2 className='ultimos-lanzamientos-title'>Últimos Lanzamientos</h2>
        <div className='ultimos-lanzamientos-list'>
            {loading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && <Cards cards={cards} type={'release'} />}
        </div>
      </div>
    </section>
  )
}
