import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BeatLicenseModal from '../BeatLicenseModal/BeatLicenseModal'
import { useBeatPurchase } from '../../hooks/useBeatPurchase'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import LazyImage from '../LazyImage/LazyImage'
import './BeatListRow.css'

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function BeatListRow ({ card }) {
  const imageUrl = card.coverUrl || '/img/default-beat.jpg'
  const isFree = !card.price || card.price === 0
  const hasLicenses = card.licenses && card.licenses.length > 0
  const audioUrl = card.licenses?.find(l => l.files?.mp3Url)?.files?.mp3Url || null
  const producer = typeof card.producer === 'object' ? card.producer?.name : card.producer
  // Colaboradores: array de nombres
  const collaborators = Array.isArray(card.colaboradores)
    ? card.colaboradores.filter(Boolean)
    : (typeof card.colaboradores === 'string' && card.colaboradores)
      ? [card.colaboradores]
      : []
  const beatId = card._id || card.id

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const audioRef = useRef(null)
  const { createCheckoutSession, loading, error } = useBeatPurchase()

  let audioPlayerContext
  try {
    audioPlayerContext = useAudioPlayer()
  } catch {
    audioPlayerContext = {
      currentPlaying: null,
      registerAudio: () => {},
      unregisterAudio: () => {},
      playAudio: () => {},
      pauseAudio: () => {}
    }
  }
  const { currentPlaying, registerAudio, unregisterAudio, playAudio, pauseAudio } = audioPlayerContext

  // Registrar / desregistrar audio
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      registerAudio(beatId, audioRef.current)
    }
    return () => { if (audioUrl) unregisterAudio(beatId) }
  }, [beatId, audioUrl, registerAudio, unregisterAudio])

  // Sincronizar estado de reproducción con contexto global
  useEffect(() => {
    setIsPlaying(currentPlaying === beatId)
  }, [currentPlaying, beatId])

  // Eventos de audio
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
    isPlaying ? pauseAudio(beatId) : playAudio(beatId)
  }, [isPlaying, beatId, playAudio, pauseAudio])

  // Seek handlers
  const handleSeekStart = () => setIsSeeking(true)
  const handleSeekChange = (e) => setCurrentTime(Number(e.target.value))
  const handleSeekEnd = (e) => {
    const val = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = val
    setCurrentTime(val)
    setIsSeeking(false)
  }

  const handleDownloadClick = (e) => {
    e.stopPropagation()
    setIsDownloadDialogOpen(true)
  }

  const handleConfirmDownload = async () => {
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${card.title || 'beat'}.mp3`
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

  const handlePurchaseClick = () => {
    if (isFree) {
      if (card.audioUrl) window.open(card.audioUrl, '_blank')
    } else if (hasLicenses) {
      setIsModalOpen(true)
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
    } catch {
      alert(error || 'Error al procesar la compra.')
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <article className={`beat-list-row ${isPlaying ? 'beat-list-row--playing' : ''}`}>

        {/* Thumbnail */}
        <div className="beat-list-row__thumb">
          <LazyImage src={imageUrl} alt={`Portada de ${card.title}`} />
        </div>

        {/* Play/Pause */}
        <button
          className={`beat-list-row__play ${isPlaying ? 'playing' : ''} ${!audioUrl ? 'disabled' : ''}`}
          onClick={handlePlayPause}
          disabled={!audioUrl}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          type="button"
        >
          <FontAwesomeIcon icon={['fas', isPlaying ? 'pause' : 'play']} />
        </button>

        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

        {/* Info + timeline */}
        <div className="beat-list-row__center">
          <div className="beat-list-row__info">
            <Link to={`/beats/${beatId}`} className="beat-list-row__title-link">
              <span className="beat-list-row__title">{card.title}</span>
            </Link>
            <div className="beat-list-row__info-meta">
              {producer && (
                <span className="beat-list-row__producer">
                  Prod. by {producer}
                  {collaborators.length > 0 && (
                    <span>
                      {', '}
                      {collaborators.join(', ')}
                    </span>
                  )}
                </span>
              )}
              {card.genre && <span className="beat-list-row__tag">{card.genre}</span>}
              {card.bpm && <span className="beat-list-row__dot">{card.bpm} BPM</span>}
              {card.key && <span className="beat-list-row__dot">{card.key}</span>}
            </div>
          </div>

          {/* Timeline */}
          <div className="beat-list-row__timeline">
            <span className="beat-list-row__time">{fmt(currentTime)}</span>
            <div className="beat-list-row__progress-wrap">
              <div
                className="beat-list-row__progress-fill"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                className="beat-list-row__seek"
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
            <span className="beat-list-row__time beat-list-row__time--total">{fmt(duration)}</span>
          </div>
        </div>

        {/* Precio + acción */}
        <div className="beat-list-row__actions">
          {!isFree && (
            <span className="beat-list-row__price">
              {Number(card.price).toFixed(2)} €
            </span>
          )}
          {audioUrl && (
            <button
              className="beat-list-row__download-btn"
              onClick={handleDownloadClick}
              type="button"
              aria-label="Descargar MP3 (uso personal)"
              title="Descargar MP3 (uso personal)"
            >
              <FontAwesomeIcon icon={['fas', 'file-arrow-down']} />
            </button>
          )}
          <button
            className="beat-list-row__buy"
            onClick={handlePurchaseClick}
            disabled={loading}
            type="button"
          >
            <FontAwesomeIcon icon={['fas', isFree ? 'download' : 'shopping-cart']} />
            <span>{loading ? '...' : isFree ? 'Free' : 'Comprar'}</span>
          </button>
        </div>
      </article>

      <BeatLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        beat={card}
        onPurchase={handlePurchase}
      />

      {/* Dialog de aviso de uso personal */}
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
              Si necesitas una licencia, pulsa «Comprar» para ver las opciones disponibles.
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
    </>
  )
}

export default BeatListRow
