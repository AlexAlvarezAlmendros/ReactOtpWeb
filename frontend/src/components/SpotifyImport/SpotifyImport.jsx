import { useState, useEffect } from 'react'
import { useSpotifyImport } from '../../hooks/useSpotifyImport'
import { isValidSpotifyUrl, getSpotifyUrlType, mapSpotifyTypeToAppType } from '../../utils/spotifyHelpers'
import './SpotifyImport.css'

/**
 * Componente para importar datos desde Spotify
 * 
 * Características principales:
 * - Validación en tiempo real de URLs de Spotify
 * - Auto-detección de contenido pegado desde portapapeles
 * - Integración completa con API de Spotify
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onDataImported - Callback ejecutado cuando se importan datos exitosamente
 *                                          Recibe los datos importados como parámetro
 * @param {Function} [props.onReset] - Callback ejecutado cuando se resetea el componente
 *                                     Útil para limpiar formularios padre
 * @param {('artist'|'release')} [props.type='artist'] - Tipo de contenido a importar
 *                                                       'artist' para artistas, 'release' para álbumes/tracks
 * 
 * @example
 * // Importación de artista
 * <SpotifyImport 
 *   type="artist" 
 *   onDataImported={(data) => console.log('Artista importado:', data)}
 *   onReset={() => setFormData({})} // Limpiar formulario
 * />
 * 
 * @example
 * // Importación de álbum/track
 * <SpotifyImport 
 *   type="release" 
 *   onDataImported={(data) => setFormData(prev => ({...prev, ...data}))}
 *   onReset={() => resetForm()} // Función para resetear formulario
 * />
 * 
 * @returns {JSX.Element} Componente de importación de Spotify
 */
function SpotifyImport ({ onDataImported, onReset, type = 'artist' }) {
  const [url, setUrl] = useState('')
  const [urlValid, setUrlValid] = useState(false)
  const [urlTypeMatch, setUrlTypeMatch] = useState(true)
  const [showAutoImportSuggestion, setShowAutoImportSuggestion] = useState(false)
  const { importFromSpotify, loading, error, data, reset } = useSpotifyImport()

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
    
    // Llamar callback de reset si existe para limpiar formulario padre
    if (onReset) {
      onReset()
    }
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

  // Llamar callback cuando hay datos
  useEffect(() => {
    if (data && onDataImported) {
      onDataImported(data)
    }
  }, [data, onDataImported])

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
      </div>

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
    </div>
  )
}

export default SpotifyImport
