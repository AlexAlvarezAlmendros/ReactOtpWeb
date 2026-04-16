import { useState, useEffect, useMemo } from 'react'
import { useCreateBeat } from '../../hooks/useCreateBeat'
import { useAuth } from '../../hooks/useAuth'
import { useArtists } from '../../hooks/useArtists'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FileUploader } from '../FileUploader/FileUploader'
import { ImageUploader } from '../ImageUploader/ImageUploader'
import { MUSICAL_KEYS } from '../../utils/beatConstants'
import './BeatForm.css'

// Default license templates
const DEFAULT_LICENSES = [
  {
    id: 'license-basic',
    name: 'Basic',
    price: 24.99,
    description: '',
    formats: ['MP3'],
    fileKeys: ['mp3'],
    terms: {
      usedForRecording: true,
      distributionLimit: 5000,
      audioStreams: 50000,
      musicVideos: 1,
      forProfitPerformances: true,
      radioBroadcasting: 2
    }
  },
  {
    id: 'license-premium',
    name: 'Premium',
    price: 49.99,
    description: '',
    formats: ['MP3', 'WAV'],
    fileKeys: ['mp3', 'wav'],
    terms: {
      usedForRecording: true,
      distributionLimit: 10000,
      audioStreams: 500000,
      musicVideos: 1,
      forProfitPerformances: true,
      radioBroadcasting: 2
    }
  },
  {
    id: 'license-unlimited',
    name: 'Unlimited',
    price: 99.99,
    description: '',
    formats: ['MP3', 'WAV', 'STEMS'],
    fileKeys: [],
    terms: {
      usedForRecording: true,
      distributionLimit: 0,
      audioStreams: 0,
      musicVideos: 0,
      forProfitPerformances: true,
      radioBroadcasting: 0
    }
  }
]

// File type definitions
const FILE_TYPES = [
  { key: 'mp3', label: 'MP3', accept: '.mp3', fileType: 'audio', icon: 'file-audio', iconClass: 'beat-wizard__file-section-icon--mp3' },
  { key: 'wav', label: 'WAV', accept: '.wav', fileType: 'audio', icon: 'file-audio', iconClass: 'beat-wizard__file-section-icon--wav' },
  { key: 'stems', label: 'STEMS (ZIP)', accept: '.zip,.rar,.7z', fileType: 'archive', icon: 'file-archive', iconClass: 'beat-wizard__file-section-icon--stems' }
]

export default function BeatForm ({ onSuccess, initialData, isEditMode = false }) {
  const { createBeat, loading, error } = useCreateBeat()
  const { user } = useAuth()
  const { artists: allArtists } = useArtists()

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1)
  const TOTAL_STEPS = 4

  // Cover Image State
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')

  // Step 1: Basic Info
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bpm: '',
    key: '',
    genre: '',
    tags: '',
    price: '',
    producer: '',
    audioUrl: '',
    coverUrl: '',
    active: true
  })

  // Collaborators State
  const [colaboradores, setColaboradores] = useState([])
  const [colaboradorInput, setColaboradorInput] = useState('')

  // Producer Dropdown State
  const [showProducerDropdown, setShowProducerDropdown] = useState(false)
  const [producerId, setProducerId] = useState(null)

  // Step 2: Files
  const [uploadedFiles, setUploadedFiles] = useState({
    mp3: null,
    wav: null,
    stems: null
  })
  const [fileUrls, setFileUrls] = useState({
    mp3: '',
    wav: '',
    stems: ''
  })
  const [uploadModes, setUploadModes] = useState({
    mp3: 'upload',
    wav: 'upload',
    stems: 'url'
  })

  // Step 3: Licenses
  const [licenses, setLicenses] = useState(() =>
    DEFAULT_LICENSES.map(l => ({ ...l, description: '' }))
  )
  const [showLicenseForm, setShowLicenseForm] = useState(false)
  const [editingLicenseIndex, setEditingLicenseIndex] = useState(null)
  const [licenseFormData, setLicenseFormData] = useState(getEmptyLicenseForm())

  // Derived: list of all uploaded file keys
  const availableFileKeys = useMemo(() => {
    const keys = []
    FILE_TYPES.forEach(ft => {
      if (uploadedFiles[ft.key] || fileUrls[ft.key]) {
        keys.push(ft.key)
      }
    })
    return keys
  }, [uploadedFiles, fileUrls])

  // Auto-assign "all files" to Unlimited licenses when files change
  useEffect(() => {
    setLicenses(prev => prev.map(lic => {
      if (lic.name === 'Unlimited') {
        return { ...lic, fileKeys: [...availableFileKeys] }
      }
      return lic
    }))
  }, [availableFileKeys])

  // Set description for all licenses whenever formData.description changes
  useEffect(() => {
    if (formData.description) {
      setLicenses(prev => prev.map(lic => ({
        ...lic,
        description: formData.description
      })))
    }
  }, [formData.description])

  // Initialize form data, files and licenses from initialData (no artist dependency)
  useEffect(() => {
    if (!isEditMode || !initialData) return

    const producerValue = typeof initialData.producer === 'string'
      ? initialData.producer
      : (initialData.producer?.name || initialData.producer?.title || '')

    setFormData({
      title: initialData.title || '',
      description: initialData.description || '',
      bpm: initialData.bpm || '',
      key: initialData.key || '',
      genre: initialData.genre || '',
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      price: initialData.price || '',
      producer: producerValue,
      audioUrl: initialData.audioUrl || '',
      coverUrl: initialData.coverUrl || '',
      active: initialData.active ?? true
    })

    // Set producerId from initialData.producer (could be an object or string id)
    if (initialData.producer) {
      const id = typeof initialData.producer === 'object'
        ? (initialData.producer.id || initialData.producer._id)
        : initialData.producer
      setProducerId(id || null)
    }

    if (Array.isArray(initialData.colaboradores)) {
      setColaboradores(initialData.colaboradores)
    }

    if (initialData.coverUrl) {
      setCoverPreviewUrl(initialData.coverUrl)
    }

    // Extract unique file URLs from all licenses and populate central file states
    if (initialData.licenses && initialData.licenses.length > 0) {
      const collectedFiles = { mp3: null, wav: null, stems: null }
      const collectedUrls = { mp3: '', wav: '', stems: '' }
      const collectedModes = { mp3: 'upload', wav: 'upload', stems: 'url' }

      // Map format labels to keys
      const formatLabelToKey = { MP3: 'mp3', WAV: 'wav', STEMS: 'stems' }

      initialData.licenses.forEach(license => {
        if (license.files?.mp3Url && !collectedUrls.mp3) {
          collectedUrls.mp3 = license.files.mp3Url
          collectedFiles.mp3 = { secureUrl: license.files.mp3Url, originalName: 'MP3 File', fileType: 'audio' }
          collectedModes.mp3 = 'url'
        }
        if (license.files?.wavUrl && !collectedUrls.wav) {
          collectedUrls.wav = license.files.wavUrl
          collectedFiles.wav = { secureUrl: license.files.wavUrl, originalName: 'WAV File', fileType: 'audio' }
          collectedModes.wav = 'url'
        }
        if (license.files?.stemsUrl && !collectedUrls.stems) {
          collectedUrls.stems = license.files.stemsUrl
          collectedFiles.stems = { secureUrl: license.files.stemsUrl, originalName: 'STEMS Archive', fileType: 'archive' }
          collectedModes.stems = 'url'
        }
      })

      setUploadedFiles(collectedFiles)
      setFileUrls(collectedUrls)
      setUploadModes(collectedModes)

      // Build licenses with fileKeys derived from formats array (API returns formats but not fileKeys)
      const transformedLicenses = initialData.licenses.map(license => {
        // Derive fileKeys from formats array (e.g. ["MP3", "WAV"] → ["mp3", "wav"])
        const fileKeysFromFormats = (license.formats || [])
          .map(f => formatLabelToKey[f.toUpperCase()])
          .filter(Boolean)

        // Fallback: derive from files object if formats array is empty
        const fileKeysFromFiles = []
        if (license.files?.mp3Url) fileKeysFromFiles.push('mp3')
        if (license.files?.wavUrl) fileKeysFromFiles.push('wav')
        if (license.files?.stemsUrl) fileKeysFromFiles.push('stems')

        const resolvedFileKeys = license.fileKeys?.length
          ? license.fileKeys
          : fileKeysFromFormats.length
            ? fileKeysFromFormats
            : fileKeysFromFiles

        return {
          ...license,
          id: license.id || license._id || `license-${Date.now()}-${Math.random()}`,
          fileKeys: resolvedFileKeys,
          formats: resolvedFileKeys.map(k => k.toUpperCase())
        }
      })
      setLicenses(transformedLicenses)
    }
  }, [isEditMode, initialData])



  // Cover image preview
  useEffect(() => {
    if (coverImageFile) {
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreviewUrl(reader.result)
      reader.readAsDataURL(coverImageFile)
    }
  }, [coverImageFile])

  // =====================
  // Step validation
  // =====================
  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.producer.trim() !== '' && formData.price !== ''
      case 2:
        return availableFileKeys.length > 0
      case 3:
        return licenses.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const canProceed = () => isStepComplete(currentStep)

  // =====================
  // Derived
  // =====================
  const filteredProducers = useMemo(() => {
    const q = formData.producer.toLowerCase().trim()
    if (!q) return []
    return allArtists
      .filter(a => a.title.toLowerCase().includes(q))
      .slice(0, 8)
  }, [formData.producer, allArtists])

  // =====================
  // Handlers
  // =====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // File upload handlers
  const handleFileUploadSuccess = (fileKey, fileData) => {
    setUploadedFiles(prev => ({ ...prev, [fileKey]: fileData }))
    setFileUrls(prev => ({ ...prev, [fileKey]: fileData.secureUrl }))
  }

  const handleFileUrlChange = (fileKey, url) => {
    setFileUrls(prev => ({ ...prev, [fileKey]: url }))
  }

  const handleUploadModeChange = (fileKey, mode) => {
    setUploadModes(prev => ({ ...prev, [fileKey]: mode }))
  }

  // License handlers
  function getEmptyLicenseForm () {
    return {
      name: '',
      price: '',
      description: formData?.description || '',
      formats: [],
      fileKeys: [],
      terms: {
        usedForRecording: true,
        distributionLimit: 0,
        audioStreams: 0,
        musicVideos: 0,
        forProfitPerformances: true,
        radioBroadcasting: 0
      }
    }
  }

  const handleLicenseFormChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('terms.')) {
      const termName = name.split('.')[1]
      setLicenseFormData(prev => ({
        ...prev,
        terms: {
          ...prev.terms,
          [termName]: type === 'checkbox' ? checked : Number(value)
        }
      }))
    } else {
      setLicenseFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }))
    }
  }

  const handleLicenseFileKeyToggle = (fileKey, isEditing = false) => {
    if (isEditing) {
      setLicenseFormData(prev => {
        const keys = prev.fileKeys.includes(fileKey)
          ? prev.fileKeys.filter(k => k !== fileKey)
          : [...prev.fileKeys, fileKey]
        return { ...prev, fileKeys: keys }
      })
    }
  }

  const handleLicenseCardFileKeyToggle = (licenseIndex, fileKey) => {
    setLicenses(prev => {
      const updated = [...prev]
      const lic = { ...updated[licenseIndex] }
      lic.fileKeys = lic.fileKeys.includes(fileKey)
        ? lic.fileKeys.filter(k => k !== fileKey)
        : [...lic.fileKeys, fileKey]
      // Update formats to match
      lic.formats = lic.fileKeys.map(k => k.toUpperCase())
      updated[licenseIndex] = lic
      return updated
    })
  }

  const handleAddLicense = () => {
    if (!licenseFormData.name.trim() || !licenseFormData.price) {
      alert('Por favor completa el nombre y precio de la licencia')
      return
    }
    if (licenseFormData.fileKeys.length === 0) {
      alert('Por favor selecciona al menos un archivo para esta licencia')
      return
    }

    const newLicense = {
      id: editingLicenseIndex !== null ? licenses[editingLicenseIndex].id : `license-${Date.now()}`,
      ...licenseFormData,
      price: Number(licenseFormData.price),
      formats: licenseFormData.fileKeys.map(k => k.toUpperCase())
    }

    if (editingLicenseIndex !== null) {
      const updatedLicenses = [...licenses]
      updatedLicenses[editingLicenseIndex] = newLicense
      setLicenses(updatedLicenses)
      setEditingLicenseIndex(null)
    } else {
      setLicenses([...licenses, newLicense])
    }

    setLicenseFormData(getEmptyLicenseForm())
    setShowLicenseForm(false)
  }

  const handleEditLicense = (index) => {
    const license = licenses[index]
    setLicenseFormData({
      ...license,
      fileKeys: license.fileKeys || []
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
    setLicenseFormData(getEmptyLicenseForm())
  }

  // Navigation
  const goToStep = (step) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      if (step < currentStep || canProceed()) {
        setCurrentStep(step)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
      : []

    // Build licenses with file URLs
    const processedLicenses = licenses.map(lic => {
      const files = {}
      if (lic.fileKeys.includes('mp3')) {
        files.mp3Url = fileUrls.mp3 || uploadedFiles.mp3?.secureUrl || ''
      }
      if (lic.fileKeys.includes('wav')) {
        files.wavUrl = fileUrls.wav || uploadedFiles.wav?.secureUrl || ''
      }
      if (lic.fileKeys.includes('stems')) {
        files.stemsUrl = fileUrls.stems || uploadedFiles.stems?.secureUrl || ''
      }

      // Clean internal keys before sending
      const { fileKeys, uploadedFiles: _, ...licenseData } = lic
      return {
        ...licenseData,
        files
      }
    })

    const payload = {
      ...formData,
      bpm: formData.bpm ? Number(formData.bpm) : undefined,
      price: Number(formData.price),
      tags: tagsArray,
      producer: producerId || null,
      colaboradores,
      licenses: processedLicenses
    }

    try {
      if (isEditMode) {
        if (onSuccess) {
          await onSuccess(payload, coverImageFile)
        }
      } else {
        await createBeat(payload, coverImageFile)
        if (onSuccess) {
          onSuccess('Beat creado correctamente')
        }
        // Reset form
        setFormData({
          title: '', description: '', bpm: '', key: '', genre: '',
          tags: '', price: '', producer: '', audioUrl: '', coverUrl: '', active: true
        })
        setProducerId(null)
        setColaboradores([])
        setColaboradorInput('')
        setLicenses(DEFAULT_LICENSES.map(l => ({ ...l, description: '' })))
        setCoverImageFile(null)
        setCoverPreviewUrl('')
        setUploadedFiles({ mp3: null, wav: null, stems: null })
        setFileUrls({ mp3: '', wav: '', stems: '' })
        setCurrentStep(1)
      }
    } catch (err) {
      // Error handled by hook
    }
  }

  // Helper: format term value
  const formatTermValue = (val) => {
    if (val === 0 || val === '0') return 'Ilimitado'
    return val.toLocaleString('es-ES')
  }

  // Step labels
  const steps = [
    { num: 1, label: 'Información', icon: 'music' },
    { num: 2, label: 'Archivos', icon: 'cloud-upload-alt' },
    { num: 3, label: 'Licencias', icon: 'shopping-cart' },
    { num: 4, label: 'Resumen', icon: 'check-circle' }
  ]

  // =====================
  // RENDER
  // =====================
  return (
    <form onSubmit={(e) => e.preventDefault()} className="createCardModal__form" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>

      {/* Progress Bar */}
      <div className="beat-wizard__progress">
        {steps.map((step, idx) => (
          <div key={step.num} style={{ display: 'contents' }}>
            <div
              className="beat-wizard__step-indicator"
              onClick={() => goToStep(step.num)}
            >
              <div className={`beat-wizard__step-number ${
                currentStep === step.num ? 'beat-wizard__step-number--active' : ''
              } ${isStepComplete(step.num) && currentStep !== step.num ? 'beat-wizard__step-number--completed' : ''}`}>
                {isStepComplete(step.num) && currentStep !== step.num
                  ? <FontAwesomeIcon icon={['fas', 'check']} />
                  : step.num
                }
              </div>
              <span className={`beat-wizard__step-label ${
                currentStep === step.num ? 'beat-wizard__step-label--active' : ''
              } ${isStepComplete(step.num) && currentStep !== step.num ? 'beat-wizard__step-label--completed' : ''}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`beat-wizard__step-line ${
                isStepComplete(step.num) && isStepComplete(steps[idx + 1].num)
                  ? 'beat-wizard__step-line--completed'
                  : isStepComplete(step.num)
                    ? 'beat-wizard__step-line--active'
                    : ''
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ==================
          STEP 1: Basic Info
          ================== */}
      {currentStep === 1 && (
        <div className="beat-wizard__content">
          <h3 className="beat-wizard__step-header">
            <FontAwesomeIcon icon={['fas', 'music']} className="icon" />
            Información del Beat
          </h3>

          <div className="beat-wizard__form-group beat-wizard__form-group--full">
            <ImageUploader
              label="Imagen de portada"
              onChange={setCoverImageFile}
              currentImageUrl={formData.coverUrl}
              selectedFile={coverImageFile}
            />
          </div>

          <div className="beat-wizard__form-group">
            <label>Título del Beat <span className="required">*</span></label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={60}
              placeholder="Ej: Dark Trap Beat 2025"
            />
            <small>Máximo 60 caracteres</small>
          </div>

          <div className="beat-wizard__form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del beat. Esta descripción se usará para todas las licencias."
              rows={3}
            />
            <small>Se aplicará como descripción de todas las licencias</small>
          </div>

          <div className="beat-wizard__form-group">
            <label>Precio Base <span className="required">*</span></label>
            <div className="beat-wizard__input-with-suffix">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
                placeholder="29.99"
              />
              <span className="beat-wizard__input-suffix">€</span>
            </div>
            <small>Precio de referencia del beat</small>
          </div>

          <div className="beat-wizard__form-group">
            <label>Productor <span className="required">*</span></label>
            <div className="beat-wizard__producer-search">
              <input
                type="text"
                name="producer"
                value={formData.producer}
                onChange={(e) => {
                  handleChange(e)
                  setProducerId(null)
                  setShowProducerDropdown(true)
                }}
                onFocus={() => setShowProducerDropdown(true)}
                onBlur={() => setTimeout(() => setShowProducerDropdown(false), 150)}
                placeholder="Nombre del productor"
                required
                autoComplete="off"
              />
              {showProducerDropdown && filteredProducers.length > 0 && (
                <div className="beat-wizard__producer-dropdown">
                  {filteredProducers.map(artist => (
                    <div
                      key={artist.id}
                      className="beat-wizard__producer-item"
                      onMouseDown={() => {
                        setFormData(prev => ({ ...prev, producer: artist.title }))
                        setProducerId(artist.id)
                        setShowProducerDropdown(false)
                      }}
                    >
                      <div className="beat-wizard__producer-item-name">{artist.title}</div>
                      <div className="beat-wizard__producer-item-genre">{artist.subtitle || artist.genre}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="beat-wizard__form-group">
            <label><FontAwesomeIcon icon={['fas', 'users']} className="icon-label" /> Colaboradores</label>
            <div className="beat-wizard__collaborators-input">
              <input
                type="text"
                value={colaboradorInput}
                onChange={(e) => setColaboradorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const name = colaboradorInput.trim()
                    if (name && !colaboradores.includes(name)) {
                      setColaboradores(prev => [...prev, name])
                    }
                    setColaboradorInput('')
                  }
                }}
                placeholder="Nombre del colaborador"
              />
              <button
                type="button"
                className="beat-wizard__collaborators-add-btn"
                onClick={() => {
                  const name = colaboradorInput.trim()
                  if (name && !colaboradores.includes(name)) {
                    setColaboradores(prev => [...prev, name])
                  }
                  setColaboradorInput('')
                }}
              >
                <FontAwesomeIcon icon={['fas', 'plus']} />
              </button>
            </div>
            {colaboradores.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {colaboradores.map((col, i) => (
                  <span key={i} className="beat-wizard__producer-tag">
                    {col}
                    <button type="button" onClick={() => setColaboradores(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <small>Pulsa Enter o + para añadir cada colaborador.</small>
          </div>

          <div className="beat-wizard__form-row">
            <div className="beat-wizard__form-group">
              <label><FontAwesomeIcon icon={['fas', 'music']} className="icon-label" /> BPM (Tempo)</label>
              <input
                type="number"
                name="bpm"
                value={formData.bpm}
                onChange={handleChange}
                max={300}
                placeholder="140"
              />
            </div>
            <div className="beat-wizard__form-group">
              <label><FontAwesomeIcon icon={['fas', 'music']} className="icon-label" /> Tonalidad (Key)</label>
              <select
                name="key"
                value={formData.key}
                onChange={handleChange}
              >
                <option value="">Seleccionar tonalidad</option>
                {MUSICAL_KEYS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="beat-wizard__form-group">
            <label>Género Musical</label>
            <input
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Trap, Hip Hop, R&B..."
            />
          </div>

          <div className="beat-wizard__form-group">
            <label><FontAwesomeIcon icon={['fas', 'tag']} className="icon-label" /> Etiquetas (Tags)</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="trap, dark, piano, aggressive"
            />
            <small>Separa las etiquetas con comas</small>
          </div>

          <div className="beat-wizard__info-tip">
            <FontAwesomeIcon icon={['fas', 'info-circle']} />
            <span>Completa el título, precio y productor para continuar al siguiente paso</span>
          </div>
        </div>
      )}

      {/* ==================
          STEP 2: Files
          ================== */}
      {currentStep === 2 && (
        <div className="beat-wizard__content">
          <h3 className="beat-wizard__step-header">
            <FontAwesomeIcon icon={['fas', 'cloud-upload-alt']} className="icon" />
            Archivos del Beat
          </h3>

          <p style={{ color: '#999', fontSize: '0.9rem', marginTop: 0, marginBottom: '1.5rem' }}>
            Sube los archivos de audio que se incluirán con las licencias. Puedes subir archivos desde tu ordenador o introducir la URL directa.
          </p>

          <div className="beat-wizard__files-grid">
            {FILE_TYPES.map(ft => (
              <div key={ft.key} className="beat-wizard__file-section">
                <div className="beat-wizard__file-section-header">
                  <div className={`beat-wizard__file-section-icon ${ft.iconClass}`}>
                    <FontAwesomeIcon icon={['fas', ft.icon]} />
                  </div>
                  <div>
                    <div className="beat-wizard__file-section-title">Archivo {ft.label}</div>
                    <div className="beat-wizard__file-section-subtitle">
                      {ft.key === 'mp3' && 'Formato comprimido de alta calidad (320kbps recomendado)'}
                      {ft.key === 'wav' && 'Formato sin comprimir (44.1kHz/16bit mínimo)'}
                      {ft.key === 'stems' && 'Archivo comprimido con pistas separadas'}
                    </div>
                  </div>
                </div>

                {/* Upload mode toggle */}
                <div className="beat-wizard__upload-mode">
                  <button
                    type="button"
                    className={`beat-wizard__upload-mode-btn ${uploadModes[ft.key] === 'upload' ? 'beat-wizard__upload-mode-btn--active' : ''}`}
                    onClick={() => handleUploadModeChange(ft.key, 'upload')}
                  >
                    <FontAwesomeIcon icon={['fas', 'upload']} />
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    className={`beat-wizard__upload-mode-btn ${uploadModes[ft.key] === 'url' ? 'beat-wizard__upload-mode-btn--active' : ''}`}
                    onClick={() => handleUploadModeChange(ft.key, 'url')}
                  >
                    <FontAwesomeIcon icon={['fas', 'link']} />
                    Introducir URL
                  </button>
                </div>

                {uploadModes[ft.key] === 'upload'
                  ? (
                    <FileUploader
                      fileType={ft.fileType}
                      accept={ft.accept}
                      label={`Seleccionar ${ft.label}`}
                      onUploadSuccess={(fileData) => handleFileUploadSuccess(ft.key, fileData)}
                      existingFile={uploadedFiles[ft.key]}
                      metadata={{
                        description: `${formData.title || 'Beat'} - ${ft.label}`,
                        tags: ['beat', ft.key, 'license'],
                        isPublic: false
                      }}
                    />
                    )
                  : (
                    <div className="beat-wizard__url-input">
                      <input
                        type="url"
                        value={fileUrls[ft.key]}
                        onChange={(e) => handleFileUrlChange(ft.key, e.target.value)}
                        placeholder={`https://storage.example.com/beat.${ft.key === 'stems' ? 'zip' : ft.key}`}
                      />
                    </div>
                    )}

                {(uploadedFiles[ft.key] || fileUrls[ft.key]) && (
                  <div className="beat-wizard__file-uploaded-badge">
                    <FontAwesomeIcon icon={['fas', 'check-circle']} />
                    {uploadedFiles[ft.key]
                      ? uploadedFiles[ft.key].originalName || `${ft.label} subido`
                      : 'URL configurada'
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="beat-wizard__info-tip" style={{
            background: availableFileKeys.length > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderColor: availableFileKeys.length > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            color: availableFileKeys.length > 0 ? '#22c55e' : '#f59e0b'
          }}>
            <FontAwesomeIcon icon={['fas', availableFileKeys.length > 0 ? 'check-circle' : 'info-circle']} />
            <span>
              {availableFileKeys.length > 0
                ? `${availableFileKeys.length} archivo${availableFileKeys.length !== 1 ? 's' : ''} configurado${availableFileKeys.length !== 1 ? 's' : ''} correctamente`
                : 'Sube al menos un archivo para continuar'
              }
            </span>
          </div>
        </div>
      )}

      {/* ==================
          STEP 3: Licenses
          ================== */}
      {currentStep === 3 && (
        <div className="beat-wizard__content">
          <div className="beat-wizard__licenses-header">
            <h3 className="beat-wizard__licenses-title">
              <FontAwesomeIcon icon={['fas', 'shopping-cart']} style={{ color: '#ff003c' }} />
              Gestión de Licencias
            </h3>
            <button
              type="button"
              className={`beat-wizard__btn-add-license ${showLicenseForm ? 'beat-wizard__btn-add-license--cancel' : ''}`}
              onClick={() => {
                if (showLicenseForm) {
                  handleCancelLicenseForm()
                } else {
                  setLicenseFormData(getEmptyLicenseForm())
                  setShowLicenseForm(true)
                }
              }}
            >
              <FontAwesomeIcon icon={['fas', showLicenseForm ? 'times' : 'plus']} />
              {showLicenseForm ? 'Cancelar' : 'Nueva Licencia'}
            </button>
          </div>

          {licenses.length === 0 && !showLicenseForm && (
            <div className="beat-wizard__licenses-empty">
              <FontAwesomeIcon icon={['fas', 'shopping-cart']} className="beat-wizard__licenses-empty-icon" />
              <p>No hay licencias creadas</p>
              <p>Crea al menos una licencia para que los usuarios puedan comprar tu beat</p>
            </div>
          )}

          {/* License Form */}
          {showLicenseForm && (
            <div className="beat-wizard__license-form">
              <h4 className="beat-wizard__license-form-title">
                <FontAwesomeIcon icon={['fas', editingLicenseIndex !== null ? 'edit' : 'plus']} />
                {editingLicenseIndex !== null ? 'Editar Licencia' : 'Nueva Licencia'}
              </h4>

              <div className="beat-wizard__form-row">
                <div className="beat-wizard__form-group">
                  <label>Nombre de la Licencia <span className="required">*</span></label>
                  <input
                    name="name"
                    value={licenseFormData.name}
                    onChange={handleLicenseFormChange}
                    placeholder="Ej: Basic License"
                    required
                  />
                </div>
                <div className="beat-wizard__form-group">
                  <label>Precio <span className="required">*</span></label>
                  <div className="beat-wizard__input-with-suffix">
                    <input
                      type="number"
                      name="price"
                      value={licenseFormData.price}
                      onChange={handleLicenseFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="beat-wizard__input-suffix">€</span>
                  </div>
                </div>
              </div>

              <div className="beat-wizard__form-group">
                <label>Descripción</label>
                <input
                  name="description"
                  value={licenseFormData.description}
                  onChange={handleLicenseFormChange}
                  placeholder="Breve descripción de la licencia"
                />
              </div>

              {/* File selector for license */}
              <div className="beat-wizard__license-files-section">
                <h5 className="beat-wizard__license-files-title">
                  <FontAwesomeIcon icon={['fas', 'file-audio']} />
                  Archivos incluidos
                </h5>

                {availableFileKeys.length > 0
                  ? (
                    <div className="beat-wizard__file-checkbox-grid">
                      {FILE_TYPES.filter(ft => availableFileKeys.includes(ft.key)).map(ft => (
                        <label
                          key={ft.key}
                          className={`beat-wizard__file-checkbox ${licenseFormData.fileKeys.includes(ft.key) ? 'beat-wizard__file-checkbox--checked' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={licenseFormData.fileKeys.includes(ft.key)}
                            onChange={() => handleLicenseFileKeyToggle(ft.key, true)}
                          />
                          <span>{ft.label}</span>
                        </label>
                      ))}
                    </div>
                    )
                  : (
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
                      No hay archivos subidos. Vuelve al paso anterior para subir archivos.
                    </div>
                    )}
              </div>

              {/* Terms */}
              <div className="beat-wizard__terms-section">
                <h5 className="beat-wizard__terms-title">
                  <FontAwesomeIcon icon={['fas', 'info-circle']} />
                  Términos de Uso
                </h5>

                <div className="beat-wizard__form-group">
                  <label className={`beat-wizard__checkbox-label ${licenseFormData.terms.usedForRecording ? 'beat-wizard__checkbox-label--active' : ''}`}>
                    <input
                      type="checkbox"
                      name="terms.usedForRecording"
                      checked={licenseFormData.terms.usedForRecording}
                      onChange={handleLicenseFormChange}
                    />
                    <FontAwesomeIcon icon={['fas', 'music']} style={{ color: '#22c55e' }} />
                    Permitido para grabación musical
                  </label>
                </div>

                <div className="beat-wizard__form-row" style={{ marginTop: '1rem' }}>
                  <div className="beat-wizard__form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'compact-disc']} className="icon-label" />
                      Límite de distribución
                    </label>
                    <input
                      type="number"
                      name="terms.distributionLimit"
                      value={licenseFormData.terms.distributionLimit}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                  <div className="beat-wizard__form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'headphones']} className="icon-label" />
                      Reproducciones online
                    </label>
                    <input
                      type="number"
                      name="terms.audioStreams"
                      value={licenseFormData.terms.audioStreams}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                </div>

                <div className="beat-wizard__form-row">
                  <div className="beat-wizard__form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'video']} className="icon-label" />
                      Vídeos musicales
                    </label>
                    <input
                      type="number"
                      name="terms.musicVideos"
                      value={licenseFormData.terms.musicVideos}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                  <div className="beat-wizard__form-group">
                    <label>
                      <FontAwesomeIcon icon={['fas', 'radio']} className="icon-label" />
                      Emisoras de radio
                    </label>
                    <input
                      type="number"
                      name="terms.radioBroadcasting"
                      value={licenseFormData.terms.radioBroadcasting}
                      onChange={handleLicenseFormChange}
                      min="0"
                      placeholder="0 = ilimitado"
                    />
                  </div>
                </div>

                <div className="beat-wizard__form-group" style={{ marginTop: '1rem' }}>
                  <label className={`beat-wizard__checkbox-label ${licenseFormData.terms.forProfitPerformances ? 'beat-wizard__checkbox-label--active' : ''}`}>
                    <input
                      type="checkbox"
                      name="terms.forProfitPerformances"
                      checked={licenseFormData.terms.forProfitPerformances}
                      onChange={handleLicenseFormChange}
                    />
                    <FontAwesomeIcon icon={['fas', 'music']} style={{ color: '#22c55e' }} />
                    Actuaciones con ánimo de lucro permitidas
                  </label>
                </div>

                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '1rem' }}>
                  💡 Tip: Usar 0 en los límites numéricos significa &quot;ilimitado&quot;
                </small>
              </div>

              <div className="beat-wizard__license-form-actions">
                <button type="button" onClick={handleAddLicense} className="beat-wizard__btn-save-license">
                  <FontAwesomeIcon icon={['fas', editingLicenseIndex !== null ? 'save' : 'plus']} />
                  {editingLicenseIndex !== null ? 'Guardar Cambios' : 'Agregar Licencia'}
                </button>
                <button type="button" onClick={handleCancelLicenseForm} className="beat-wizard__btn-cancel-license">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Display Added Licenses */}
          {licenses.length > 0 && (
            <div className="beat-wizard__license-cards">
              {licenses.map((license, index) => (
                <div key={license.id} className="beat-wizard__license-card">
                  <div className="beat-wizard__license-card-body">
                    <div className="beat-wizard__license-card-header">
                      <h4 className="beat-wizard__license-card-name">{license.name}</h4>
                      <span className="beat-wizard__license-card-price">
                        {license.price.toFixed(2)}
                        <span>€</span>
                      </span>
                    </div>
                    {license.description && (
                      <p className="beat-wizard__license-card-desc">{license.description}</p>
                    )}

                    {/* File selector inline - show all formats from license, highlight available ones */}
                    <div className="beat-wizard__license-card-formats">
                      {(() => {
                        // Merge availableFileKeys + license's own fileKeys to show all relevant formats
                        const allKeys = [...new Set([...availableFileKeys, ...(license.fileKeys || [])])]
                        return allKeys.map(fk => {
                          const ft = FILE_TYPES.find(f => f.key === fk)
                          const isIncluded = license.fileKeys?.includes(fk)
                          const fileExists = availableFileKeys.includes(fk)
                          return (
                            <span
                              key={fk}
                              className="beat-wizard__format-badge"
                              style={{
                                cursor: fileExists ? 'pointer' : 'default',
                                opacity: isIncluded ? 1 : 0.35,
                                background: isIncluded
                                  ? fileExists
                                    ? 'rgba(255, 0, 60, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                borderColor: isIncluded
                                  ? fileExists
                                    ? 'rgba(255, 0, 60, 0.3)'
                                    : 'rgba(245, 158, 11, 0.3)'
                                  : '#444',
                                color: isIncluded
                                  ? fileExists ? '#ff003c' : '#f59e0b'
                                  : '#888'
                              }}
                              onClick={() => fileExists && handleLicenseCardFileKeyToggle(index, fk)}
                              title={
                                !fileExists
                                  ? `${ft?.label}: archivo pendiente de subir (paso 2)`
                                  : isIncluded
                                    ? `Quitar ${ft?.label}`
                                    : `Añadir ${ft?.label}`
                              }
                            >
                              <FontAwesomeIcon icon={['fas', fileExists ? 'file-audio' : 'exclamation-triangle']} />
                              {ft?.label}
                            </span>
                          )
                        })
                      })()}
                    </div>

                    {/* Usage terms summary */}
                    <div className="beat-wizard__license-card-terms">
                      <div className="beat-wizard__license-card-term">
                        <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                        Distribución: {formatTermValue(license.terms.distributionLimit)}
                      </div>
                      <div className="beat-wizard__license-card-term">
                        <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                        Streams: {formatTermValue(license.terms.audioStreams)}
                      </div>
                      <div className="beat-wizard__license-card-term">
                        <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                        Vídeos: {formatTermValue(license.terms.musicVideos)}
                      </div>
                      <div className="beat-wizard__license-card-term">
                        <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                        Radio: {formatTermValue(license.terms.radioBroadcasting)}
                      </div>
                      {license.terms.usedForRecording && (
                        <div className="beat-wizard__license-card-term">
                          <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                          Grabación musical
                        </div>
                      )}
                      {!license.terms.forProfitPerformances && (
                        <div className="beat-wizard__license-card-term">
                          <FontAwesomeIcon icon={['fas', 'check']} className="icon" />
                          Actuaciones sin ánimo de lucro
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="beat-wizard__license-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEditLicense(index)}
                      className="beat-wizard__license-action-btn"
                      title="Editar licencia"
                    >
                      <FontAwesomeIcon icon={['fas', 'edit']} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLicense(index)}
                      className="beat-wizard__license-action-btn beat-wizard__license-action-btn--delete"
                      title="Eliminar licencia"
                    >
                      <FontAwesomeIcon icon={['fas', 'trash']} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {licenses.length > 0 && (
            <div className="beat-wizard__license-count">
              <FontAwesomeIcon icon={['fas', 'check-circle']} />
              <span><strong>{licenses.length}</strong> licencia{licenses.length !== 1 ? 's' : ''} configurada{licenses.length !== 1 ? 's' : ''} correctamente</span>
            </div>
          )}
        </div>
      )}

      {/* ==================
          STEP 4: Summary
          ================== */}
      {currentStep === 4 && (
        <div className="beat-wizard__content">
          <h3 className="beat-wizard__step-header">
            <FontAwesomeIcon icon={['fas', 'check-circle']} className="icon" />
            Resumen del Beat
          </h3>

          <div className="beat-wizard__summary">
            {/* Basic info summary */}
            <div className="beat-wizard__summary-section">
              <h4 className="beat-wizard__summary-section-title">
                <FontAwesomeIcon icon={['fas', 'music']} className="icon" />
                Información Básica
              </h4>

              {coverPreviewUrl && (
                <div className="beat-wizard__summary-cover">
                  <img src={coverPreviewUrl} alt="Portada" />
                </div>
              )}

              <div className="beat-wizard__summary-grid">
                <div className="beat-wizard__summary-row">
                  <span className="beat-wizard__summary-label">Título</span>
                  <span className="beat-wizard__summary-value">{formData.title || 'Sin título'}</span>
                </div>
                {formData.description && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">Descripción</span>
                    <span className="beat-wizard__summary-value">{formData.description}</span>
                  </div>
                )}
                <div className="beat-wizard__summary-row">
                  <span className="beat-wizard__summary-label">Precio Base</span>
                  <span className="beat-wizard__summary-value">{formData.price ? `${Number(formData.price).toFixed(2)} €` : 'No definido'}</span>
                </div>
                <div className="beat-wizard__summary-row">
                  <span className="beat-wizard__summary-label">Productor</span>
                  <span className="beat-wizard__summary-value">{formData.producer || 'No asignado'}</span>
                </div>
                {formData.bpm && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">BPM</span>
                    <span className="beat-wizard__summary-value">{formData.bpm}</span>
                  </div>
                )}
                {formData.key && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">Tonalidad</span>
                    <span className="beat-wizard__summary-value">{formData.key}</span>
                  </div>
                )}
                {formData.genre && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">Género</span>
                    <span className="beat-wizard__summary-value">{formData.genre}</span>
                  </div>
                )}
                {formData.tags && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">Tags</span>
                    <span className="beat-wizard__summary-value">
                      <div className="beat-wizard__summary-tags">
                        {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                          <span key={i} className="beat-wizard__summary-tag">{tag}</span>
                        ))}
                      </div>
                    </span>
                  </div>
                )}
                {colaboradores.length > 0 && (
                  <div className="beat-wizard__summary-row">
                    <span className="beat-wizard__summary-label">Colaboradores</span>
                    <span className="beat-wizard__summary-value">
                      <div className="beat-wizard__summary-tags">
                        {colaboradores.map((col, i) => (
                          <span key={i} className="beat-wizard__summary-tag">{col}</span>
                        ))}
                      </div>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Files summary */}
            <div className="beat-wizard__summary-section">
              <h4 className="beat-wizard__summary-section-title">
                <FontAwesomeIcon icon={['fas', 'cloud-upload-alt']} className="icon" />
                Archivos ({availableFileKeys.length})
              </h4>
              <div className="beat-wizard__summary-files">
                {FILE_TYPES.map(ft => {
                  const hasFile = uploadedFiles[ft.key] || fileUrls[ft.key]
                  if (!hasFile) return null
                  return (
                    <div key={ft.key} className="beat-wizard__summary-file">
                      <div className={`beat-wizard__summary-file-icon ${ft.iconClass}`}>
                        <FontAwesomeIcon icon={['fas', ft.icon]} />
                      </div>
                      <span className="beat-wizard__summary-file-name">
                        {uploadedFiles[ft.key]?.originalName || `${ft.label} (URL)`}
                      </span>
                      <span className="beat-wizard__summary-file-status">
                        <FontAwesomeIcon icon={['fas', 'check-circle']} /> Listo
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Licenses summary */}
            <div className="beat-wizard__summary-section">
              <h4 className="beat-wizard__summary-section-title">
                <FontAwesomeIcon icon={['fas', 'shopping-cart']} className="icon" />
                Licencias ({licenses.length})
              </h4>
              <div className="beat-wizard__summary-licenses">
                {licenses.map(license => (
                  <div key={license.id} className="beat-wizard__summary-license">
                    <div className="beat-wizard__summary-license-info">
                      <span className="beat-wizard__summary-license-name">{license.name}</span>
                      <div className="beat-wizard__summary-license-formats">
                        {(license.fileKeys || []).map(fk => {
                          const ft = FILE_TYPES.find(f => f.key === fk)
                          return (
                            <span key={fk} className="beat-wizard__summary-license-format">{ft?.label}</span>
                          )
                        })}
                      </div>
                    </div>
                    <span className="beat-wizard__summary-license-price">{license.price.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div className="beat-wizard__summary-section">
              <h4 className="beat-wizard__summary-section-title">
                <FontAwesomeIcon icon={['fas', 'info-circle']} className="icon" />
                Configuración
              </h4>
              <label className={`beat-wizard__active-toggle ${formData.active ? 'beat-wizard__active-toggle--on' : 'beat-wizard__active-toggle--off'}`}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                <div className="beat-wizard__active-toggle-text">
                  <div className="beat-wizard__active-toggle-title">
                    {formData.active ? 'Beat Activo' : 'Beat Inactivo'}
                  </div>
                  <div className="beat-wizard__active-toggle-desc">
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
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="beat-wizard__error">
          <FontAwesomeIcon icon={['fas', 'info-circle']} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="beat-wizard__nav">
        {currentStep > 1
          ? (
            <button type="button" className="beat-wizard__btn beat-wizard__btn--prev" onClick={prevStep}>
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              Anterior
            </button>
            )
          : <div />
        }

        {currentStep < TOTAL_STEPS
          ? (
            <button
              type="button"
              className="beat-wizard__btn beat-wizard__btn--next"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Siguiente
              <FontAwesomeIcon icon={['fas', 'arrow-right']} />
            </button>
            )
          : (
            <button
              type="button"
              className="beat-wizard__btn beat-wizard__btn--publish"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading
                ? (
                  <>
                    <FontAwesomeIcon icon={['fas', 'spinner']} spin />
                    {isEditMode ? 'Actualizando...' : 'Publicando...'}
                  </>
                  )
                : (
                  <>
                    <FontAwesomeIcon icon={['fas', 'save']} />
                    {isEditMode ? 'Actualizar Beat' : 'Publicar Beat'}
                  </>
                  )}
            </button>
            )}
      </div>
    </form>
  )
}
