import { useArtists } from '../hooks/useArtists'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'

function Artistas () {
  const { artists, loading, error } = useArtists()
  return (
    <>
    <h1>Nuestros Artistas</h1>
      {error && <p>Error: {error}</p>}
      <Cards cards={artists} type={'artist'} loading={loading} />
      <CreateButton />
    </>
  )
}

export default Artistas
