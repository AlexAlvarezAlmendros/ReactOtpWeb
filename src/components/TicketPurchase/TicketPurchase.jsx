import { useState } from 'react'
import { useStripe } from '../../hooks'
import './TicketPurchase.css'

function TicketPurchase ({ event }) {
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { createCheckoutSession, loading, error } = useStripe()

  // Verificar si la venta está activa
  const isSaleActive = () => {
    if (!event.ticketsEnabled) return false

    const now = new Date()
    if (event.saleStartDate && now < new Date(event.saleStartDate)) return false
    if (event.saleEndDate && now > new Date(event.saleEndDate)) return false

    return event.availableTickets > 0
  }

  // Obtener el estado de la venta
  const getSaleStatus = () => {
    if (!event.ticketsEnabled) return null

    const now = new Date()

    // Venta no ha comenzado
    if (event.saleStartDate && now < new Date(event.saleStartDate)) {
      return {
        type: 'not-started',
        message: 'La venta de entradas aún no ha comenzado'
      }
    }

    // Venta ha finalizado
    if (event.saleEndDate && now > new Date(event.saleEndDate)) {
      return {
        type: 'ended',
        message: 'La venta de entradas ha finalizado'
      }
    }

    // Entradas agotadas
    if (event.availableTickets === 0) {
      return {
        type: 'sold-out',
        message: 'Las entradas están agotadas'
      }
    }

    // Venta activa
    return {
      type: 'active',
      message: null
    }
  }

  const saleStatus = getSaleStatus()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!customerName || !customerEmail) {
      alert('Por favor, completa todos los campos')
      return
    }

    await createCheckoutSession(
      event.id,
      quantity,
      customerEmail,
      customerName
    )
  }

  if (!event.ticketsEnabled) {
    return null
  }

  // Si es venta externa, mostrar botón de redirección
  if (event.externalTicketUrl) {
    return (
      <div className='ticket-purchase external-tickets'>
        <div className='external-ticket-card'>
          <div className='ticket-icon'>
            🎫
          </div>
          <div className='ticket-infoExternas'>
            <h3>Entradas Disponibles</h3>
            <p className='external-description'>
              Las entradas para este evento se gestionan a través de una plataforma externa
            </p>
          </div>

          <a
            href={event.externalTicketUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='btn-external-tickets'
          >
            <span>Comprar Entradas</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L9 4L14.5 9.5H3V10.5H14.5L9 16L10 17L17 10L10 3Z" fill="currentColor"/>
            </svg>
          </a>

          <p className='external-note'>
            Serás redirigido a la plataforma de venta
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='ticket-purchase internal-tickets'>
      <div className='ticket-header'>
        <div className='ticket-icon'>
          🎫
        </div>
        <div className='ticket-infoExternas'>
          <h3>Entradas Disponibles</h3>
          <div className='ticket-price'>
            <span className='price'>{event.ticketPrice}€</span>
            <span className='per-ticket'>por entrada</span>
          </div>
          <div className='ticket-availability'>
            {event.availableTickets > 0
              ? (
                <span className='available'>
                  ✓ {event.availableTickets} entradas disponibles
                </span>
                )
              : (
                <span className='sold-out'>✗ Agotado</span>
                )}
          </div>
        </div>
      </div>

      {/* Mostrar mensaje si la venta no está activa */}
      {saleStatus && saleStatus.type !== 'active' && (
        <div className={`sale-status-message ${saleStatus.type}`}>
          <span className='status-icon'>
            {saleStatus.type === 'not-started' && '⏳'}
            {saleStatus.type === 'ended' && '🔒'}
            {saleStatus.type === 'sold-out' && '✗'}
          </span>
          <span className='status-text'>{saleStatus.message}</span>
        </div>
      )}

      {isSaleActive() && !showForm && (
        <button
          className='btn-external-tickets'
          onClick={() => setShowForm(true)}
        >
          <span>Comprar Entradas</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L9 4L14.5 9.5H3V10.5H14.5L9 16L10 17L17 10L10 3Z" fill="currentColor"/>
            </svg>
        </button>
      )}

      {showForm && (
        <form className='ticket-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='quantity'>Cantidad de entradas</label>
            <input
              type='number'
              id='quantity'
              value={quantity}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setQuantity('')
                } else {
                  const numValue = parseInt(value)
                  if (!isNaN(numValue)) {
                    setQuantity(Math.max(1, Math.min(numValue, Math.min(event.availableTickets, 10))))
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                  setQuantity(1)
                }
              }}
              min='1'
              max={Math.min(event.availableTickets, 10)}
              required
            />
            <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
              Máximo {Math.min(event.availableTickets, 10)} entradas por compra
            </small>
          </div>

          <div className='form-group'>
            <label htmlFor='name'>Nombre completo *</label>
            <input
              type='text'
              id='name'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='Tu nombre'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='email'>Email *</label>
            <input
              type='email'
              id='email'
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder='tu@email.com'
              required
            />
          </div>

          <div className='ticket-total'>
            <span>Total:</span>
            <strong>{(quantity * event.ticketPrice).toFixed(2)}€</strong>
          </div>

          {error && <div className='error-message'>{error}</div>}

          <div className='form-actions'>
            <button
              type='button'
              onClick={() => setShowForm(false)}
              className='btn-cancel'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='btn-checkout'
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Proceder al pago'}
            </button>
          </div>

          <p className='payment-info'>
            <small>Pago seguro procesado por Stripe</small>
          </p>
        </form>
      )}
    </div>
  )
}

export default TicketPurchase
