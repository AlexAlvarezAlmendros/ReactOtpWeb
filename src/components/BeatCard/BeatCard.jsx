import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BeatLicenseModal from '../BeatLicenseModal/BeatLicenseModal'
import { useBeatPurchase } from '../../hooks/useBeatPurchase'
import LazyImage from '../LazyImage/LazyImage'
import '../Card.css'

function BeatCard ({ card }) {
  // Manejar la imagen del beat (usar coverUrl de la API)
  const imageUrl = card.coverUrl || '/img/default-beat.jpg'
  const isFree = !card.price || card.price === 0
  const hasLicenses = card.licenses && card.licenses.length > 0

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { createCheckoutSession, loading, error } = useBeatPurchase()

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
        <div className="card-image-link">
          <LazyImage src={imageUrl} alt={`Portada de ${card.title}`} />
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
