import { useReleases } from '../hooks/useReleases'
import { Cards } from '../components/CardList/CardList'
import CreateCard from '../components/CreateCard/CreateCard'

function Inicio () {
  const { releases: cards, loading, error } = useReleases()

  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={cards} type={'release'} />}
      <CreateCard type={'release'} />
    </>
  )
}

export default Inicio
