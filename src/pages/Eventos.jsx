import { useEvents } from '../hooks/useEvents'
import { Cards } from '../components/CardList/CardList'

function Eventos () {
  const { events, loading, error } = useEvents()
  return (
    <>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={events} />}
    </>
  )
}

export default Eventos
