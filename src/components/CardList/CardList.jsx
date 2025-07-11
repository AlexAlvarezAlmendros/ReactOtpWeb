import ArtistCard from '../ArtistCard/ArtistCard.jsx'
import EventsCard from '../EventsCard/EventsCard.jsx'
import ReleaseCard from '../ReleaseCard/ReleaseCard.jsx'
import StudioCard from '../StudioCard/StudioCard.jsx'
import './CardList.css'

const cardComponents = {
  artist: ArtistCard,
  release: ReleaseCard,
  event: EventsCard,
  studio: StudioCard
}

export function CardList ({ cards, type }) {
  const CardComponent = cardComponents[type]

  if (!CardComponent) {
    console.error(`Error: Tipo de tarjeta desconocido "${type}"`)
    return null
  }

  return (
    <div className='card-list'>
      {cards.map(card => (
        <CardComponent
          key={card.id}
          card={card}/>
      ))}
    </div>
  )
}

export function CardListEmpty () {
  return (
    <div className='card-list-empty'>
      <p>No data available</p>
    </div>
  )
}

export function Cards ({ cards, type }) {
  const hasCards = cards?.length > 0
  return hasCards ? <CardList cards={cards} type={type} /> : <CardListEmpty />
}
