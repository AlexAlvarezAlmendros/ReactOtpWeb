import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useReleases } from '../../hooks/useReleases.js'
import { useEvents } from '../../hooks/useEvents.js'
import { useBeats } from '../../hooks/useBeats.js'

export default function NewsletterForm ({ onSuccess, initialData = null, isEditMode = false }) {
  const { user } = useAuth()
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Search states
  const [beatSearch, setBeatSearch] = useState('')
  const [releaseSearch, setReleaseSearch] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  
  // Data hooks
  const { beats } = useBeats({ title: beatSearch, count: 50, sortBy: 'createdAt', sortOrder: 'desc' })
  const { releases: releasesList } = useReleases({ 
    title: releaseSearch, 
    count: 100, 
    sortBy: 'date', 
    sortOrder: 'desc' 
  })
  const { events } = useEvents({ title: eventSearch, count: 50, sortBy: 'date', sortOrder: 'desc' })
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    status: 'draft'
  })
  
  // Selected content
  const [selectedBeats, setSelectedBeats] = useState([])
  const [selectedReleases, setSelectedReleases] = useState([])
  const [selectedEvents, setSelectedEvents] = useState([])
  
  // Discounts
  const [discountForm, setDiscountForm] = useState({ code: '', amount: '', description: '' })
  const [discounts, setDiscounts] = useState([])
  
  // Flags para evitar bucles
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData && !isInitialized) {
      console.log('📧 DEBUG - Campos disponibles:', Object.keys(initialData))
      console.log('📧 DEBUG - slug:', initialData.slug)
      console.log('📧 DEBUG - scheduledAt:', initialData.scheduledAt)
      console.log('📧 DEBUG - sentAt:', initialData.sentAt)
      console.log('📧 DEBUG - createdAt:', initialData.createdAt)
      
      // Formatear scheduledAt para datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedScheduledAt = ''
      
      // Probar múltiples campos de fecha
      const dateField = initialData.scheduledAt || initialData.sentAt || initialData.createdAt
      
      if (dateField) {
        const date = new Date(dateField)
        if (!isNaN(date.getTime())) {
          formattedScheduledAt = date.toISOString().slice(0, 16)
        }
      }
      
      const newFormData = {
        title: initialData.title || '',
        scheduledAt: formattedScheduledAt,
        status: initialData.status || 'draft'
      }
      
      console.log('📧 DEBUG - newFormData:', newFormData)
      
      setFormData(newFormData)
      
      // Inicializar discounts si existen, mapeando discountAmount a amount
      if (initialData.content?.discounts) {
        const mappedDiscounts = initialData.content.discounts.map(d => ({
          ...d,
          id: d._id,
          amount: d.discountAmount || d.amount
        }))
        setDiscounts(mappedDiscounts)
      }
      
      setIsInitialized(true)
    }
  }, [initialData, isInitialized])
  
  // Sincronizar selecciones cuando cambien las listas y haya initialData
  useEffect(() => {
    if (initialData?.content && beats.length > 0 && selectedBeats.length === 0) {
      const contentBeats = initialData.content.uniqueBeats || []
      const beatIds = Array.isArray(contentBeats) ? contentBeats : []
      
      const selected = beats.filter(beat => 
        beatIds.includes(beat.id) || beatIds.includes(beat._id)
      ).map(beat => ({ ...beat, id: beat.id || beat._id }))
      
      if (selected.length > 0) {
        setSelectedBeats(selected)
      }
    }
  }, [initialData, beats, selectedBeats.length])
  
  useEffect(() => {
    if (initialData?.content && releasesList.length > 0 && selectedReleases.length === 0) {
      const contentReleases = initialData.content.upcomingReleases || []
      
      // Extraer IDs, manejando tanto arrays de IDs como arrays de objetos
      let releaseIds = []
      if (Array.isArray(contentReleases)) {
        releaseIds = contentReleases.map(item => {
          if (typeof item === 'string') return item
          if (typeof item === 'object' && item !== null) return item.id || item._id
          return item
        }).filter(Boolean)
      }
      
      const selected = releasesList.filter(release => 
        releaseIds.includes(release.id) || releaseIds.includes(release._id)
      )
      
      if (selected.length > 0) {
        setSelectedReleases(selected)
      }
    }
  }, [initialData, releasesList, selectedReleases.length])
  
  useEffect(() => {
    if (initialData?.content && events.length > 0 && selectedEvents.length === 0) {
      const contentEvents = initialData.content.events || []
      const eventIds = Array.isArray(contentEvents) ? contentEvents : []
      
      const selected = events.filter(event => 
        eventIds.includes(event.id)
      )
      
      if (selected.length > 0) {
        setSelectedEvents(selected)
      }
    }
  }, [initialData, events, selectedEvents.length])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])
  
  const toggleSelection = (item, list, setList) => {
    const isSelected = list.find(i => i.id === item.id)
    if (isSelected) {
      setList(list.filter(i => i.id !== item.id))
    } else {
      setList([...list, item])
    }
  }
  
  const addDiscount = (e) => {
    e.preventDefault()
    if (!discountForm.code || !discountForm.amount) return
    setDiscounts([...discounts, { ...discountForm, id: Date.now() }])
    setDiscountForm({ code: '', amount: '', description: '' })
  }
  
  const removeDiscount = (id) => {
    setDiscounts(discounts.filter(d => (d.id || d._id) !== id))
  }

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    
    const validationErrors = []

    // Validación del título
    if (!formData.title || formData.title.trim() === '') {
      validationErrors.push('El título es obligatorio')
    } else if (formData.title.length > 200) {
      validationErrors.push('El título no puede tener más de 200 caracteres')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setLoading(true)

    try {
      const payload = {
        ...formData,
        content: {
          beats: selectedBeats.map(b => b.id),
          releases: selectedReleases.map(r => r.id),
          events: selectedEvents.map(e => e.id),
          discounts
        }
      }
      
      await onSuccess(payload)
    } catch (error) {
      console.error('Error al guardar newsletter:', error)
      setErrors([error.message || 'Error al guardar la newsletter'])
    } finally {
      setLoading(false)
    }
  }, [formData, selectedBeats, selectedReleases, selectedEvents, discounts, onSuccess])

  const handleReset = useCallback(() => {
    setFormData({
      title: '',
      scheduledAt: '',
      status: 'draft'
    })
    setSelectedBeats([])
    setSelectedReleases([])
    setSelectedEvents([])
    setDiscounts([])
    setErrors([])
    setIsInitialized(false)
  }, [])

  return (
    <form className='form' onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className='form-errors'>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Configuración General */}
      <div className='form-section'>
        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.2rem' }}>Configuración General</h3>
        
        {/* Título */}
        <div className='form-group'>
          <label htmlFor='title'>
            Título del Asunto <span className='required'>*</span>
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            placeholder='Ej: Lanzamientos de Noviembre'
            required
            maxLength={200}
          />
          <small className='form-hint'>
            Título que verán los suscriptores en el email (máx. 200 caracteres)
          </small>
        </div>

        {/* Fecha de envío */}
        <div className='form-group'>
          <label htmlFor='scheduledAt'>
            Fecha de Envío
          </label>
          <input
            type='datetime-local'
            id='scheduledAt'
            name='scheduledAt'
            value={formData.scheduledAt}
            onChange={handleInputChange}
          />
          <small className='form-hint'>
            Si no se especifica, se guardará como borrador
          </small>
        </div>

        {/* Estado */}
        <div className='form-group'>
          <label htmlFor='status'>
            Estado <span className='required'>*</span>
          </label>
          <select
            id='status'
            name='status'
            value={formData.status}
            onChange={handleInputChange}
            required
          >
            <option value='draft'>Borrador</option>
            <option value='scheduled'>Programado</option>
            <option value='sent'>Enviado</option>
          </select>
          <small className='form-hint'>
            Estado actual de la newsletter
          </small>
        </div>
      </div>

      {/* Seleccionar Beats */}
      <div className='form-section' style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 0 }}>Beats Destacados</h3>
          <input 
            type='text' 
            placeholder='Buscar beats...' 
            value={beatSearch}
            onChange={(e) => setBeatSearch(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: 'none', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              maxWidth: '200px'
            }}
          />
        </div>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          {beats.map(beat => (
            <div 
              key={beat.id || beat._id} 
              onClick={() => toggleSelection({ ...beat, id: beat.id || beat._id }, selectedBeats, setSelectedBeats)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderRadius: '4px',
                background: selectedBeats.find(b => b.id === (beat.id || beat._id)) ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
                border: selectedBeats.find(b => b.id === (beat.id || beat._id)) ? '1px solid rgba(255, 0, 60, 0.5)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={beat.img || beat.coverUrl} alt={beat.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 500 }}>{beat.title}</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{beat.bpm ? `${beat.bpm} BPM` : 'N/A'}</div>
              </div>
              {selectedBeats.find(b => b.id === (beat.id || beat._id)) && (
                <FontAwesomeIcon icon='check-circle' style={{ color: '#ff003c' }} />
              )}
            </div>
          ))}
        </div>
        <small className='form-hint' style={{ display: 'block', marginTop: '0.5rem' }}>
          Seleccionados: {selectedBeats.length}
        </small>
      </div>

      {/* Seleccionar Releases */}
      <div className='form-section' style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 0 }}>Novedades (Canciones)</h3>
          <input 
            type='text' 
            placeholder='Buscar releases...' 
            value={releaseSearch}
            onChange={(e) => setReleaseSearch(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: 'none', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              maxWidth: '200px'
            }}
          />
        </div>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          {releasesList.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleSelection(item, selectedReleases, setSelectedReleases)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderRadius: '4px',
                background: selectedReleases.find(r => r.id === item.id) ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
                border: selectedReleases.find(r => r.id === item.id) ? '1px solid rgba(255, 0, 60, 0.5)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={item.img} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{item.artist || item.subtitle}</div>
              </div>
              {selectedReleases.find(r => r.id === item.id) && (
                <FontAwesomeIcon icon='check-circle' style={{ color: '#ff003c' }} />
              )}
            </div>
          ))}
        </div>
        <small className='form-hint' style={{ display: 'block', marginTop: '0.5rem' }}>
          Seleccionados: {selectedReleases.length}
        </small>
      </div>

      {/* Seleccionar Eventos */}
      <div className='form-section' style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 0 }}>Eventos</h3>
          <input 
            type='text' 
            placeholder='Buscar eventos...' 
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: 'none', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              maxWidth: '200px'
            }}
          />
        </div>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          {events.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleSelection(item, selectedEvents, setSelectedEvents)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                cursor: 'pointer',
                borderRadius: '4px',
                background: selectedEvents.find(e => e.id === item.id) ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
                border: selectedEvents.find(e => e.id === item.id) ? '1px solid rgba(255, 0, 60, 0.5)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={item.img} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  {item.date ? new Date(item.date).toLocaleDateString() : 'Fecha por determinar'}
                </div>
              </div>
              {selectedEvents.find(e => e.id === item.id) && (
                <FontAwesomeIcon icon='check-circle' style={{ color: '#ff003c' }} />
              )}
            </div>
          ))}
        </div>
        <small className='form-hint' style={{ display: 'block', marginTop: '0.5rem' }}>
          Seleccionados: {selectedEvents.length}
        </small>
      </div>

      {/* Códigos de Descuento */}
      <div className='form-section' style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Códigos de Descuento</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input 
              type='text'
              placeholder='Código (ej: NOV20)'
              value={discountForm.code}
              onChange={e => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
              style={{ 
                flex: '1 1 120px',
                minWidth: '100px',
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: 'none', 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white'
              }}
            />
            <input 
              type='text'
              placeholder='Descuento (ej: 20%)'
              value={discountForm.amount}
              onChange={e => setDiscountForm({...discountForm, amount: e.target.value})}
              style={{ 
                flex: '1 1 120px',
                minWidth: '100px',
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: 'none', 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type='text'
              placeholder='Descripción'
              value={discountForm.description}
              onChange={e => setDiscountForm({...discountForm, description: e.target.value})}
              style={{ 
                flex: 1,
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: 'none', 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white'
              }}
            />
            <button 
              type='button'
              onClick={addDiscount}
              style={{ 
                padding: '0.5rem 1.5rem', 
                borderRadius: '4px', 
                border: 'none', 
                background: '#ff003c', 
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              <FontAwesomeIcon icon='plus' style={{ marginRight: '0.25rem' }} />
              Añadir
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {discounts.map((d, index) => (
            <div 
              key={d.id || d._id || `discount-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 0, 60, 0.2)',
                border: '1px solid rgba(255, 0, 60, 0.5)',
                borderRadius: '20px',
                color: '#fff'
              }}
            >
              <strong>{d.code}</strong>
              <span style={{ fontSize: '0.9rem' }}>{d.description}</span>
              <span style={{ fontSize: '0.9rem', color: '#ff003c' }}>{d.amount}</span>
              <button 
                onClick={() => removeDiscount(d.id || d._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0 0.25rem'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className='form-info'>
          <FontAwesomeIcon icon='info-circle' />
          <span>
            {isEditMode ? 'Actualizando' : 'Creando'} como: {user.name || user.email}
          </span>
        </div>
      )}

      {/* Botones de acción */}
      <div className='form-actions'>
        {!isEditMode && (
          <button
            type='button'
            onClick={handleReset}
            className='btn-secondary'
            disabled={loading}
          >
            <FontAwesomeIcon icon='undo' />
            Limpiar
          </button>
        )}
        <button
          type='submit'
          className='btn-primary'
          disabled={loading}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon='spinner' spin />
              {isEditMode ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={isEditMode ? 'save' : 'paper-plane'} />
              {isEditMode ? 'Guardar Cambios' : 'Crear Newsletter'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
