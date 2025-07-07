import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { useCards } from './hooks/useCards'
import './App.css'
import { Cards } from './components/CardList/CardList'

function App () {
  const { cards: mappedCards } = useCards()
  return (
    <>
      <Header/>
      <main className="container">
        <Cards cards={mappedCards} />
      </main>
    </>
  )
}

export default App
