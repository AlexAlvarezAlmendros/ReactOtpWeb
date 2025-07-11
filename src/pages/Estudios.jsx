import { Cards } from '../components/CardList/CardList'
import { useStudios } from '../hooks/useStudios'

function Estudios () {
  const { cards, loading, error } = useStudios()
  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={cards} type={'studio'} />}
    </>
  )
}

export default Estudios
