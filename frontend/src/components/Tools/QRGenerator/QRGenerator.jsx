import { useState, useRef } from 'react'
import QRCode from 'react-qr-code'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './QRGenerator.module.css'

const SIZES = [128, 192, 256, 320]
const ERROR_LEVELS = [
  { value: 'L', label: 'L — Baja (7%)' },
  { value: 'M', label: 'M — Media (15%)' },
  { value: 'Q', label: 'Q — Alta (25%)' },
  { value: 'H', label: 'H — Máxima (30%)' },
]

export default function QRGenerator () {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [errorLevel, setErrorLevel] = useState('M')
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  const hasContent = text.trim().length > 0

  const downloadPNG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = 'qr-code.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
  }

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.download = 'qr-code.svg'
    a.href = URL.createObjectURL(blob)
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copyText = async () => {
    if (!hasContent) return
    await navigator.clipboard.writeText(text.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.qr}>
      <div className={styles.qr__layout}>

        <section className={styles.qr__controls}>
          <div className={styles.qr__field}>
            <label className={styles.qr__label}>Contenido del QR</label>
            <div className={styles.qr__inputRow}>
              <textarea
                className={styles.qr__textarea}
                placeholder="URL, texto, teléfono, email…"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
              />
              <button
                className={styles.qr__iconBtn}
                onClick={copyText}
                title="Copiar contenido"
                disabled={!hasContent}
              >
                <FontAwesomeIcon icon={['fas', copied ? 'check' : 'copy']} />
              </button>
            </div>
          </div>

          <div className={styles.qr__row}>
            <div className={styles.qr__field}>
              <label className={styles.qr__label}>Tamaño</label>
              <div className={styles.qr__chips}>
                {SIZES.map(s => (
                  <button
                    key={s}
                    className={`${styles.qr__chip} ${size === s ? styles['qr__chip--active'] : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.qr__row}>
            <div className={styles.qr__field}>
              <label className={styles.qr__label}>Color principal</label>
              <div className={styles.qr__colorRow}>
                <input
                  type="color"
                  className={styles.qr__colorPicker}
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                />
                <span className={styles.qr__colorHex}>{fgColor}</span>
              </div>
            </div>

            <div className={styles.qr__field}>
              <label className={styles.qr__label}>Color de fondo</label>
              <div className={styles.qr__colorRow}>
                <input
                  type="color"
                  className={styles.qr__colorPicker}
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                />
                <span className={styles.qr__colorHex}>{bgColor}</span>
              </div>
            </div>
          </div>

          <div className={styles.qr__field}>
            <label className={styles.qr__label}>Corrección de errores</label>
            <select
              className={styles.qr__select}
              value={errorLevel}
              onChange={e => setErrorLevel(e.target.value)}
            >
              {ERROR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </section>

        <section className={styles.qr__preview}>
          <div
            ref={qrRef}
            className={styles.qr__canvas}
            style={{ background: hasContent ? bgColor : '#1a1a1a' }}
          >
            {hasContent
              ? (
                <QRCode
                  value={text.trim()}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={errorLevel}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
                )
              : (
                <div className={styles.qr__placeholder}>
                  <FontAwesomeIcon icon={['fas', 'qrcode']} />
                  <span>Escribe algo para generar el QR</span>
                </div>
                )}
          </div>

          {hasContent && (
            <div className={styles.qr__actions}>
              <button className={styles.qr__btn} onClick={downloadPNG}>
                <FontAwesomeIcon icon={['fas', 'download']} />
                Descargar PNG
              </button>
              <button className={`${styles.qr__btn} ${styles['qr__btn--secondary']}`} onClick={downloadSVG}>
                <FontAwesomeIcon icon={['fas', 'file-code']} />
                Descargar SVG
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
