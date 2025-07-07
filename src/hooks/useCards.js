import responseCards from '../mocks/cards.json'

export function useCards () {
  const cards = responseCards.cards

  const mappedCards = cards.map((card) => {
    return {
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      img: card.img,
      spotifyLink: card.spotifyLink,
      youtubeLink: card.youtubeLink,
      appleMusicLink: card.appleMusicLink,
      instagramLink: card.instagramLink,
      soundCloudLink: card.soundCloudLink,
      beatStarsLink: card.beatStarsLink,
      twitterLink: card.twitterLink,
      ubicacion: card.ubicacion,
      video: card.video,
      cardType: card.cardType,
      date: card.date,
      userId: card.userId
    }
  })

  return { cards: mappedCards }
}
