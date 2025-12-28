import { useState, useEffect } from 'react'
import { useCreateBeat } from '../../hooks/useCreateBeat'
import { useAuth } from '../../hooks/useAuth'
import { useArtists } from '../../hooks/useArtists'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FileUploader } from '../FileUploader/FileUploader'
import { ImageUploader } from '../ImageUploader/ImageUploader'

export default function BeatForm ({ onSuccess, initialData, isEditMode = false }) {
  const { createBeat, loading, error } = useCreateBeat()
  const { user } = useAuth()
  const { artists: allArtists } = useArtists()
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('basic')
  
  // Cover Image State
  const [coverImageFile, setCoverImageFile] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    key: '',
    genre: '',
    tags: '',
    price: '',
    audioUrl: '',
    coverUrl: '',
    active: true
  })

  // Artist Selector State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArtists, setSelectedArtists] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // License Management State
  const [licenses, setLicenses] = useState([])
  const [showLicenseForm, setShowLicenseForm] = useState(false)
  const [editingLicenseIndex, setEditingLicenseIndex] = useState(null)
  const [stemsUploadMode, setStemsUploadMode] = useState('upload') // 'upload' o 'url'
  const [licenseFormData, setLicenseFormData] = useState({
    name: '',
    price: '',
    description: '',
    formats: [],
    files: {
      mp3Url: '',
      wavUrl: '',
      stemsUrl: ''
    },
    uploadedFiles: {
      mp3: null,
      wav: null,
      stems: null
    },
    terms: {
      usedForRecording: true,
      distributionLimit: 0,
      audioStreams: 0,
      musicVideos: 0,
      forProfitPerformances: false,
      radioBroadcasting: 0
    }
  })

  // Initialize form with initialData if in edit mode
  useEffect(() => {
    if (isEditMode && initialData && allArtists.length > 0) {
      setFormData({
        title: initialData.title || '',
        bpm: initialData.bpm || '',
        key: initialData.key || '',
        genre: initialData.genre || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        price: initialData.price || '',
        audioUrl: initialData.audioUrl || '',
        coverUrl: initialData.coverUrl || '',
        active: initialData.active ?? true
      })

      // Initialize artists/producers if provided
      // The backend may send 'producer' (single) or 'artists' (array)
      let artistsToSelect = []
      
      if (initialData.producer) {
        // If producer is an object with id or _id, find it in allArtists
        if (typeof initialData.producer === 'object' && initialData.producer !== null) {
          const producerId = initialData.producer.id || initialData.producer._id
          // Try matching with both 'id' and '_id' fields in allArtists
          const producer = allArtists.find(a => a.id === producerId || a._id === producerId)
          if (producer) artistsToSelect.push(producer)
        } 
        // If producer is just an ID string
        else if (typeof initialData.producer === 'string') {
          const producer = allArtists.find(a => a.id === initialData.producer || a._id === initialData.producer)
          if (producer) artistsToSelect.push(producer)
        }
      } 
      // Fallback to artists array if available
      else if (initialData.artists && Array.isArray(initialData.artists)) {
        artistsToSelect = initialData.artists.map(artistId => {
          // Handle both ID strings and artist objects
          if (typeof artistId === 'object' && artistId.id) {
            return allArtists.find(a => a.id === artistId.id)
          }
          return allArtists.find(a => a.id === artistId)
        }).filter(Boolean)
      }
      
      if (artistsToSelect.length > 0) {
        setSelectedArtists(artistsToSelect)
      } else {
        setSelectedArtists([])
      }

      // Initialize licenses if provided
      if (initialData.licenses) {
        // Transformar las licencias del backend para incluir uploadedFiles
        const transformedLicenses = initialData.licenses.map(license => {
          const uploadedFiles = {}
          
          // Si hay URL de MP3, crear objeto uploadedFile
          if (license.files?.mp3Url) {
            uploadedFiles.mp3 = {
              secureUrl: license.files.mp3Url,
              originalName: 'MP3 File',
              fileType: 'audio'
            }
          }
          
          // Si hay URL de WAV, crear objeto uploadedFile
          if (license.files?.wavUrl) {
            uploadedFiles.wav = {
              secureUrl: license.files.wavUrl,
              originalName: 'WAV File',
              fileType: 'audio'
            }
          }
          
          // Si hay URL de STEMS, crear objeto uploadedFile
          if (license.files?.stemsUrl) {
            uploadedFiles.stems = {
              secureUrl: license.files.stemsUrl,
              originalName: 'STEMS Archive',
              fileType: 'archive'
            }
          }
          
          return {
            ...license,
            uploadedFiles
          }
        })
        
        setLicenses(transformedLicenses)
      }
    }
  }, [isEditMode, initialData, allArtists])

  // Tab validation helper
  const isTabComplete = (tab) => {
    switch (tab) {
      case 'basic':
        return formData.title.trim() !== '' && selectedArtists.length > 0
      case 'licenses':
        return licenses.length > 0
      case 'settings':
        return true
      default:
        return false
    }
  }

  // Filter artists based on search
  const filteredArtists = allArtists.filter(artist => 
    artist.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedArtists.find(a => a.id === artist.id)
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddArtist = (artist) => {
    // Only allow one producer
    setSelectedArtists([artist])
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleRemoveArtist = (artistId) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== artistId))
  }

  // License Management Functions
  const handleLicenseFormChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('terms.')) {
      const termName = name.split('.')[1]
      setLicenseFormData(prev => ({
        ...prev,
        terms: {
          ...prev.terms,
          [termName]: type === 'checkbox' ? checked : (value === 'unlimited' ? 'unlimited' : Number(value))
        }
      }))
    } else if (name.startsWith('files.')) {
      const fileName = name.split('.')[1]
      setLicenseFormData(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [fileName]: value
        }
      }))
    } else {
      setLicenseFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }))
    }
  }

  const handleFormatToggle = (format) => {
    setLicenseFormData(prev => {
      const formats = prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
      return { ...prev, formats }
    })
  }

  // Manejadores de subida de archivos
  const handleFileUploadSuccess = (fileType, uploadedFileData) => {
    setLicenseFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [`${fileType}Url`]: uploadedFileData.secureUrl
      },
      uploadedFiles: {
        ...prev.uploadedFiles,
        [fileType]: uploadedFileData
      }
    }))
  }

  const handleAddLicense = () => {
    if (!licenseFormData.name.trim() || !licenseFormData.price) {
      alert('Por favor completa el nombre y precio de la licencia')
      return
    }

    if (licenseFormData.formats.length === 0) {
      alert('Por favor selecciona al menos un formato')
      return
    }

    const newLicense = {
      id: editingLicenseIndex !== null ? licenses[editingLicenseIndex].id : `license-${Date.now()}`,
      ...licenseFormData,
      price: Number(licenseFormData.price)
    }
console.log('💾 Guardando licencia:', newLicense)
    console.log('📁 uploadedFiles en licencia:', newLicense.uploadedFiles)

    
    if (editingLicenseIndex !== null) {
      const updatedLicenses = [...licenses]
      updatedLicenses[editingLicenseIndex] = newLicense
      setLicenses(updatedLicenses)
      setEditingLicenseIndex(null)
    } else {
      setLicenses([...licenses, newLicense])
    }

    // Reset form
    setStemsUploadMode('upload')
    setLicenseFormData({
      name: '',
      price: '',
      description: '',
      formats: [],
      files: {
        mp3Url: '',
        wavUrl: '',
        stemsUrl: ''
      },
      uploadedFiles: {
        mp3: null,
        wav: null,
        stems: null
      },
      terms: {
        usedForRecording: true,
        distributionLimit: 0,
        audioStreams: 0,
        musicVideos: 0,
        forProfitPerformances: false,
        radioBroadcasting: 0
      }
    })
    setShowLicenseForm(false)
  }

  const handleEditLicense = (index) => {
    const license = licenses[index]
    setLicenseFormData({
      ...license,
      files: license.files || {
        mp3Url: '',
        wavUrl: '',
        stemsUrl: ''
      },
      uploadedFiles: license.uploadedFiles || {
        mp3: null,
        wav: null,
        stems: null
      }
    })
    setEditingLicenseIndex(index)
    setShowLicenseForm(true)
  }

  const handleRemoveLicense = (index) => {
    setLicenses(licenses.filter((_, i) => i !== index))
  }

  const handleCancelLicenseForm = () => {
    setShowLicenseForm(false)
    setEditingLicenseIndex(null)
    setStemsUploadMode('upload')
    setLicenseFormData({
      name: '',
      price: '',
      description: '',
      formats: [],
      files: {
        mp3Url: '',
        wavUrl: '',
        stemsUrl: ''
      },
      uploadedFiles: {
        mp3: null,
        wav: null,
        stems: null
      },
      terms: {
        usedForRecording: true,
        distributionLimit: 0,
        audioStreams: 0,
        musicVideos: 0,
        forProfitPerformances: false,
        radioBroadcasting: 0
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data
    const tagsArray = formData.tags 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t) 
        : []

    const payload = {
      ...formData,
      bpm: formData.bpm ? Number(formData.bpm) : undefined,
      price: Number(formData.price),
      tags: tagsArray,
      // Backend expects 'producer' (singular) not 'artists' (plural)
      producer: selectedArtists.length > 0 ? selectedArtists[0].id : null,
      licenses: licenses // Add licenses to payload
    }

    try {
      if (isEditMode) {
        // In edit mode, call onSuccess directly with the payload
        // The EditModal will handle the update via useUpdate hook
        if (onSuccess) {
          await onSuccess(payload, coverImageFile)
        }
      } else {
        // In create mode, use the createBeat hook
        await createBeat(payload, coverImageFile)
        if (onSuccess) {
          onSuccess('Beat creado correctamente')
        }
        // Reset form
        setFormData({
          title: '',
          bpm: '',
          key: '',
          genre: '',
          tags: '',
          price: '',
          audioUrl: '',
          coverUrl: '',
          active: true
        })
        setSelectedArtists([])
        setLicenses([])
        setCoverImageFile(null)
      }
    } catch (err) {
      // Error handled by hook state
    }
  }

  return (
    <form onSubmit={handleSubmit} className="createCardModal__form" style={{gridTemplateColumns: 'repeat(1, 1fr)'}}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #333',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          style={{
            background: activeTab === 'basic' ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'basic' ? '2px solid #ff003c' : '2px solid transparent',
            color: activeTab === 'basic' ? '#ff003c' : '#888',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            position: 'relative',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FontAwesomeIcon icon={['fas', 'music']} />
          Información Básica
          {isTabComplete('basic') && (
            <FontAwesomeIcon icon={['fas', 'check-circle']} style={{ color: '#22c55e', fontSize: '0.875rem' }} />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          style={{
            background: activeTab === 'licenses' ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'licenses' ? '2px solid #ff003c' : '2px solid transparent',
            color: activeTab === 'licenses' ? '#ff003c' : '#888',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FontAwesomeIcon icon={['fas', 'shopping-cart']} />
          Licencias
          {isTabComplete('licenses') && (
            <FontAwesomeIcon icon={['fas', 'check-circle']} style={{ color: '#22c55e', fontSize: '0.875rem' }} />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            background: activeTab === 'settings' ? 'rgba(255, 0, 60, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '2px solid #ff003c' : '2px solid transparent',
            color: activeTab === 'settings' ? '#ff003c' : '#888',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FontAwesomeIcon icon={['fas', 'info-circle']} />
          Configuración
          {isTabComplete('settings') && (
            <FontAwesomeIcon icon={['fas', 'check-circle']} style={{ color: '#22c55e', fontSize: '0.875rem' }} />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>
            <FontAwesomeIcon icon={['fas', 'music']} style={{ marginRight: '0.5rem', color: '#ff003c' }} />
            Información del Beat
          </h3>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <ImageUploader
              label="Imagen de portada"
              onChange={setCoverImageFile}
              currentImageUrl={formData.coverUrl}
              selectedFile={coverImageFile}
            />
          </div>

          <div className="form-group">
            <label>Título del Beat <span style={{ color: '#ff003c' }}>*</span></label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              maxLength={60}
              placeholder="Ej: Dark Trap Beat 2025"
              style={{ fontSize: '1rem' }}
            />
            <small style={{ color: '#888', fontSize: '0.75rem' }}>Máximo 60 caracteres</small>
          </div>

          <div className="form-group">
            <label>Productor <span style={{ color: '#ff003c' }}>*</span></label>
            {isEditMode && selectedArtists.length === 0 && (
              <p style={{ 
                color: '#f59e0b', 
                fontSize: '0.875rem', 
                margin: '0.5rem 0',
                fontStyle: 'italic' 
              }}>
                Este beat no tiene productor asignado. Selecciona uno para actualizar.
              </p>
            )}
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder={selectedArtists.length > 0 ? "Productor seleccionado (haz click en la X para cambiar)" : "Buscar productor..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={selectedArtists.length > 0}
              />
              
              {showDropdown && searchQuery && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {filteredArtists.length > 0 ? (
                    filteredArtists.map(artist => (
                      <div 
                        key={artist.id}
                        onClick={() => handleAddArtist(artist)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #333',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#333'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{artist.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{artist.subtitle || artist.genre}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>No se encontraron artistas</div>
                  )}
                </div>
              )}
            </div>

            {selectedArtists.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {selectedArtists.map(artist => (
                  <span key={artist.id} className="discount-tag" style={{
                    background: 'rgba(255, 0, 60, 0.15)',
                    border: '1px solid rgba(255, 0, 60, 0.3)',
                    color: '#ff003c',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {artist.title}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveArtist(artist.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff003c',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: 0,
                        lineHeight: 1
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>BPM (Tempo)</label>
              <input 
                type="number" 
                name="bpm" 
                value={formData.bpm} 
                onChange={handleChange} 
                max={300}
                placeholder="140"
              />
            </div>
            <div className="form-group">
              <label>Tonalidad (Key)</label>
              <input 
                name="key" 
                value={formData.key} 
                onChange={handleChange} 
                placeholder="Am, C Major"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Género Musical</label>
            <input 
              name="genre" 
              value={formData.genre} 
              onChange={handleChange}
              placeholder="Trap, Hip Hop, R&B..."
            />
          </div>

          <div className="form-group">
            <label>Etiquetas (Tags)</label>
            <input 
              name="tags" 
              value={formData.tags} 
              onChange={handleChange} 
              placeholder="trap, dark, piano, aggressive"
            />
            <small style={{ color: '#888', fontSize: '0.75rem' }}>Separa las etiquetas con comas</small>
          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#22c55e',
            fontSize: '0.875rem'
          }}>
            <FontAwesomeIcon icon={['fas', 'info-circle']} />
            <span>Completa todos los campos para crear un beat profesional</span>
          </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>
              <FontAwesomeIcon icon={['fas', 'shopping-cart']} style={{ marginRight: '0.5rem', color: '#ff003c' }} />
              Gestión de Licencias
            </h3>
            <button 
              type="button" 
              onClick={() => setShowLicenseForm(!showLicenseForm)}
              style={{
                background: showLicenseForm ? '#666' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <FontAwesomeIcon icon={['fas', showLicenseForm ? 'times' : 'plus']} />
              {showLicenseForm ? 'Cancelar' : 'Nueva Licencia'}
            </button>
          </div>

          {licenses.length === 0 && !showLicenseForm && (
            <div style={{
              padding: '3rem 2rem',
              background: '#1a1a1a',
              border: '2px dashed #333',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#888'
            }}>
              <FontAwesomeIcon icon={['fas', 'shopping-cart']} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>No hay licencias creadas</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Crea al menos una licencia para que los usuarios puedan comprar tu beat
              </p>
            </div>
          )}

          {/* License Form */}
          {showLicenseForm && (
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
              border: '1px solid #ff003c',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(255, 0, 60, 0.2)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#ff003c' }}>
                <FontAwesomeIcon icon={['fas', editingLicenseIndex !== null ? 'edit' : 'plus']} style={{ marginRight: '0.5rem' }} />
                {editingLicenseIndex !== null ? 'Editar Licencia' : 'Nueva Licencia'}
              </h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la Licencia <span style={{ color: '#ff003c' }}>*</span></label>
                  <input 
                    name="name"
                    value={licenseFormData.name}
                    onChange={handleLicenseFormChange}
                    placeholder="Ej: Basic License"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio <span style={{ color: '#ff003c' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      name="price"
                      value={licenseFormData.price}
                      onChange={handleLicenseFormChange}
                      min="0"
                      step="0.01"
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <span style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#ff003c',
                      fontWeight: 'bold'
                    }}>€</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input 
                  name="description"
                  value={licenseFormData.description}
                  onChange={handleLicenseFormChange}
                  placeholder="Breve descripción de la licencia"
                />
              </div>

              <div className="form-group">
                <label>Formatos Incluidos <span style={{ color: '#ff003c' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {['MP3', 'WAV', 'STEMS'].map(format => (
                    <label key={format} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '1rem',
                      background: licenseFormData.formats.includes(format) ? 'rgba(255, 0, 60, 0.2)' : '#0e0e0e',
                      border: `2px solid ${licenseFormData.formats.includes(format) ? '#ff003c' : '#333'}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      justifyContent: 'center'
                    }}>
                      <input 
                        type="checkbox"
                        checked={licenseFormData.formats.includes(format)}
                        onChange={() => handleFormatToggle(format)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Archivos de la licencia */}
              <div style={{ 
                background: '#0a0a0a', 
                padding: '1.5rem', 
                borderRadius: '8px',
                marginTop: '1.5rem',
                border: '1px solid #333'
              }}>
                <h5 style={{ 
                  marginTop: 0, 
                  marginBottom: '1.5rem', 
                  fontSize: '0.95rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  color: '#ff003c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FontAwesomeIcon icon={['fas', 'file-audio']} />
                  Archivos de Descarga
                </h5>

                {licenseFormData.formats.includes('MP3') && (
                  <div className="form-group">
                    <FileUploader
                      fileType="audio"
                      accept=".mp3"
                      label="Archivo MP3"
                      onUploadSuccess={(fileData) => handleFileUploadSuccess('mp3', fileData)}
                      existingFile={licenseFormData.uploadedFiles?.mp3}
                      metadata={{
                        description: `${licenseFormData.name} - MP3`,
                        tags: ['beat', 'mp3', 'license'],
                        isPublic: false
                      }}
                    />
                    <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                      Archivo MP3 de alta calidad (320kbps recomendado)
                    </small>
                  </div>
                )}

                {licenseFormData.formats.includes('WAV') && (
                  <div className="form-group">
                    <FileUploader
                      fileType="audio"
                      accept=".wav"
                      label="Archivo WAV"
                      onUploadSuccess={(fileData) => handleFileUploadSuccess('wav', fileData)}
                      existingFile={licenseFormData.uploadedFiles?.wav}
                      metadata={{
                        description: `${licenseFormData.name} - WAV`,
                        tags: ['beat', 'wav', 'license'],
                        isPublic: false
                      }}
                    />
                    <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                      Archivo WAV sin comprimir (44.1kHz/16bit mínimo)
                    </small>
                  </div>
                )}

                {licenseFormData.formats.includes('STEMS') && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FontAwesomeIcon icon={['fas', 'folder']} style={{ color: '#888' }} />
                      Archivo STEMS (ZIP)
                    </label>
                    
                    {/* Toggle entre subir archivo o ingresar URL */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      marginBottom: '1rem',
                      background: '#0a0a0a',
                      padding: '0.5rem',
                      borderRadius: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={() => setStemsUploadMode('upload')}
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem',
                          background: stemsUploadMode === 'upload' ? '#ff003c' : 'transparent',
                          color: stemsUploadMode === 'upload' ? '#fff' : '#999',
                          border: stemsUploadMode === 'upload' ? 'none' : '1px solid #333',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FontAwesomeIcon icon="upload" style={{ marginRight: '0.5rem' }} />
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setStemsUploadMode('url')}
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem',
                          background: stemsUploadMode === 'url' ? '#ff003c' : 'transparent',
                          color: stemsUploadMode === 'url' ? '#fff' : '#999',
                          border: stemsUploadMode === 'url' ? 'none' : '1px solid #333',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FontAwesomeIcon icon="link" style={{ marginRight: '0.5rem' }} />
                        Ingresar URL
                      </button>
                    </div>

                    {stemsUploadMode === 'upload' ? (
                      <>
                        <FileUploader
                          fileType="archive"
                          accept=".zip,.rar,.7z"
                          label=""
                          onUploadSuccess={(fileData) => handleFileUploadSuccess('stems', fileData)}
                          existingFile={licenseFormData.uploadedFiles?.stems}
                          metadata={{
                            description: `${licenseFormData.name} - STEMS`,
                            tags: ['beat', 'stems', 'license'],
                            isPublic: false
                          }}
                        />
                        <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                          Archivo ZIP con todos los stems/pistas separadas (máx. 500MB)
                        </small>
                      </>
                    ) : (
                      <>
                        <input 
                          type="url"
                          name="files.stemsUrl"
                          value={licenseFormData.files.stemsUrl}
                          onChange={handleLicenseFormChange}
                          placeholder="https://storage.example.com/beat-stems.zip"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#1a1a1a',
                            border: '2px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem'
                          }}
                        />
                        <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                          URL directa al archivo ZIP con los stems
                        </small>
                      </>
                    )}
                  </div>
                )}

                {licenseFormData.formats.length === 0 && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    color: '#f59e0b',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FontAwesomeIcon icon={['fas', 'info-circle']} />
                    Selecciona al menos un formato para agregar los archivos correspondientes
                  </div>
                )}
              </div>

              <div style={{ 
                background: '#0a0a0a', 
                padding: '1.5rem', 
                borderRadius: '8px',
                marginTop: '1.5rem',
                border: '1px solid #333'
              }}>
                <h5 style={{ 
                  marginTop: 0, 
                  marginBottom: '1.5rem', 
                  fontSize: '0.95rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  color: '#ff003c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FontAwesomeIcon icon={['fas', 'info-circle']} />
                  Términos de Uso
                </h5>

                <div className="form-group">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    background: licenseFormData.terms.usedForRecording ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    border: `1px solid ${licenseFormData.terms.usedForRecording ? '#22c55e' : '#333'}`,
                    borderRadius: '6px'
                  }}>
                    <input 
                      type="checkbox"
                      name="terms.usedForRecording"
                      checked={licenseFormData.terms.usedForRecording}
                      onChange={handleLicenseFormChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <FontAwesomeIcon icon={['fas', 'music']} style={{ color: '#22c55e' }} />
                    Permitido para grabación musical
                  </label>
                </div>

                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'compact-disc']} style={{ marginRight: '0.5rem', color: '#888' }} />
                      Límite de distribución (copias)
                    </label>
                    <input 
                      type="number"
                      name="terms.distributionLimit"
                      value={licenseFormData.terms.distributionLimit === 'unlimited' ? '' : licenseFormData.terms.distributionLimit}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'headphones']} style={{ marginRight: '0.5rem', color: '#888' }} />
                      Reproducciones online (streams)
                    </label>
                    <input 
                      type="number"
                      name="terms.audioStreams"
                      value={licenseFormData.terms.audioStreams === 'unlimited' ? '' : licenseFormData.terms.audioStreams}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'video']} style={{ marginRight: '0.5rem', color: '#888' }} />
                      Vídeos musicales
                    </label>
                    <input 
                      type="number"
                      name="terms.musicVideos"
                      value={licenseFormData.terms.musicVideos === 'unlimited' ? '' : licenseFormData.terms.musicVideos}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'radio']} style={{ marginRight: '0.5rem', color: '#888' }} />
                      Emisoras de radio
                    </label>
                    <input 
                      type="number"
                      name="terms.radioBroadcasting"
                      value={licenseFormData.terms.radioBroadcasting === 'unlimited' ? '' : licenseFormData.terms.radioBroadcasting}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    background: licenseFormData.terms.forProfitPerformances ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    border: `1px solid ${licenseFormData.terms.forProfitPerformances ? '#22c55e' : '#333'}`,
                    borderRadius: '6px'
                  }}>
                    <input 
                      type="checkbox"
                      name="terms.forProfitPerformances"
                      checked={licenseFormData.terms.forProfitPerformances}
                      onChange={handleLicenseFormChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <FontAwesomeIcon icon={['fas', 'music']} style={{ color: '#22c55e' }} />
                    Actuaciones con ánimo de lucro permitidas
                  </label>
                </div>

                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '1rem' }}>
                  💡 Tip: Usar 0 en los límites numéricos significa "ilimitado"
                </small>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button"
                  onClick={handleAddLicense}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={['fas', editingLicenseIndex !== null ? 'save' : 'plus']} />
                  {editingLicenseIndex !== null ? 'Guardar Cambios' : 'Agregar Licencia'}
                </button>
                <button 
                  type="button"
                  onClick={handleCancelLicenseForm}
                  style={{
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Display Added Licenses */}
          {licenses.length > 0 && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {licenses.map((license, index) => (
                <div 
                  key={license.id}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff003c'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 0, 60, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{license.name}</h4>
                      <span style={{ 
                        color: '#ff003c', 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem'
                      }}>
                        {license.price.toFixed(2)}
                        <span style={{ fontSize: '1rem' }}>€</span>
                      </span>
                    </div>
                    {license.description && (
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#999' }}>{license.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {license.formats.map(format => (
                        <span 
                          key={format}
                          style={{
                            background: 'rgba(255, 0, 60, 0.15)',
                            border: '1px solid rgba(255, 0, 60, 0.3)',
                            color: '#ff003c',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <FontAwesomeIcon icon={['fas', 'file-audio']} />
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.5rem' }}>
                    <button 
                      type="button"
                      onClick={() => handleEditLicense(index)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #666',
                        color: '#fff',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      title="Editar licencia"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff003c'
                        e.currentTarget.style.borderColor = '#ff003c'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.borderColor = '#666'
                      }}
                    >
                      <FontAwesomeIcon icon={['fas', 'edit']} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRemoveLicense(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      title="Eliminar licencia"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.currentTarget.style.color = '#ef4444'
                      }}
                    >
                      <FontAwesomeIcon icon={['fas', 'trash']} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {licenses.length > 0 && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(34, 197, 94, 0.1)', 
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#22c55e',
              fontSize: '0.875rem'
            }}>
              <FontAwesomeIcon icon={['fas', 'check-circle']} />
              <span><strong>{licenses.length}</strong> licencia{licenses.length !== 1 ? 's' : ''} configurada{licenses.length !== 1 ? 's' : ''} correctamente</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>
            <FontAwesomeIcon icon={['fas', 'info-circle']} style={{ marginRight: '0.5rem', color: '#ff003c' }} />
            Configuración Final
          </h3>

          <div className="form-group">
            <label>Precio Base del Beat <span style={{ color: '#ff003c' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min={0}
                step="0.01"
                placeholder="29.99"
                style={{ paddingRight: '2.5rem', fontSize: '1.1rem' }}
              />
              <span style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ff003c',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>€</span>
            </div>
            <small style={{ color: '#888', fontSize: '0.75rem' }}>
              Este es el precio de referencia (las licencias pueden tener precios diferentes)
            </small>
          </div>

          <div className="form-group">
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer',
              padding: '1rem',
              background: formData.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${formData.active ? '#22c55e' : '#ef4444'}`,
              borderRadius: '8px'
            }}>
              <input 
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                style={{ width: '20px', height: '20px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
                  {formData.active ? 'Beat Activo' : 'Beat Inactivo'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#888' }}>
                  {formData.active 
                    ? 'El beat será visible y disponible para compra' 
                    : 'El beat estará oculto y no podrá ser comprado'}
                </div>
              </div>
              <FontAwesomeIcon 
                icon={['fas', formData.active ? 'check-circle' : 'times']} 
                style={{ fontSize: '1.5rem', color: formData.active ? '#22c55e' : '#ef4444' }}
              />
            </label>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)', 
            border: '1px solid #333',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1rem' }}>
              <FontAwesomeIcon icon={['fas', 'check-circle']} style={{ marginRight: '0.5rem', color: '#22c55e' }} />
              Resumen del Beat
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                <span style={{ color: '#888' }}>Título:</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{formData.title || 'Sin título'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                <span style={{ color: '#888' }}>Artistas:</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{selectedArtists.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                <span style={{ color: '#888' }}>Licencias:</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{licenses.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                <span style={{ color: '#888' }}>Archivos de licencias:</span>
                <span style={{ color: licenses.length > 0 ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                  {licenses.length > 0 ? '✓ Configurado' : '✗ Falta'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#888' }}>Estado:</span>
                <span style={{ color: formData.active ? '#22c55e' : '#888', fontWeight: '600' }}>
                  {formData.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FontAwesomeIcon icon={['fas', 'info-circle']} />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem 0',
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end'
      }}>
        <button 
          type="submit" 
          className="form-submit" 
          disabled={loading}
          style={{
            background: loading ? '#666' : 'linear-gradient(135deg, #ff003c 0%, #cc0030 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(255, 0, 60, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={['fas', 'spinner']} spin />
              {isEditMode ? 'Actualizando Beat...' : 'Creando Beat...'}
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={['fas', 'save']} />
              {isEditMode ? 'Actualizar Beat' : 'Crear Beat'}
            </>
          )}
        </button>
      </div>

      {/* Click outside listener */}
      {showDropdown && <div 
        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
        onClick={() => setShowDropdown(false)}
      />}

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  )
}
