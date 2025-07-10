import { useReleases } from '../hooks/useReleases'
import { Cards } from '../components/CardList/CardList'

function Artistas () {
  const { cards, loading, error } = useReleases()
  return (
    <>
       {loading && <p>Cargando...</p>}
       {error && <p>Error: {error}</p>}
       {!loading && <Cards cards={cards} />}
    </>
  )
}

export default Artistas
