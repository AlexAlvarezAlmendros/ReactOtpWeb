import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useBeat } from '../hooks/useBeat'
import { useArtistBeats } from '../hooks/useArtistBeats'
import { useBeatPurchase } from '../hooks/useBeatPurchase'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { usePageMeta } from '../hooks/usePageMeta'
import BeatCard from '../components/BeatCard/BeatCard'
import LazyImage from '../components/LazyImage/LazyImage'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './BeatDetalle.css'

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const formatValue = (value) => {
  if (value === 'unlimited' || value === -1 || value === 0) return 'Ilimitado'
  return value?.toLocaleString('es-ES') || '0'
}

function BeatDetalle () {
  const { id } = useParams()
  const { beat, loading, error } = useBeat(id)

  // Producer name for fetching more beats
  const producerName = beat
    ? (typeof beat.producer === 'object' ? beat.producer?.name : beat.producer)
    : null

  usePageMeta({
    title: beat?.title || beat?.name,
    description: [producerName ? `Prod. ${producerName}` : null, beat?.genre, beat?.bpm ? `${beat.bpm} BPM` : null].filter(Boolean).join(' · '),
    image: beat?.coverUrl || beat?.img
  })
  const { beats: moreBeats, loading: moreLoading } = useArtistBeats(producerName, 8)

  // Filter out current beat from "more beats"
  const relatedBeats = moreBeats.filter(b => (b._id || b.id) !== id)

  // License selection
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [expandedTerms, setExpandedTerms] = useState(null)
  const [visibleLicenses, setVisibleLicenses] = useState(4)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)

  // Purchase
  const { createCheckoutSession, loading: purchaseLoading } = useBeatPurchase()

  // Audio player
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  let audioPlayerContext
  try {
    audioPlayerContext = useAudioPlayer()
  } catch {
    audioPlayerContext = {
      currentPlaying: null,
      registerAudio: () => {},
      unregisterAudio: () => {},
      playAudio: () => {},
      pauseAudio: () => {},
      setPlaylist: () => {}
    }
  }
  const { currentPlaying, registerAudio, unregisterAudio, playAudio, pauseAudio, setPlaylist } = audioPlayerContext

  const beatId = beat?._id || beat?.id
  const audioUrl = beat?.licenses?.find(l => l.files?.mp3Url)?.files?.mp3Url || null

  // Sincronizar playlist con el beat actual + los beats relacionados
  useEffect(() => {
    if (!beatId) return
    const ids = [beatId, ...relatedBeats.map(b => b._id || b.id)].filter(Boolean)
    if (setPlaylist) setPlaylist(ids)
    return () => { if (setPlaylist) setPlaylist([]) }
  }, [beatId, relatedBeats, setPlaylist])

  // Register/unregister audio
  const beatCoverUrl = beat?.coverUrl || beat?.img || '/img/default-beat.jpg'
  useEffect(() => {
    if (audioRef.current && audioUrl && beatId) {
      registerAudio(beatId, audioRef.current, {
        title: beat?.title || beat?.name,
        artist: producerName || 'OTP Records',
        artwork: beatCoverUrl
      })
    }
    return () => { if (audioUrl && beatId) unregisterAudio(beatId) }
  }, [beatId, audioUrl, beat?.title, beat?.name, producerName, beatCoverUrl, registerAudio, unregisterAudio])

  // Sync play state
  useEffect(() => {
    setIsPlaying(currentPlaying === beatId)
  }, [currentPlaying, beatId])

  // Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => { if (!isSeeking) setCurrentTime(audio.currentTime) }
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onLoaded)
    audio.addEventListener('ended', onEnded)

    // Handle already-cached audio (metadata may have loaded before this effect ran)
    if (audio.readyState >= 1 && audio.duration) setDuration(audio.duration)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [isSeeking])

  const handlePlayPause = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!beatId) return
    isPlaying ? pauseAudio(beatId) : playAudio(beatId)
  }, [isPlaying, beatId, playAudio, pauseAudio])

  const handleSeekStart = () => setIsSeeking(true)
  const handleSeekChange = (e) => {
    const val = Number(e.target.value)
    setCurrentTime(val)
    if (audioRef.current) audioRef.current.currentTime = val
  }
  const handleSeekEnd = (e) => {
    const val = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = val
    setCurrentTime(val)
    setIsSeeking(false)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Select first license by default when beat loads
  useEffect(() => {
    if (beat?.licenses?.length > 0 && !selectedLicense) {
      setSelectedLicense(beat.licenses[0])
      setExpandedTerms(beat.licenses[0].id)
    }
  }, [beat, selectedLicense])

  // Carousel
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [relatedBeats, checkScroll])

  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    const scrollAmount = 300
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' })
  }

  // Purchase flow
  const validateName = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Por favor, introduce tu nombre completo'
    if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    return null
  }

  const validateEmail = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Introduce tu email para recibir el beat'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Formato no válido · ej: nombre@dominio.com'
    return null
  }

  const validateForm = () => {
    const errs = {}
    if (!selectedLicense) errs.license = 'Selecciona una licencia'
    const nameErr = validateName(customerName)
    if (nameErr) errs.name = nameErr
    const emailErr = validateEmail(customerEmail)
    if (emailErr) errs.email = emailErr
    setFormErrors(errs)
    setTouchedFields({ name: true, email: true })
    return Object.keys(errs).length === 0
  }

  const handleNameChange = (e) => {
    setCustomerName(e.target.value)
    if (formErrors.name && !validateName(e.target.value)) {
      setFormErrors(prev => { const n = { ...prev }; delete n.name; return n })
    }
  }

  const handleEmailChange = (e) => {
    setCustomerEmail(e.target.value)
    if (formErrors.email && !validateEmail(e.target.value)) {
      setFormErrors(prev => { const n = { ...prev }; delete n.email; return n })
    }
  }

  const handleNameBlur = () => {
    setTouchedFields(prev => ({ ...prev, name: true }))
    setFormErrors(prev => {
      const errs = { ...prev }
      const err = validateName(customerName)
      if (err) errs.name = err
      else delete errs.name
      return errs
    })
  }

  const handleEmailBlur = () => {
    setTouchedFields(prev => ({ ...prev, email: true }))
    setFormErrors(prev => {
      const errs = { ...prev }
      const err = validateEmail(customerEmail)
      if (err) errs.email = err
      else delete errs.email
      return errs
    })
  }

  const openCheckout = () => {
    setCustomerName('')
    setCustomerEmail('')
    setFormErrors({})
    setTouchedFields({})
    setIsCheckoutModalOpen(true)
  }

  const handleBuyNow = async () => {
    if (!validateForm()) return
    try {
      await createCheckoutSession(
        beatId,
        selectedLicense.id,
        customerEmail,
        customerName
      )
      setIsCheckoutModalOpen(false)
    } catch {
      // Error handled by hook toast
    }
  }

  // Colaboradores
  const colaboradores = (() => {
    const raw = beat?.colaboradores
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          return Array.isArray(parsed) ? parsed : [raw]
        } catch { return [raw] }
      }
      return trimmed.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  })()

  // Download handler
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)

  const handleConfirmDownload = async () => {
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${beat?.title || 'beat'}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
      } catch {
        window.open(audioUrl, '_blank')
      }
    }
    setIsDownloadDialogOpen(false)
  }

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateStr).toLocaleDateString('es-ES', options)
  }

  // Loading
  if (loading) {
    return <LoadingSpinner message="Cargando beat..." />
  }

  // Error
  if (error) {
    return (
      <section className="beat-detail">
        <div className="beat-detail__error">
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="beat-detail__error-icon" />
          <h2>Error al cargar el beat</h2>
          <p>{error}</p>
          <Link to="/beats" className="beat-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Beats
          </Link>
        </div>
      </section>
    )
  }

  // Not found
  if (!beat) {
    return (
      <section className="beat-detail">
        <div className="beat-detail__error">
          <FontAwesomeIcon icon={['fas', 'music']} className="beat-detail__error-icon" />
          <h2>Beat no encontrado</h2>
          <p>El beat que buscas no existe o ha sido eliminado.</p>
          <Link to="/beats" className="beat-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Beats
          </Link>
        </div>
      </section>
    )
  }

  const imageUrl = beat.coverUrl || '/img/default-beat.jpg'
  const isFree = !beat.price || beat.price === 0
  const licenses = beat.licenses || []
  const tags = (() => {
    const raw = beat.tags
    if (!raw) return []
    if (Array.isArray(raw)) {
      // Si el array tiene un único elemento que parece JSON, re-parsearlo
      if (raw.length === 1 && typeof raw[0] === 'string') {
        const first = raw[0].trim()
        if (first.startsWith('[')) {
          try {
            const parsed = JSON.parse(first)
            if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean)
          } catch { /* fall through */ }
        }
      }
      return raw.map(t => String(t).trim()).filter(Boolean)
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          return Array.isArray(parsed) ? parsed.map(t => String(t).trim()).filter(Boolean) : []
        } catch { /* fall through */ }
      }
      return trimmed.split(',').map(t => t.trim()).filter(Boolean)
    }
    return []
  })()

  return (
    <section className="beat-detail">
      {/* Back button */}
      <Link to="/beats" className="beat-detail__back-link">
        <FontAwesomeIcon icon={['fas', 'arrow-left']} />
        Beats
      </Link>

      <div className="beat-detail__layout">
        {/* ========== LEFT SIDEBAR ========== */}
        <aside className="beat-detail__sidebar">
          {/* Cover hero – image + player overlaid on mobile */}
          <div className="beat-detail__cover-hero">
            <div className="beat-detail__cover-wrapper">
              <LazyImage src={imageUrl} alt={`Portada de ${beat.title}`} className="beat-detail__cover" />
            </div>

            {/* Title & Producer (overlaid on cover on mobile) */}
            <div className="beat-detail__cover-meta">
              <h1 className="beat-detail__title">{beat.title}</h1>
              {producerName && (
                <p className="beat-detail__producer">
                  {producerName}
                  {colaboradores.length > 0 && `, ${colaboradores.join(', ')}`}
                </p>
              )}
            </div>

            {/* Audio player bar */}
            {audioUrl && (
              <div className="beat-detail__player">
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
                <button
                  className={`beat-detail__player-play ${isPlaying ? 'playing' : ''} ${!audioUrl ? 'disabled' : ''}`}
                  onClick={handlePlayPause}
                  disabled={!audioUrl}
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  type="button"
                >
                  <FontAwesomeIcon icon={['fas', isPlaying ? 'pause' : 'play']} />
                </button>
                <div className="beat-detail__player-right">
                  <div className="beat-detail__player-timeline">
                    <span className="beat-detail__player-time">{fmt(currentTime)}</span>
                    <div className="beat-detail__player-progress-wrap">
                      <div
                        className="beat-detail__player-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                      <input
                        type="range"
                        className="beat-detail__player-seek"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        disabled={!audioUrl}
                        onMouseDown={handleSeekStart}
                        onTouchStart={handleSeekStart}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekEnd}
                        onTouchEnd={handleSeekEnd}
                        aria-label="Posición de reproducción"
                      />
                    </div>
                    <span className="beat-detail__player-time beat-detail__player-time--total">{fmt(duration)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags chips – shown just below cover on mobile, hidden on desktop (shown in tags-section) */}
          {tags.length > 0 && (
            <div className="beat-detail__cover-tags">
              {tags.map((tag, i) => (
                <span key={i} className="beat-detail__tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Mobile-only CTA: buy + download stacked full width */}
          <div className="beat-detail__mobile-cta">
            <button
              className="beat-detail__mobile-buy-btn"
              disabled={!selectedLicense}
              onClick={openCheckout}
              type="button"
            >
              <FontAwesomeIcon icon={['fas', 'bag-shopping']} />
              {selectedLicense
                ? `Comprar desde $${selectedLicense.price.toFixed(2)}`
                : 'Selecciona una licencia'}
            </button>
            {audioUrl && (
              <button
                className="beat-detail__download-btn"
                onClick={() => setIsDownloadDialogOpen(true)}
                type="button"
              >
                <FontAwesomeIcon icon={['fas', 'download']} />
                Descargar gratis
              </button>
            )}
          </div>

          {/* Download free button */}
          {audioUrl && (
            <button
              className="beat-detail__download-btn"
              onClick={() => setIsDownloadDialogOpen(true)}
              type="button"
            >
              <FontAwesomeIcon icon={['fas', 'download']} />
              Descargar gratis
            </button>
          )}

          {/* Information */}
          <div className="beat-detail__info-section">
            <button
              className="beat-detail__info-toggle"
              onClick={() => setIsInfoExpanded(p => !p)}
              type="button"
              aria-expanded={isInfoExpanded}
            >
              <h3 className="beat-detail__info-title">Información</h3>
              <FontAwesomeIcon
                icon={['fas', 'chevron-down']}
                className={`beat-detail__info-chevron${isInfoExpanded ? ' expanded' : ''}`}
              />
            </button>
            <div className={`beat-detail__info-content${isInfoExpanded ? ' open' : ''}`}>
            <div className="beat-detail__info-grid">
              {beat.createdAt && (
                <div className="beat-detail__info-item">
                  <span className="beat-detail__info-icon"><FontAwesomeIcon icon={['fas', 'calendar-days']} /></span>
                  <span className="beat-detail__info-label">Publicado</span>
                  <span className="beat-detail__info-value">{formatDate(beat.createdAt)}</span>
                </div>
              )}
              {beat.bpm && (
                <div className="beat-detail__info-item">
                  <span className="beat-detail__info-icon"><FontAwesomeIcon icon={['fas', 'gauge-high']} /></span>
                  <span className="beat-detail__info-label">BPM</span>
                  <span className="beat-detail__info-value">{beat.bpm}</span>
                </div>
              )}
              {beat.key && (
                <div className="beat-detail__info-item">
                  <span className="beat-detail__info-icon"><FontAwesomeIcon icon={['fas', 'music']} /></span>
                  <span className="beat-detail__info-label">Tonalidad</span>
                  <span className="beat-detail__info-value">{beat.key}</span>
                </div>
              )}
              {beat.plays !== undefined && (
                <div className="beat-detail__info-item">
                  <span className="beat-detail__info-icon"><FontAwesomeIcon icon={['fas', 'headphones']} /></span>
                  <span className="beat-detail__info-label">Reproducciones</span>
                  <span className="beat-detail__info-value">
                    {beat.plays >= 1000 ? `${(beat.plays / 1000).toFixed(1)}k` : beat.plays}
                  </span>
                </div>
              )}
              {beat.genre && (
                <div className="beat-detail__info-item">
                  <span className="beat-detail__info-icon"><FontAwesomeIcon icon={['fas', 'guitar']} /></span>
                  <span className="beat-detail__info-label">Género</span>
                  <span className="beat-detail__info-value">{beat.genre}</span>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="beat-detail__tags-section">
              <h3 className="beat-detail__info-title">Tags</h3>
              <div className="beat-detail__tags">
                {tags.map((tag, i) => (
                  <span key={i} className="beat-detail__tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {beat.description && (
            <div className="beat-detail__about-section">
              <h3 className="beat-detail__info-title">Acerca de</h3>
              <p className="beat-detail__about-text">{beat.description}</p>
            </div>
          )}
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <div className="beat-detail__main">
          {/* Licensing Header */}
          <div className="beat-detail__licensing-header">
            <h2 className="beat-detail__section-title">Licencias</h2>
            <button
              className="beat-detail__buy-now-btn"
              onClick={openCheckout}
              type="button"
            >
              {selectedLicense
                ? `Comprar desde $${selectedLicense.price.toFixed(2)}`
                : 'Comprar ahora'}
            </button>
          </div>

          {/* License selection – desktop only */}
          <div className="beat-detail__desktop-licenses">
            {licenses.length > 0 ? (
              <div className="beat-detail__licenses-grid">
                {licenses.slice(0, visibleLicenses).map((license) => (
                  <div
                    key={license.id}
                    className={`beat-detail__license-card ${selectedLicense?.id === license.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedLicense(license)
                      setExpandedTerms(license.id)
                    }}
                  >
                    <h3 className="beat-detail__license-name">{license.name}</h3>
                    <p className="beat-detail__license-price">${license.price.toFixed(2)}</p>
                    {license.formats && (
                      <p className="beat-detail__license-formats">
                        {license.formats.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
                {licenses.length > visibleLicenses && (
                  <button
                    className="beat-detail__view-more-licenses"
                    onClick={() => setVisibleLicenses(prev => prev + 4)}
                    type="button"
                  >
                    Ver más licencias (+{licenses.length - visibleLicenses})
                  </button>
                )}
              </div>
            ) : (
              <div className="beat-detail__no-licenses">
                <p>No hay licencias disponibles para este beat</p>
              </div>
            )}
          </div>

          {/* Términos de uso – desktop only */}
          {selectedLicense?.terms && (
            <div className="beat-detail__desktop-terms beat-detail__terms-section">
              <button
                className="beat-detail__terms-toggle"
                onClick={() => setExpandedTerms(expandedTerms === selectedLicense.id ? null : selectedLicense.id)}
                type="button"
              >
                <span>Términos de uso</span>
                <FontAwesomeIcon
                  icon={['fas', 'chevron-down']}
                  className={`beat-detail__terms-chevron ${expandedTerms === selectedLicense.id ? 'expanded' : ''}`}
                />
              </button>
              {expandedTerms === selectedLicense.id && (
                <div className="beat-detail__terms-content">
                  <p className="beat-detail__terms-license-name">{selectedLicense.name}</p>
                  <div className="beat-detail__terms-grid">
                    {selectedLicense.terms.usedForRecording !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'music']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.usedForRecording ? 'Uso para grabación musical' : 'No apto para grabación musical'}</span>
                      </div>
                    )}
                    {selectedLicense.terms.distributionLimit !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'compact-disc']} className="beat-detail__term-icon" />
                        <span>Distribución hasta {formatValue(selectedLicense.terms.distributionLimit)} copias</span>
                      </div>
                    )}
                    {selectedLicense.terms.audioStreams !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'headphones']} className="beat-detail__term-icon" />
                        <span>{formatValue(selectedLicense.terms.audioStreams)} reproducciones en streaming</span>
                      </div>
                    )}
                    {selectedLicense.terms.musicVideos !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'video']} className="beat-detail__term-icon" />
                        <span>{formatValue(selectedLicense.terms.musicVideos)} videoclip(s)</span>
                      </div>
                    )}
                    {selectedLicense.terms.forProfitPerformances !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'lock']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.forProfitPerformances ? 'Actuaciones en vivo con ánimo de lucro' : 'Sin actuaciones en vivo con ánimo de lucro'}</span>
                      </div>
                    )}
                    {selectedLicense.terms.radioBroadcasting !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'radio']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.radioBroadcasting ? `${formatValue(selectedLicense.terms.radioBroadcasting)} derechos de emisión en radio` : 'Sin derechos de emisión en radio'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Más del productor */}
          {producerName && (moreLoading || relatedBeats.length > 0) && (
            <div className="beat-detail__more-section">
              <div className="beat-detail__more-header">
                <h2 className="beat-detail__section-title">
                  Más de {producerName}
                </h2>
                <div className="beat-detail__more-controls">
                  <Link to="/beats" className="beat-detail__see-all">
                    Ver todos los beats
                  </Link>
                  <button
                    className={`beat-detail__carousel-btn ${!canScrollLeft ? 'disabled' : ''}`}
                    onClick={() => scrollCarousel(-1)}
                    disabled={!canScrollLeft}
                    type="button"
                    aria-label="Anterior"
                  >
                    <FontAwesomeIcon icon={['fas', 'arrow-left']} />
                  </button>
                  <button
                    className={`beat-detail__carousel-btn ${!canScrollRight ? 'disabled' : ''}`}
                    onClick={() => scrollCarousel(1)}
                    disabled={!canScrollRight}
                    type="button"
                    aria-label="Siguiente"
                  >
                    <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                  </button>
                </div>
              </div>

              {moreLoading ? (
                <LoadingSpinner message="Cargando más beats..." />
              ) : (
                <div className="beat-detail__carousel" ref={carouselRef}>
                  {relatedBeats.map((relBeat) => (
                    <div key={relBeat._id || relBeat.id} className="beat-detail__carousel-item">
                      <BeatCard card={relBeat} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout modal */}
      {isCheckoutModalOpen && (
        <div className="beat-checkout-modal-overlay" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="beat-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="beat-checkout-modal__header">
              <h2>Finalizar compra</h2>
              <button
                className="beat-checkout-modal__close"
                onClick={() => setIsCheckoutModalOpen(false)}
                type="button"
                aria-label="Cerrar"
              >
                <FontAwesomeIcon icon={['fas', 'times']} />
              </button>
            </div>

            {/* Beat info summary */}
            <div className="beat-checkout-modal__body">
            <div className="beat-checkout-modal__beat-info">
              <img src={beat.coverUrl || '/img/default-beat.jpg'} alt={beat.title} className="beat-checkout-modal__cover" />
              <div>
                <p className="beat-checkout-modal__beat-title">{beat.title}</p>
                <p className="beat-checkout-modal__beat-producer">{producerName}</p>
              </div>
            </div>

            {/* License selection */}
            {licenses.length > 0 ? (
              <div className="beat-checkout-modal__licenses">
                <h3 className="beat-checkout-modal__section-label">Selecciona una licencia</h3>
                <div className="beat-detail__licenses-grid">
                  {licenses.slice(0, visibleLicenses).map((license) => (
                    <div
                      key={license.id}
                      className={`beat-detail__license-card ${selectedLicense?.id === license.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedLicense(license)
                        setExpandedTerms(license.id)
                      }}
                    >
                      <h3 className="beat-detail__license-name">{license.name}</h3>
                      <p className="beat-detail__license-price">${license.price.toFixed(2)}</p>
                      {license.formats && (
                        <p className="beat-detail__license-formats">
                          {license.formats.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                  {licenses.length > visibleLicenses && (
                    <button
                      className="beat-detail__view-more-licenses"
                      onClick={() => setVisibleLicenses(prev => prev + 4)}
                      type="button"
                    >
                      Ver más licencias (+{licenses.length - visibleLicenses})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="beat-detail__no-licenses">
                <p>No hay licencias disponibles para este beat</p>
              </div>
            )}

            {/* Términos de uso */}
            {selectedLicense?.terms && (
              <div className="beat-checkout-modal__terms">
                <button
                  className="beat-detail__terms-toggle"
                  onClick={() => setExpandedTerms(expandedTerms === selectedLicense.id ? null : selectedLicense.id)}
                  type="button"
                >
                  <span className="beat-checkout-modal__section-label">Términos de uso — {selectedLicense.name}</span>
                  <FontAwesomeIcon
                    icon={['fas', 'chevron-down']}
                    className={`beat-detail__terms-chevron ${expandedTerms === selectedLicense.id ? 'expanded' : ''}`}
                  />
                </button>
                {expandedTerms === selectedLicense.id && (
                  <div className="beat-detail__terms-grid beat-checkout-modal__terms-grid">
                    {selectedLicense.terms.usedForRecording !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'music']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.usedForRecording ? 'Uso para grabación musical' : 'No apto para grabación musical'}</span>
                      </div>
                    )}
                    {selectedLicense.terms.distributionLimit !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'compact-disc']} className="beat-detail__term-icon" />
                        <span>Distribución hasta {formatValue(selectedLicense.terms.distributionLimit)} copias</span>
                      </div>
                    )}
                    {selectedLicense.terms.audioStreams !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'headphones']} className="beat-detail__term-icon" />
                        <span>{formatValue(selectedLicense.terms.audioStreams)} reproducciones en streaming</span>
                      </div>
                    )}
                    {selectedLicense.terms.musicVideos !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'video']} className="beat-detail__term-icon" />
                        <span>{formatValue(selectedLicense.terms.musicVideos)} videoclip(s)</span>
                      </div>
                    )}
                    {selectedLicense.terms.forProfitPerformances !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'lock']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.forProfitPerformances ? 'Actuaciones en vivo con ánimo de lucro' : 'Sin actuaciones en vivo con ánimo de lucro'}</span>
                      </div>
                    )}
                    {selectedLicense.terms.radioBroadcasting !== undefined && (
                      <div className="beat-detail__term-item">
                        <FontAwesomeIcon icon={['fas', 'radio']} className="beat-detail__term-icon" />
                        <span>{selectedLicense.terms.radioBroadcasting ? `${formatValue(selectedLicense.terms.radioBroadcasting)} derechos de emisión en radio` : 'Sin derechos de emisión en radio'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Customer form */}
            <div className="beat-checkout-modal__form">
              <h3 className="beat-checkout-modal__form-title">Información del comprador</h3>
              <div className="beat-checkout-modal__fields">
                <div className="beat-detail__form-group">
                  <label className="beat-checkout-modal__label">Nombre completo <span className="beat-checkout-modal__required">*</span></label>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={customerName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    className={formErrors.name ? 'error' : touchedFields.name && !formErrors.name && customerName.trim().length >= 2 ? 'valid' : ''}
                    autoFocus
                  />
                  {formErrors.name && (
                    <span className="beat-detail__form-error">
                      <FontAwesomeIcon icon={['fas', 'circle-exclamation']} />
                      {formErrors.name}
                    </span>
                  )}
                </div>
                <div className="beat-detail__form-group">
                  <label className="beat-checkout-modal__label">Email <span className="beat-checkout-modal__required">*</span></label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={customerEmail}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={formErrors.email ? 'error' : touchedFields.email && !formErrors.email && customerEmail.trim() ? 'valid' : ''}
                  />
                  {formErrors.email && (
                    <span className="beat-detail__form-error">
                      <FontAwesomeIcon icon={['fas', 'circle-exclamation']} />
                      {formErrors.email}
                    </span>
                  )}
                  <small className="beat-checkout-modal__hint">
                    <FontAwesomeIcon icon={['fas', 'envelope']} />
                    Recibirás el beat en este email tras completar la compra
                  </small>
                </div>
              </div>
            </div>

            </div> {/* /body */}

            <div className="beat-checkout-modal__actions">
              <button
                className="beat-checkout-modal__cancel"
                onClick={() => setIsCheckoutModalOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="beat-checkout-modal__confirm"
                onClick={handleBuyNow}
                disabled={purchaseLoading || !selectedLicense}
                type="button"
              >
                {purchaseLoading ? 'Procesando...' : selectedLicense ? `Proceder al pago · ${selectedLicense.price.toFixed(2)}€` : 'Selecciona una licencia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download dialog */}
      {isDownloadDialogOpen && (
        <div className="beat-download-dialog-overlay" onClick={() => setIsDownloadDialogOpen(false)}>
          <div className="beat-download-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="beat-download-dialog__icon">
              <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} />
            </div>
            <h3 className="beat-download-dialog__title">Solo uso personal</h3>
            <p className="beat-download-dialog__body">
              Este beat se descarga <strong>sin licencia comercial</strong>. Solo puedes utilizarlo
              para uso personal, demos privadas o práctica. <strong>Queda prohibido</strong> su uso
              en publicaciones, distribución, streaming o cualquier proyecto comercial sin adquirir
              una licencia.
            </p>
            <p className="beat-download-dialog__sub">
              Si necesitas una licencia, selecciona una arriba para ver las opciones disponibles.
            </p>
            <div className="beat-download-dialog__footer">
              <button
                className="beat-download-dialog__cancel"
                onClick={() => setIsDownloadDialogOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="beat-download-dialog__confirm"
                onClick={handleConfirmDownload}
                type="button"
              >
                <FontAwesomeIcon icon={['fas', 'file-arrow-down']} />
                Entendido, descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BeatDetalle
