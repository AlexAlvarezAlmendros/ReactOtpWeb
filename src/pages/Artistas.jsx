import { useReleases } from '../hooks/useReleases'
import { Cards } from '../components/CardList/CardList'

function Artistas () {
  const { releases, loading, error } = useReleases()
  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={releases} />}
    </>
  )
}

export default Artistas
