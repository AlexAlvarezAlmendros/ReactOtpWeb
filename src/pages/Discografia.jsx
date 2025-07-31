import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useReleases } from '../hooks/useReleases'

function Discografia () {
  const { releases, loading, error } = useReleases()
  return (
	<>
	<h1>Nuestra Discografía</h1>
	  {loading && <p>Cargando...</p>}
	  {error && <p>Error: {error}</p>}
	  {!loading && <Cards cards={releases} type={'release'} />}
	  <CreateButton />
	</>
  )
}

export default Discografia