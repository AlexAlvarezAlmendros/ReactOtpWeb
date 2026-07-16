import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../Card.css'
import './NewsletterCard.css'
import GlassSurface from '../GlassSurface'
import { motion } from 'motion/react'
import { useTilt } from '../../hooks/useTilt'

function NewsletterCard ({ card, onEdit, onDelete }) {
  // Determine status color/icon
  const statusConfig = {
    draft: { label: 'Borrador', color: '#6c757d', icon: 'pen' },
    scheduled: { label: 'Programado', color: '#ffc107', icon: 'clock' },
    sent: { label: 'Enviado', color: '#28a745', icon: 'check-circle' }
  }

  const status = statusConfig[card.status] || statusConfig.draft

  const handleEditClick = () => {
    if (onEdit) {
      onEdit()
    }
  }

  const tilt = useTilt()

  return (
    <GlassSurface as={motion.article} {...tilt} className='card newsletter-card'>
      <div className='card-content'>
        <div className='newsletter-top-row'>
            <span className='newsletter-date'>
                {new Date(card.createdAt || Date.now()).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <div className={`status-indicator status-${card.status}`}>
                <span className="status-dot"></span>
                {status.label}
            </div>
        </div>
        
        <div className='newsletter-main-info'>
            <h3>{card.title}</h3>
        </div>

        <div className='newsletter-actions'>
            <button 
              className='newsletter-btn'
              onClick={handleEditClick} 
              title='Editar'
            >
                <FontAwesomeIcon icon='edit' />
            </button>
            <button className='newsletter-btn delete' onClick={onDelete} title='Eliminar'>
                <FontAwesomeIcon icon='trash' />
            </button>
        </div>
      </div>
    </GlassSurface>
  )
}

export default NewsletterCard
