import { useState, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { analyzeAudio } from '../../../utils/audioAnalysis.js'
import styles from './AudioAnalyzer.module.css'

const ACCEPTED = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac', 'audio/x-m4a']
const MAX_MB   = 80

function formatDuration (secs) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AudioAnalyzer () {
  const [phase,    setPhase]    = useState('idle')   // idle | ready | analyzing | done | error
  const [file,     setFile]     = useState(null)
  const [results,  setResults]  = useState(null)
  const [error,    setError]    = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const acceptFile = useCallback((f) => {
    if (!f) return
    const okType = ACCEPTED.some(t => f.type === t) || f.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)
    if (!okType) { setError('Formato no compatible. Usa MP3, WAV, OGG, FLAC o M4A.'); setPhase('error'); return }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`El archivo supera el límite de ${MAX_MB} MB.`); setPhase('error'); return }
    setFile(f)
    setResults(null)
    setError('')
    setPhase('ready')
  }, [])

  const onInputChange = (e) => acceptFile(e.target.files?.[0])
  const onDrop        = (e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]) }
  const onDragOver    = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave   = ()  => setDragging(false)

  const handleAnalyze = async () => {
    if (!file) return
    setPhase('analyzing')
    // Yield to React so loading state renders before heavy computation
    await new Promise(r => setTimeout(r, 60))
    try {
      const buf  = await file.arrayBuffer()
      const data = await analyzeAudio(buf)
      setResults(data)
      setPhase('done')
    } catch (e) {
      setError('No se pudo analizar el archivo. Comprueba que es un audio válido.')
      setPhase('error')
    }
  }

  const reset = () => { setPhase('idle'); setFile(null); setResults(null); setError(''); if (inputRef.current) inputRef.current.value = '' }

  return (
    <div className={styles.aa}>

      {/* ── Dropzone / file ready ── */}
      {(phase === 'idle' || phase === 'ready' || phase === 'error') && (
        <div
          className={`${styles.aa__drop} ${dragging ? styles['aa__drop--over'] : ''} ${phase === 'ready' ? styles['aa__drop--loaded'] : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".mp3,.wav,.ogg,.flac,.m4a,.aac" className={styles.aa__input} onChange={onInputChange} />

          {phase === 'ready'
            ? (
              <div className={styles.aa__fileInfo}>
                <FontAwesomeIcon icon={['fas', 'file-audio']} className={styles.aa__fileIcon} />
                <span className={styles.aa__fileName}>{file.name}</span>
                <span className={styles.aa__fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              )
            : (
              <div className={styles.aa__dropContent}>
                <FontAwesomeIcon icon={['fas', 'cloud-upload-alt']} className={styles.aa__dropIcon} />
                <p className={styles.aa__dropTitle}>Arrastra un archivo de audio</p>
                <p className={styles.aa__dropSub}>o haz clic para seleccionarlo</p>
                <span className={styles.aa__dropFormats}>MP3 · WAV · OGG · FLAC · M4A · hasta {MAX_MB} MB</span>
              </div>
              )}
        </div>
      )}

      {/* ── Error message ── */}
      {phase === 'error' && (
        <div className={styles.aa__error}>
          <FontAwesomeIcon icon={['fas', 'exclamation-circle']} />
          {error}
        </div>
      )}

      {/* ── Actions ── */}
      {(phase === 'ready' || phase === 'done') && (
        <div className={styles.aa__actions}>
          <button className={styles.aa__btn} onClick={handleAnalyze} disabled={phase === 'analyzing'}>
            <FontAwesomeIcon icon={['fas', 'gauge-high']} />
            {phase === 'done' ? 'Analizar de nuevo' : 'Analizar'}
          </button>
          <button className={`${styles.aa__btn} ${styles['aa__btn--ghost']}`} onClick={reset}>
            <FontAwesomeIcon icon={['fas', 'times']} />
            Cambiar archivo
          </button>
        </div>
      )}

      {/* ── Analyzing ── */}
      {phase === 'analyzing' && (
        <div className={styles.aa__loading}>
          <FontAwesomeIcon icon={['fas', 'spinner']} spin className={styles.aa__spinner} />
          <p className={styles.aa__loadingTitle}>Analizando…</p>
          <p className={styles.aa__loadingSub}>Calculando BPM y tonalidad</p>
        </div>
      )}

      {/* ── Results ── */}
      {phase === 'done' && results && (
        <div className={styles.aa__results}>
          <div className={styles.aa__card}>
            <span className={styles.aa__cardLabel}>
              <FontAwesomeIcon icon={['fas', 'gauge-high']} /> BPM
            </span>
            <span className={styles.aa__cardValue}>{results.bpm}</span>
            <div className={styles.aa__bar}>
              <div className={styles.aa__barFill} style={{ width: `${results.bpmConfidence}%` }} />
            </div>
            <span className={styles.aa__cardHint}>{results.bpmConfidence}% de confianza</span>
          </div>

          <div className={styles.aa__card}>
            <span className={styles.aa__cardLabel}>
              <FontAwesomeIcon icon={['fas', 'music']} /> Tonalidad
            </span>
            <span className={styles.aa__cardValue}>
              {results.key}
              <span className={styles.aa__cardMode}>{results.mode}</span>
            </span>
            <div className={styles.aa__bar}>
              <div className={styles.aa__barFill} style={{ width: `${results.keyConfidence}%` }} />
            </div>
            <span className={styles.aa__cardHint}>{results.keyConfidence}% de confianza</span>
          </div>

          <div className={`${styles.aa__card} ${styles['aa__card--meta']}`}>
            <span className={styles.aa__cardLabel}>
              <FontAwesomeIcon icon={['fas', 'file-audio']} /> Archivo
            </span>
            <span className={styles.aa__metaName}>{file.name}</span>
            <span className={styles.aa__metaDur}>{formatDuration(results.duration)}</span>
            <span className={styles.aa__cardHint}>Análisis de los primeros 30 s</span>
          </div>
        </div>
      )}
    </div>
  )
}
