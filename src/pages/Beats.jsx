import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useBeats } from '../hooks/useBeats'

function Beats () {
  const { beats, loading, error } = useBeats()
  
  return (
    <>
      <h1>Nuestros Beats</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && <Cards cards={beats} type={'beat'} />}
      <CreateButton />
    </>
  )
}

export default Beats
