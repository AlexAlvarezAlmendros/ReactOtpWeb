import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './TicketInfo.css';
import { usePageMeta } from '../hooks/usePageMeta'

const API_URL = import.meta.env.VITE_API_URL

function TicketInfo () {
  usePageMeta({ title: 'Tu entrada', noindex: true })

  const { validationCode } = useParams()
  const { user, canValidateTickets } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [wasAlreadyValidated, setWasAlreadyValidated] = useState(false)
  
  // Flag para evitar múltiples validaciones
  const hasAttemptedValidation = useRef(false)

  const fetchTicketInfo = useCallback(async () => {
    let isMounted = true

    try {
      const res = await fetch(`${API_URL}/tickets/info/${validationCode}`)
      
      if (!res.ok) {
        throw new Error('Ticket no encontrado')
      }
      
      const data = await res.json()
      
      if (isMounted) {
        setTicket(data)
        setError(null)
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message)
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }

    return () => {
      isMounted = false
    }
  }, [validationCode])

  useEffect(() => {
    fetchTicketInfo()
  }, [fetchTicketInfo])

  // Auto-validar cuando se carga el ticket y el usuario tiene permisos
  useEffect(() => {
    const shouldValidate = !loading 
      && ticket 
      && canValidateTickets 
      && !validating 
      && !hasAttemptedValidation.current

    if (!shouldValidate) return

    const ticketData = ticket.ticket || ticket
    const isAlreadyValidated = ticketData.validated || ticket.validated
    
    if (isAlreadyValidated) {
      // Marcar que ya estaba validado ANTES de nuestra petición
      setWasAlreadyValidated(true)
      hasAttemptedValidation.current = true
      return
    }

    // Marcar que ya se intentó validar
    hasAttemptedValidation.current = true

    const validateTicket = async () => {
      setValidating(true)
      try {
        const token = await getToken()
        
        const response = await fetch(
          `${API_URL}/tickets/validate/${validationCode}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error al validar' }))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
        // Actualizar el ticket con los nuevos datos
        setTicket({
          ...ticket,
          validated: true,
          validatedAt: result.ticket?.validatedAt || result.validatedAt || new Date().toISOString()
        })

        // Marcar que NOSOTROS acabamos de validar (no estaba validado antes)
        setWasAlreadyValidated(false)
        setValidationResult({
          success: true,
          message: 'Entrada validada correctamente',
          validatedAt: result.ticket?.validatedAt || result.validatedAt
        })
      } catch (err) {
        setValidationResult({
          success: false,
          message: err.message
        })
      } finally {
        setValidating(false)
      }
    }

    validateTicket()
  }, [loading, ticket, canValidateTickets, validating, getToken, validationCode])

  if (loading) return <LoadingSpinner />
  if (error) return <div className='error-page'>{error}</div>
  if (!ticket) return <div className='not-found'>Ticket no encontrado</div>

  // Extraer datos del ticket (puede venir en diferentes formatos)
  const eventData = ticket.event || {}
  const ticketData = ticket.ticket || ticket

  return (
    <div className='ticket-info'>
      <div className='ticket-card'>
        <div className='ticket-header'>
          <span className='ticket-icon'>🎫</span>
          <h1>
            {canValidateTickets ? 'Validación de Entrada' : 'Información del Ticket'}
          </h1>
        </div>

        {/* Información del evento - Visible para todos */}
        <div className='event-info'>
          <h2>{eventData.name || 'Evento'}</h2>
          {eventData.date && (
            <p><strong>📅 Fecha:</strong> {new Date(eventData.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          )}
          {eventData.location && (
            <p><strong>📍 Lugar:</strong> {eventData.location}</p>
          )}
          <p><strong>🎟️ Cantidad:</strong> {ticketData.quantity || ticket.quantity || 1} entrada(s)</p>
        </div>

        {/* Información del comprador - Solo staff/admin */}
        {canValidateTickets && (
          <div className='buyer-info'>
            <h3>Información del ticket</h3>
            <p><strong>Código:</strong> {ticketData.code || ticketData.ticketCode || ticket.ticketCode || 'N/A'}</p>
          </div>
        )}

        {/* Estado del ticket - Solo mostrar si NO acabamos de validar exitosamente */}
        {!(validationResult && validationResult.success && !wasAlreadyValidated) && (
          <div className={`ticket-status ${(ticketData.validated || ticket.validated) ? 'used' : 'valid'}`}>
            {(ticketData.validated || ticket.validated)
              ? (
                <>
                  <span className='status-icon'>❌</span>
                  <div>
                    <p className='status-text'>Entrada ya utilizada</p>
                    {(ticketData.validatedAt || ticket.validatedAt) && (
                      <small>
                        Validado el {new Date(ticketData.validatedAt || ticket.validatedAt).toLocaleString('es-ES')}
                      </small>
                    )}
                  </div>
                </>
                )
              : validating ? (
                <>
                  <span className='status-icon'>⏳</span>
                  <p className='status-text'>Validando entrada...</p>
                </>
              ) : (
                <>
                  <span className='status-icon'>✅</span>
                  <p className='status-text'>Entrada válida</p>
                </>
                )}
          </div>
        )}

        {/* Mostrar éxito solo si NOSOTROS acabamos de validar (no estaba validado antes) */}
        {canValidateTickets && validationResult && validationResult.success && !wasAlreadyValidated && (
          <div className='validation-result success'>
            <p>
              ✅ {validationResult.message}
            </p>
          </div>
        )}

        {/* Mostrar error si falla la validación */}
        {canValidateTickets && validationResult && !validationResult.success && (
          <div className='validation-result error'>
            <p>
              ❌ {validationResult.message}
            </p>
          </div>
        )}

        {/* Mensaje para usuarios normales */}
        {!canValidateTickets && !(ticketData.validated || ticket.validated) && (
          <div className='user-message'>
            <p>📱 Este ticket es válido para el evento.</p>
            <p>Muestra el código QR en la entrada del evento.</p>
          </div>
        )}

        <button onClick={() => navigate('/')} className='btn-back'>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default TicketInfo
