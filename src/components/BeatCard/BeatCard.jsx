import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BeatLicenseModal from '../BeatLicenseModal/BeatLicenseModal'
import { useBeatPurchase } from '../../hooks/useBeatPurchase'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import LazyImage from '../LazyImage/LazyImage'
import '../Card.css'
import './BeatCard.css'

function BeatCard ({ card }) {
  // Manejar la imagen del beat (usar coverUrl de la API)
  const imageUrl = card.coverUrl || '/img/default-beat.jpg'
  const isFree = !card.price || card.price === 0
  const hasLicenses = card.licenses && card.licenses.length > 0

  // Obtener la URL de audio de la primera licencia que tenga mp3Url en files
  const audioUrl = card.licenses?.find(license => license.files?.mp3Url)?.files?.mp3Url || null

  console.log('🎵 BeatCard:', {
    title: card.title,
    hasLicenses: card.licenses?.length || 0,
    licenses: card.licenses,
    audioUrl,
    cardId: card._id || card.id
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const { createCheckoutSession, loading, error } = useBeatPurchase()
  
  // Usar useAudioPlayer con manejo de error
  let audioPlayerContext
  try {
    audioPlayerContext = useAudioPlayer()
  } catch (err) {
    console.error('❌ AudioPlayerContext no disponible:', err)
    audioPlayerContext = {
      currentPlaying: null,
      registerAudio: () => {},
      unregisterAudio: () => {},
      playAudio: () => {},
      pauseAudio: () => {}
    }
  }
  
  const { currentPlaying, registerAudio, unregisterAudio, playAudio, pauseAudio } = audioPlayerContext

  // Registrar el audio al montar y desregistrar al desmontar
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      registerAudio(card._id || card.id, audioRef.current)
    }
    return () => {
      if (audioUrl) {
        unregisterAudio(card._id || card.id)
      }
    }
  }, [card._id, card.id, audioUrl, registerAudio, unregisterAudio])

  // Sincronizar estado de reproducción con el contexto global
  useEffect(() => {
    const isCurrentlyPlaying = currentPlaying === (card._id || card.id)
    setIsPlaying(isCurrentlyPlaying)
  }, [currentPlaying, card._id, card.id])

  // Manejar eventos del audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  const handlePlayPause = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const beatId = card._id || card.id
    if (isPlaying) {
      pauseAudio(beatId)
    } else {
      playAudio(beatId)
    }
  }

  const handlePurchaseClick = () => {
    if (isFree) {
      // Handle free download
      if (card.audioUrl) {
        window.open(card.audioUrl, '_blank')
      } else {
        alert('URL de descarga no disponible')
      }
    } else if (hasLicenses) {
      // Open license selection modal
      setIsModalOpen(true)
    } else {
      // No licenses available
      alert('Este beat no tiene licencias disponibles para comprar')
    }
  }

  const handlePurchase = async (purchaseData) => {
    try {
      await createCheckoutSession(
        purchaseData.beatId,
        purchaseData.licenseId,
        purchaseData.customerEmail,
        purchaseData.customerName
      )
      // Redirect to Stripe happens in the hook
    } catch (err) {
      alert(error || 'Error al procesar la compra. Por favor intenta de nuevo.')
    }
  }

  return (
    <>
      <article className='card'>
        <div className="card-image-link beat-card-image-container">
          <LazyImage src={imageUrl} alt={`Portada de ${card.title}`} />
          
          {/* Audio Player Overlay */}
          {audioUrl && (
            <>
              <audio ref={audioRef} src={audioUrl} preload="metadata" />
              <button
                className={`beat-play-button ${isPlaying ? 'playing' : ''}`}
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                <FontAwesomeIcon 
                  icon={['fas', isPlaying ? 'pause' : 'play']} 
                  className="play-icon"
                />
              </button>
            </>
          )}
        </div>
        <div className='card-content'>
          <div>
            <h2>{card.title}</h2>
            {card.producer && <p>Prod. by {typeof card.producer === 'object' ? card.producer.name : card.producer}</p>}
            {(card.genre || card.bpm) && (
              <p style={{ color: '#999999' }}>
                {card.genre}{card.genre && card.bpm && ' • '}{card.bpm && `${card.bpm} BPM`}
              </p>
            )}
          </div>
          <div className='card__buttons'>
            <button 
              className="beat-purchase-btn"
              onClick={handlePurchaseClick}
              disabled={loading}
              style={{
                backgroundColor: '#ff003c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontWeight: '700',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                width: '100%',
                justifyContent: 'center',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#e6003a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#ff003c'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <FontAwesomeIcon icon={['fas', isFree ? 'download' : 'shopping-cart']} />
              <span>{loading ? 'Procesando...' : isFree ? 'Free Download' : hasLicenses ? 'Ver Licencias' : `${card.price}€`}</span>
            </button>
          </div>
        </div>
      </article>

      {/* License Selection Modal */}
      <BeatLicenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        beat={card}
        onPurchase={handlePurchase}
      />
    </>
  )
}

export default BeatCard
