import './UltimosLanzamientos.css'
import { Cards } from '../CardList/CardList'
import { useReleases } from '../../hooks/useReleases'
export function UltimosLanzamientos () {
  const { releases: cards, loading, error } = useReleases()
  return (
    <section>
        <h2 className='ultimos-lanzamientos-title'>Últimos lanzamientos</h2>
        <div className='ultimos-lanzamientos-list'>
            {loading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && <Cards cards={cards} type={'release'} />}
        </div>
    </section>
  )
}
