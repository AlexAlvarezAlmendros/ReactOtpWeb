import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './NewsletterBuilder.css'

import { useReleases } from '../hooks/useReleases'
import { useEvents } from '../hooks/useEvents'
import { useNewsletters } from '../hooks/useNewsletters'
import { useBeats } from '../hooks/useBeats'
// Lazy load Viewer to avoid circular dependencies/reference errors
const NewsletterViewer = lazy(() => import('./NewsletterViewer'))


// Utility hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Utility function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalizar para separar acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales excepto espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Evitar múltiples guiones consecutivos
}

function NewsletterBuilder () {
  const navigate = useNavigate()
  
  // State for Search
  const [beatSearch, setBeatSearch] = useState('')
  const [releaseSearch, setReleaseSearch] = useState('')
  const [eventSearch, setEventSearch] = useState('')

  // Debounce search terms
  const debouncedBeatSearch = useDebounce(beatSearch, 500)
  const debouncedReleaseSearch = useDebounce(releaseSearch, 500)
  const debouncedEventSearch = useDebounce(eventSearch, 500)

  // Hooks - Now using backend filtering
  const { beats, loading: beatsLoading } = useBeats({ 
    title: debouncedBeatSearch, 
    count: 50, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  })
  
  const { releases: releasesList, loading: releasesLoading } = useReleases({ 
    title: debouncedReleaseSearch, 
    count: 100, 
    sortBy: 'date', 
    sortOrder: 'desc' 
  })
  
  const { events, loading: eventsLoading } = useEvents({ 
    title: debouncedEventSearch, 
    count: 50, 
    sortBy: 'date', 
    sortOrder: 'desc' 
  })
  
  const { createNewsletter, loading: isSaving } = useNewsletters()

  // State
  const [config, setConfig] = useState({
    title: '',
    scheduledAt: '',
    status: 'draft'
  })
  
  const [selectedBeats, setSelectedBeats] = useState([])
  const [selectedReleases, setSelectedReleases] = useState([])
  const [selectedEvents, setSelectedEvents] = useState([])
  
  // Search States

  
  // Discounts
  const [discountForm, setDiscountForm] = useState({ code: '', amount: '', description: '' })
  const [discounts, setDiscounts] = useState([])
  
  const [showPreview, setShowPreview] = useState(false)

  // Handlers
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
    setDiscounts(discounts.filter(d => d.id !== id))
  }

  const handleSave = async (status = 'draft') => {
    try {
        const slug = generateSlug(config.title || `newsletter-${Date.now()}`)
        
        const payload = {
        ...config,
        slug,
        status,
        content: {
            beats: selectedBeats.map(b => b.id),
            releases: selectedReleases.map(r => r.id),
            events: selectedEvents.map(e => e.id),
            discounts
        }
        }
        
        await createNewsletter(payload)
        
        if (status === 'scheduled') {
            alert('Newsletter programada correctamente!')
        } else {
            alert('Borrador guardado!')
        }
        navigate('/crear') // Or manage cards
    } catch (e) {
        alert(e.message)
    }
  }

  return (
    <div className='newsletter-builder'>
      <header className='builder-header'>
        <div>
          <h1>Constructor de Newsletter</h1>
          <p>Diseña y programa tu próximo envío</p>
        </div>
        <div className='builder-actions'>
          <button className='btn-back' onClick={() => navigate('/crear')}>Cancelar</button>
          <button className='btn-preview' onClick={() => setShowPreview(true)}>
             Vista Previa
          </button>
          <button className='btn-save' onClick={() => handleSave('scheduled')} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Programar Envío'}
          </button>
        </div>
      </header>

      <div className='builder-form'>
        {/* 1. Configuración */}
        <section className='form-section'>
          <h2>Configuración General</h2>
          <div className='form-row'>
            <div className='form-group'>
              <label>Título del Asunto</label>
              <input 
                className='form-input'
                placeholder='Ej: Lanzamientos de Noviembre'
                value={config.title}
                onChange={e => setConfig({ ...config, title: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label>Fecha de Envío</label>
              <input 
                type='datetime-local'
                className='form-input'
                value={config.scheduledAt}
                onChange={e => setConfig({ ...config, scheduledAt: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* 2. Beats */}
        <section className='form-section'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ marginBottom: 0 }}>Seleccionar Beats Destacados</h2>
                    <input 
                        type="text" 
                        placeholder="Buscar por título..." 
                        value={beatSearch}
                        onChange={(e) => setBeatSearch(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>
            </div>
          <div className='selection-list'>
            {beatsLoading ? <p>Cargando beats...</p> : beats
                .map(beat => (
              <div 
                key={beat.id || beat._id} 
                className={`selection-item ${selectedBeats.find(b => b.id === (beat.id || beat._id)) ? 'selected' : ''}`}
                onClick={() => toggleSelection({ ...beat, id: beat.id || beat._id }, selectedBeats, setSelectedBeats)}
              >
                <img src={beat.img || beat.coverUrl} alt={beat.title} />
                <div className='selection-info'>
                  <span className='selection-title'>{beat.title}</span>
                  <span className='selection-subtitle'>{beat.bpm ? `${beat.bpm} BPM` : 'N/A'}</span>
                </div>
                {selectedBeats.find(b => b.id === (beat.id || beat._id)) && (
                   <span style={{ color: '#007bff' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Releases */}
        <section className='form-section'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ marginBottom: 0 }}>Seleccionar Novedades (Canciones)</h2>
               <input 
                    type="text" 
                    placeholder="Buscar por título..." 
                    value={releaseSearch}
                    onChange={(e) => setReleaseSearch(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                />
          </div>
          <div className='selection-list'>
            {releasesLoading ? <p>Cargando lanzamientos...</p> : releasesList
                .map(item => (
              <div 
                key={item.id} 
                className={`selection-item ${selectedReleases.find(b => b.id === item.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection(item, selectedReleases, setSelectedReleases)}
              >
                <img src={item.img} alt={item.title} />
                <div className='selection-info'>
                  <span className='selection-title'>{item.title}</span>
                  <span className='selection-subtitle'>{item.artist || item.subtitle}</span>
                </div>
                {selectedReleases.find(b => b.id === item.id) && (
                   <span style={{ color: '#007bff' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Events */}
        <section className='form-section'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ marginBottom: 0 }}>Seleccionar Eventos</h2>
               <input 
                    type="text" 
                    placeholder="Buscar por título..." 
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                />
          </div>
          <div className='selection-list'>
            {eventsLoading ? <p>Cargando eventos...</p> : events
                .map(item => (
              <div 
                key={item.id} 
                className={`selection-item ${selectedEvents.find(b => b.id === item.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection(item, selectedEvents, setSelectedEvents)}
              >
                <img src={item.img} alt={item.title} />
                <div className='selection-info'>
                  <span className='selection-title'>{item.title}</span>
                  <span className='selection-subtitle'>{item.date ? new Date(item.date).toLocaleDateString() : 'Fecha por determinar'}</span>
                </div>
                {selectedEvents.find(b => b.id === item.id) && (
                   <span style={{ color: '#007bff' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. Discounts */}
        <section className='form-section'>
          <h2>Códigos de Descuento</h2>
          <form className='discount-form' onSubmit={addDiscount}>
            <input 
              className='form-input' 
              placeholder='Código (ej: NOV20)'
              value={discountForm.code}
              onChange={e => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
            />
            <input 
              className='form-input' 
              placeholder='Descripción'
              value={discountForm.description}
              onChange={e => setDiscountForm({...discountForm, description: e.target.value})}
            />
             <input 
              className='form-input' 
              placeholder='Descuento (ej: 20%)'
              value={discountForm.amount}
              onChange={e => setDiscountForm({...discountForm, amount: e.target.value})}
            />
            <button type='submit' className='btn-add'>+</button>
          </form>

          <div className='active-discounts'>
            {discounts.map(d => (
                <div key={d.id} className='discount-tag'>
                    <strong>{d.code}</strong>
                    <span>{d.amount}</span>
                    <button onClick={() => removeDiscount(d.id)}>×</button>
                </div>
            ))}
          </div>
        </section>
      </div>

      {showPreview && (
        <div className='preview-overlay'>
          <div className='preview-content'>
            <button className='preview-close' onClick={() => setShowPreview(false)}>×</button>
            <Suspense fallback={<div className="loading-preview">Cargando vista previa...</div>}>
              <NewsletterViewer data={{
                  title: config.title || 'Título de la Newsletter',
                  date: config.scheduledAt || new Date().toISOString(),
                  content: {
                      beats: selectedBeats,
                      releases: selectedReleases,
                      events: selectedEvents,
                      discounts: discounts
                  }
              }} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsletterBuilder
