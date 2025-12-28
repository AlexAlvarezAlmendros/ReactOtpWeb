import { Cards } from '../components/CardList/CardList'
import CreateButton from '../components/CreateButton/CreateButton'
import { useBeats } from '../hooks/useBeats'

function Beats () {
  const { beats, loading, error } = useBeats()
  
  return (
    <>
      <h1>Nuestros Beats</h1>
      {error && <p>Error: {error}</p>}
      <Cards cards={beats} type={'beat'} loading={loading} />
      <CreateButton />
    </>
  )
}

export default Beats
