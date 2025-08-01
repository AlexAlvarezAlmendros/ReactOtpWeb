import { useEvents } from '../hooks/useEvents'
import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'

function Eventos () {
  const { events, loading, error } = useEvents({
    sortBy: 'date',
    sortOrder: 'desc'
  })
  return (
    <>
      <h1>Últimos Eventos</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={events} type={'event'} />}
      <CreateButton />
    </>
  )
}

export default Eventos
