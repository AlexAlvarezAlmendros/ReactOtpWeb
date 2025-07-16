import { useReleases } from '../hooks/useReleases'
import { Cards } from '../components/CardList/CardList'
import CreateCard from '../components/CreateCard/CreateCard'
import CreateButton from '../components/CreateButton/CreateButton'

function Inicio () {
  const { releases: cards, loading, error } = useReleases()

  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={cards} type={'release'} />}
      <CreateButton />
    </>
  )
}

export default Inicio
