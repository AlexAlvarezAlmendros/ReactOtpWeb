import { useArtists } from '../hooks/useArtists'
import { Cards } from '../components/CardList/CardList'

function Artistas () {
  const { artists, loading, error } = useArtists()
  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={artists} />}
    </>
  )
}

export default Artistas
