import { useReleases } from '../hooks/useReleases'
import { Cards } from '../components/CardList/CardList'

function Inicio () {
  const { cards, loading, error } = useReleases()
  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={cards} type={'release'} />}
    </>
  )
}

export default Inicio
