import Card from '../Card/Card.jsx'
import './CardList.css'
export function CardList ({ cards }) {
  return (
    <div className='card-list'>
      {cards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          resume={card.subtitle}
          img={card.img}
        />
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

export function Cards ({ cards }) {
  const hasCards = cards?.length > 0
  return hasCards ? <CardList cards={cards} /> : <CardListEmpty />
}
