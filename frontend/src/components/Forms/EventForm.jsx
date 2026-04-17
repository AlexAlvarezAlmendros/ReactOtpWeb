import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useEffect } from 'react'
import { useCreateEvent } from '../../hooks/useCreateEvent.js'
import { useAuth } from '../../hooks/useAuth.js'
import RichTextEditor from '../RichTextEditor/RichTextEditor.jsx'
import { ImageUploader } from '../ImageUploader/ImageUploader.jsx'
import './Forms.css'

export default function EventForm ({ onSuccess, initialData = null, isEditMode = false }) {
  console.log('🎪 EventForm - initialData:', initialData)
  console.log('🎪 EventForm - isEditMode:', isEditMode)
  
  const { user } = useAuth()
  const [errors, setErrors] = useState([])
  const [ticketsEnabled, setTicketsEnabled] = useState(initialData?.ticketsEnabled || false)
  const [externalTickets, setExternalTickets] = useState(initialData?.externalTicketUrl ? true : false)
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageFile, setImageFile] = useState(null)
  const { createEvent, loading, error: apiError } = useCreateEvent()

  // Actualizar el estado cuando initialData cambie
  useEffect(() => {
    if (initialData?.ticketsEnabled !== undefined) {
      setTicketsEnabled(initialData.ticketsEnabled)
    }
    if (initialData?.externalTicketUrl) {
      setExternalTickets(true)
    }
    if (initialData?.description !== undefined) {
      setDescription(initialData.description)
    }
  }, [initialData])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())

    console.log('📝 Raw form data:', data)
    console.log('📝 ticketsEnabled value:', data.ticketsEnabled)
    console.log('📝 externalTickets checkbox:', data.externalTickets)
    console.log('📝 externalTicketUrl field:', data.externalTicketUrl)

    const validationErrors = []

    // Validación del título
    if (data.title && data.title.length > 60) {
      validationErrors.push('El título no puede tener más de 60 caracteres')
    }
    // Validación del artista
    if (data.artist && data.artist.length > 60) {
      validationErrors.push('El artista no puede tener más de 60 caracteres')
    }

    // Validación de URLs (máximo 150 caracteres)
    const urlFields = [
      'img',
      'youtube',
      'instagram'
    ]
    for (const field of urlFields) {
      if (data[field] && data[field].length > 300) {
        validationErrors.push(
          `La URL de ${field} no puede tener más de 300 caracteres`
        )
      }
    }

    // Si hay errores, mostrarlos y detener el envío
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // Limpiar errores si todo está bien
      setErrors([])

      // El checkbox devuelve 'on' cuando está marcado, o undefined cuando no lo está
      const isTicketsEnabled = data.ticketsEnabled === 'on' || data.ticketsEnabled === 'true'

      const eventData = {
        name: data.title,
        location: data.location,
        colaborators: data.colaborators,
        description: description || '',
        img: data.img || '',
        youtubeLink: data.youtube || '',
        instagramLink: data.instagram || '',
        detailpageUrl: data.detailpageUrl || '',
        eventType: data.type,
        date: data.eventDate ? new Date(data.eventDate).toISOString() : new Date().toISOString(),
        userId: user?.sub || null,
        // Campos de tickets
        ticketsEnabled: isTicketsEnabled
      }

      // Solo agregar campos de tickets si están habilitados
      if (isTicketsEnabled) {
        // Si es venta por terceros, solo guardar la URL
        const isExternalTickets = data.externalTickets === 'on' || data.externalTickets === 'true'
        
        if (isExternalTickets) {
          eventData.externalTicketUrl = data.externalTicketUrl || ''
          // No enviar campos de venta interna cuando son tickets externos
          // El backend los mantendrá con sus valores actuales o por defecto
        } else {
          // Venta interna normal
          eventData.externalTicketUrl = ''
          eventData.ticketPrice = parseFloat(data.ticketPrice) || 0
          eventData.totalTickets = parseInt(data.totalTickets) || 0
        
        // En modo edición, solo actualizar availableTickets si totalTickets cambió
        if (isEditMode && initialData?.totalTickets !== undefined) {
          // Si el total de tickets cambió, recalcular disponibles
          if (parseInt(data.totalTickets) !== initialData.totalTickets) {
            const ticketsSold = initialData.ticketsSold || 0
            eventData.availableTickets = Math.max(0, parseInt(data.totalTickets) - ticketsSold)
          }
          // Si no cambió, no enviar availableTickets para no sobreescribirlo
        } else {
          // En modo creación, availableTickets = totalTickets
          eventData.availableTickets = parseInt(data.totalTickets) || 0
        }
        
        // Las fechas se envían solo si tienen valor, independientemente del estado del checkbox
        if (data.saleStartDate) {
          eventData.saleStartDate = new Date(data.saleStartDate).toISOString()
        } else {
          eventData.saleStartDate = null
        }
        
        if (data.saleEndDate) {
          eventData.saleEndDate = new Date(data.saleEndDate).toISOString()
          } else {
            eventData.saleEndDate = null
          }
        }
      } else {
        // Si se deshabilitan los tickets, resetear todos los valores
        eventData.externalTicketUrl = ''
        eventData.ticketPrice = 0
        eventData.totalTickets = 0
        eventData.availableTickets = 0
        eventData.saleStartDate = null
        eventData.saleEndDate = null
      }      console.log('📦 Event data to send:', eventData)

      if (isEditMode) {
        // En modo edición, pasar los datos al callback onSuccess
        onSuccess?.(eventData, imageFile)
      } else {
        // En modo creación, usar el hook de createEvent
        await createEvent(eventData, imageFile)
        event.target.reset() // Limpiar el formulario después de enviar
        setDescription('') // Limpiar el editor de texto
        setImageFile(null) // Limpiar imagen
        onSuccess?.('Evento creado con éxito')
      }
    } catch (error) {
      setErrors([apiError || 'Error al crear el evento: ' + error.message])
    }
  }

  return (
    <div className="form-layout">
      {/* Columna izquierda: portada */}
      <aside className="form-layout__sidebar">
        <ImageUploader
          label="Imagen de portada*"
          onChange={setImageFile}
          currentImageUrl={initialData?.img || ''}
          selectedFile={imageFile}
        />
      </aside>

      {/* Columna derecha: secciones del formulario */}
      <form onSubmit={handleSubmit} className="form-layout__body">
        {/* --- Información básica --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Información básica</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="title">Título*</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  defaultValue={initialData?.title || initialData?.name || ''} 
                  required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="location">Ubicación*</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  defaultValue={initialData?.location || ''} 
                  required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="colaborators">Colaboradores*</label>
                <input 
                  type="text" 
                  id="colaborators" 
                  name="colaborators" 
                  defaultValue={initialData?.colaborators || ''} 
                  required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="eventDate">Fecha del evento*</label>
                <input 
                  type="datetime-local" 
                  id="eventDate" 
                  name="eventDate" 
                  defaultValue={initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : ''} 
                  required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="type">Tipo*</label>
                <select 
                  id="type" 
                  name="type" 
                  defaultValue={initialData?.eventType || initialData?.type || ''} 
                  required
                >
                <option value="">Seleccione un tipo</option>
                <option value="Concert">Concierto</option>
                <option value="Festival">Festival</option>
                <option value="Showcase">Showcase</option>
                <option value="Party">Party</option>
                </select>
            </div>
          </div>
        </fieldset>

        {/* --- Links --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Links</legend>
          <div className="form-layout__grid">
            <div className="form-group">
                <label htmlFor="youtube">YouTube URL</label>
                <input 
                  type="url" 
                  id="youtube" 
                  name="youtube" 
                  defaultValue={initialData?.youtubeLink || ''} 
                />
            </div>

            <div className="form-group">
                <label htmlFor="instagram">Instagram URL</label>
                <input 
                  type="url" 
                  id="instagram" 
                  name="instagram" 
                  defaultValue={initialData?.instagramLink || ''} 
                />
            </div>
          </div>
        </fieldset>

        {/* --- Descripción --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Descripción</legend>
          <div className="form-group">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe el evento, artistas, horarios, etc."
            />
          </div>
        </fieldset>

        {/* --- Tickets --- */}
        <fieldset className="form-layout__fieldset">
          <legend className="form-layout__legend">Entradas</legend>
          <div className="form-group">
            <label htmlFor="ticketsEnabled">
              <input 
                type="checkbox" 
                id="ticketsEnabled" 
                name="ticketsEnabled"
                value="true"
                defaultChecked={initialData?.ticketsEnabled || false}
                onChange={(e) => setTicketsEnabled(e.target.checked)}
                style={{ width: 'auto', marginRight: '8px' }}
              />
              Habilitar venta de entradas
            </label>
          </div>

          {ticketsEnabled && (
            <>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label htmlFor="externalTickets">
                  <input 
                    type="checkbox" 
                    id="externalTickets" 
                    name="externalTickets"
                    value="true"
                    defaultChecked={initialData?.externalTicketUrl ? true : false}
                    onChange={(e) => setExternalTickets(e.target.checked)}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Entradas vendidas por terceros
                </label>
              </div>

              {externalTickets ? (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label htmlFor="externalTicketUrl">URL de venta externa*</label>
                  <input 
                    type="url" 
                    id="externalTicketUrl" 
                    name="externalTicketUrl" 
                    placeholder="https://ticketmaster.com/evento"
                    defaultValue={initialData?.externalTicketUrl || ''} 
                    required={externalTickets}
                  />
                  <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                    Los usuarios serán redirigidos a esta URL para comprar las entradas
                  </small>
                </div>
              ) : (
                <div className="form-layout__grid" style={{ marginTop: '0.75rem' }}>
                  <div className="form-group">
                      <label htmlFor="ticketPrice">Precio por entrada (€)*</label>
                      <input 
                        type="number" 
                        id="ticketPrice" 
                        name="ticketPrice" 
                        step="0.01"
                        min="0"
                        defaultValue={initialData?.ticketPrice || ''} 
                        required={ticketsEnabled && !externalTickets}
                      />
                  </div>

                  <div className="form-group">
                      <label htmlFor="totalTickets">Cantidad total*</label>
                      <input 
                        type="number" 
                        id="totalTickets" 
                        name="totalTickets" 
                        min="1"
                        defaultValue={initialData?.totalTickets || ''} 
                        required={ticketsEnabled && !externalTickets}
                      />
                  </div>

                  <div className="form-group">
                      <label htmlFor="saleStartDate">Inicio de venta</label>
                      <input 
                        type="datetime-local" 
                        id="saleStartDate" 
                        name="saleStartDate" 
                        defaultValue={initialData?.saleStartDate ? new Date(initialData.saleStartDate).toISOString().slice(0, 16) : ''} 
                      />
                  </div>

                  <div className="form-group">
                      <label htmlFor="saleEndDate">Fin de venta</label>
                      <input 
                        type="datetime-local" 
                        id="saleEndDate" 
                        name="saleEndDate" 
                        defaultValue={initialData?.saleEndDate ? new Date(initialData.saleEndDate).toISOString().slice(0, 16) : ''} 
                      />
                  </div>
                </div>
              )}
            </>
          )}
        </fieldset>

        <button type="submit" className="form-submit" disabled={loading}>
            {isEditMode 
              ? (loading ? 'Actualizando...' : 'Actualizar Evento')
              : (loading ? 'Creando...' : 'Crear Evento')
            }
        </button>

        {errors.length > 0 && (
          <div className="error-messages">
              {errors.map((error, index) => (
              <p key={index}>{error}</p>
              ))}
          </div>
        )}
      </form>
    </div>
  )
}
