import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useReleases } from '../hooks/useReleases'

function Discografia () {
  const { releases, loading, error } = useReleases()
  return (
	<>
	<h1>Nuestra Discografía</h1>
	  {error && <p>Error: {error}</p>}
	  <Cards cards={releases} type={'release'} loading={loading} />
	  <CreateButton />
	</>
  )
}

export default Discografia