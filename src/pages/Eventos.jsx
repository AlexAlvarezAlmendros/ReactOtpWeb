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
      {error && <p>Error: {error}</p>}
      <Cards cards={events} type={'event'} loading={loading} />
      <CreateButton />
    </>
  )
}

export default Eventos
