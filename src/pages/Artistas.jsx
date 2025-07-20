import { useArtists } from '../hooks/useArtists'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'

function Artistas () {
  const { artists, loading, error } = useArtists()
  return (
    <>
    <h1>Nuestros Artistas</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={artists} type={'artist'} />}
      <CreateButton />
    </>
  )
}

export default Artistas
