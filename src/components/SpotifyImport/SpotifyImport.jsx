import { useState, useEffect } from 'react'
import { useSpotifyImport } from '../../hooks/useSpotifyImport'
import { isValidSpotifyUrl, getSpotifyUrlType, mapSpotifyTypeToAppType } from '../../utils/spotifyHelpers'
import { getSpotifyHistory, addToSpotifyHistory, clearSpotifyHistory, formatHistoryDate } from '../../utils/spotifyHistory'
import SpotifyBulkImport from './SpotifyBulkImport'
import './SpotifyImport.css'

/**
 * Componente para importar datos desde Spotify con funcionalidades avanzadas
 * 
 * Características principales:
 * - Validación en tiempo real de URLs de Spotify
 * - Auto-detección de contenido pegado desde portapapeles
 * - Historial de importaciones con persistencia en localStorage
 * - Importación masiva mediante modal
 * - Integración completa con API de Spotify
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onDataImported - Callback ejecutado cuando se importan datos exitosamente
 *                                          Recibe los datos importados como parámetro
 * @param {('artist'|'release')} [props.type='artist'] - Tipo de contenido a importar
 *                                                       'artist' para artistas, 'release' para álbumes/tracks
 * 
 * @example
 * // Importación de artista
 * <SpotifyImport 
 *   type="artist" 
 *   onDataImported={(data) => console.log('Artista importado:', data)} 
 * />
 * 
 * @example
 * // Importación de álbum/track
 * <SpotifyImport 
 *   type="release" 
 *   onDataImported={(data) => setFormData(prev => ({...prev, ...data}))} 
 * />
 * 
 * @returns {JSX.Element} Componente de importación de Spotify
 */
function SpotifyImport ({ onDataImported, type = 'artist' }) {
  const [url, setUrl] = useState('')
  const [urlValid, setUrlValid] = useState(false)
  const [urlTypeMatch, setUrlTypeMatch] = useState(true)
  const [showAutoImportSuggestion, setShowAutoImportSuggestion] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [showBulkImport, setShowBulkImport] = useState(false)
  const { importFromSpotify, loading, error, data, reset } = useSpotifyImport()

  // Cargar historial al montar el componente
  useEffect(() => {
    const savedHistory = getSpotifyHistory()
    const filteredHistory = savedHistory.filter(item => item.type === type)
    setHistory(filteredHistory)
  }, [type])

  // Validar URL en tiempo real
  useEffect(() => {
    if (!url.trim()) {
      setUrlValid(false)
      setUrlTypeMatch(true)
      return
    }

    const isValid = isValidSpotifyUrl(url)
    setUrlValid(isValid)

    if (isValid) {
      const spotifyType = getSpotifyUrlType(url)
      const appType = mapSpotifyTypeToAppType(spotifyType)
      setUrlTypeMatch(appType === type)
    } else {
      setUrlTypeMatch(true)
    }
  }, [url, type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim() || !urlValid) return

    try {
      await importFromSpotify(url.trim(), type)
    } catch (err) {
      // Error ya manejado por el hook
    }
  }

  const handleReset = () => {
    setUrl('')
    setShowAutoImportSuggestion(false)
    reset()
  }

  // Manejar paste automático
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text')
    if (isValidSpotifyUrl(pastedText)) {
      const spotifyType = getSpotifyUrlType(pastedText)
      const appType = mapSpotifyTypeToAppType(spotifyType)
      
      if (appType === type) {
        setShowAutoImportSuggestion(true)
        // Auto-importar después de un pequeño delay para mejor UX
        setTimeout(() => {
          if (pastedText.trim() && isValidSpotifyUrl(pastedText)) {
            handleAutoImport(pastedText)
          }
        }, 500)
      }
    }
  }

  const handleAutoImport = async (spotifyUrl) => {
    try {
      await importFromSpotify(spotifyUrl.trim(), type)
      setShowAutoImportSuggestion(false)
    } catch (err) {
      setShowAutoImportSuggestion(false)
    }
  }

  const dismissSuggestion = () => {
    setShowAutoImportSuggestion(false)
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const selectFromHistory = async (historyItem) => {
    setUrl(historyItem.url)
    setShowHistory(false)
    
    try {
      const importedData = await importFromSpotify(historyItem.url, type)
      
      // Actualizar el historial con el nombre correcto si es necesario
      if (importedData) {
        let name = 'Contenido de Spotify' // fallback
        
        if (importedData.data) {
          const actualData = importedData.data
          if (type === 'artist') {
            name = actualData.name || 'Artista sin nombre'
          } else if (type === 'release') {
            name = actualData.title || actualData.name || 'Release sin título'
          }
        } else {
          if (type === 'artist') {
            name = importedData.name || 'Artista sin nombre'
          } else if (type === 'release') {
            name = importedData.title || importedData.name || 'Release sin título'
          }
        }
        
        // Actualizar historial si el nombre es diferente
        if (name !== historyItem.name && name !== 'Contenido de Spotify') {
          addToSpotifyHistory(historyItem.url, type, name)
          
          // Actualizar historial local
          const savedHistory = getSpotifyHistory()
          const filteredHistory = savedHistory.filter(item => item.type === type)
          setHistory(filteredHistory)
        }
      }
    } catch (err) {
      // Error ya manejado por el hook
    }
  }

  const clearHistory = () => {
    clearSpotifyHistory()
    setHistory([])
    setShowHistory(false)
  }

  // Llamar callback cuando hay datos
  useEffect(() => {
    if (data && onDataImported) {
      onDataImported(data)
      
      // Extraer nombre correcto según el tipo y estructura de datos
      let name = 'Contenido de Spotify' // fallback
      
      if (data.data) {
        // Los datos están en data.data
        const actualData = data.data
        if (type === 'artist') {
          name = actualData.name || 'Artista sin nombre'
        } else if (type === 'release') {
          name = actualData.title || actualData.name || 'Release sin título'
        }
      } else {
        // Los datos están directamente en data
        if (type === 'artist') {
          name = data.name || 'Artista sin nombre'
        } else if (type === 'release') {
          name = data.title || data.name || 'Release sin título'
        }
      }
      
      console.log('💾 Guardando en historial:', { url, type, name })
      
      // Guardar en historial con el nombre correcto
      addToSpotifyHistory(url, type, name)
      
      // Actualizar historial local
      const savedHistory = getSpotifyHistory()
      const filteredHistory = savedHistory.filter(item => item.type === type)
      setHistory(filteredHistory)
    }
  }, [data, onDataImported, url, type])

  const getPlaceholder = () => {
    if (type === 'artist') {
      return 'https://open.spotify.com/artist/...'
    }
    return 'https://open.spotify.com/album/... o https://open.spotify.com/track/...'
  }

  const canSubmit = url.trim() && urlValid && urlTypeMatch && !loading

  return (
    <div className="spotify-import">
      <div className="spotify-import-header">
        <h3>Importar desde Spotify</h3>
        <p>Pega el enlace de Spotify para autocompletar los campos</p>
        <div className="header-actions">
          {history.length > 0 && (
            <button
              type="button"
              onClick={toggleHistory}
              className="history-toggle-btn"
            >
              {showHistory ? 'Ocultar' : 'Ver'} historial ({history.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowBulkImport(true)}
            className="bulk-import-toggle-btn"
          >
            Importación masiva
          </button>
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="spotify-history">
          <div className="spotify-history-header">
            <h4>Importaciones recientes</h4>
            <button
              type="button"
              onClick={clearHistory}
              className="clear-history-btn"
            >
              Limpiar todo
            </button>
          </div>
          <div className="spotify-history-list">
            {history.map((item, index) => (
              <div
                key={index}
                className="spotify-history-item"
                onClick={() => selectFromHistory(item)}
              >
                <div className="history-item-info">
                  <span className="history-item-name" title={item.name}>
                    {item.name}
                  </span>
                  <span className="history-item-date">{formatHistoryDate(item.timestamp)}</span>
                </div>
                <div className="history-item-meta">
                  <span className="history-item-type">
                    {type === 'artist' ? '👨‍🎤' : '🎵'} {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="spotify-import-form">
        <div className="spotify-input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={`spotify-url-input ${url && !urlValid ? 'invalid' : ''} ${url && urlValid && !urlTypeMatch ? 'type-mismatch' : ''}`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="spotify-import-btn"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>

        {showAutoImportSuggestion && (
          <div className="spotify-auto-suggestion">
            <p>🎵 ¡URL de Spotify detectada! Importando automáticamente...</p>
            <button type="button" onClick={dismissSuggestion} className="dismiss-btn">
              ✕
            </button>
          </div>
        )}

        {url && !urlValid && (
          <div className="spotify-validation-error">
            <p>⚠️ URL de Spotify no válida</p>
          </div>
        )}

        {url && urlValid && !urlTypeMatch && (
          <div className="spotify-validation-error">
            <p>⚠️ Esta URL no es compatible con el tipo de contenido seleccionado ({type})</p>
          </div>
        )}

        {error && (
          <div className="spotify-error">
            <p>{error}</p>
            <button type="button" onClick={handleReset} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {data && (
          <div className="spotify-success">
            <p>✓ Datos importados correctamente</p>
            <button type="button" onClick={handleReset} className="import-again-btn">
              Importar otro
            </button>
          </div>
        )}
      </form>

      {/* Modal de importación masiva */}
      {showBulkImport && (
        <div className="bulk-import-modal">
          <div className="bulk-import-overlay" onClick={() => setShowBulkImport(false)} />
          <SpotifyBulkImport
            onDataImported={onDataImported}
            type={type}
            onClose={() => setShowBulkImport(false)}
          />
        </div>
      )}
    </div>
  )
}

export default SpotifyImport
