import { useState } from 'react'
import { useSpotifyImport } from '../../hooks/useSpotifyImport'
import { isValidSpotifyUrl, getSpotifyUrlType, mapSpotifyTypeToAppType } from '../../utils/spotifyHelpers'
import { addToSpotifyHistory } from '../../utils/spotifyHistory'
import './SpotifyBulkImport.css'

/**
 * @fileoverview Componente modal para importación masiva de contenido desde Spotify
 * 
 * Proporciona una interfaz para procesar múltiples URLs de Spotify de forma
 * simultánea. Permite al usuario pegar una lista de URLs y procesarlas una
 * por una, mostrando el progreso y resultados en tiempo real.
 * 
 * Características principales:
 * - Validación automática de URLs de Spotify
 * - Verificación de compatibilidad de tipos
 * - Procesamiento secuencial con control de rate limiting
 * - Historial automático de importaciones exitosas
 * - Interfaz de progreso en tiempo real
 * - Gestión de errores individualizada por URL
 * 
 * @component
 * @version 1.0.0
 * @author ReactOtpWeb Team
 */

/**
 * Componente modal para importación masiva desde Spotify
 * 
 * Permite procesar múltiples URLs de Spotify en una sola operación.
 * Valida cada URL, verifica compatibilidad de tipos y procesa las
 * importaciones de forma secuencial con feedback visual del progreso.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onDataImported - Callback ejecutado por cada importación exitosa
 * @param {('artist'|'release')} [props.type='artist'] - Tipo de contenido a importar
 * @param {Function} props.onClose - Callback para cerrar el modal
 * 
 * @example
 * // Importación masiva de artistas
 * <SpotifyBulkImport
 *   type="artist"
 *   onDataImported={(artistData) => {
 *     console.log('Artista importado:', artistData.name)
 *     // Añadir a la lista de artistas...
 *   }}
 *   onClose={() => setShowBulkModal(false)}
 * />
 * 
 * @example
 * // Importación masiva de releases
 * <SpotifyBulkImport
 *   type="release"
 *   onDataImported={(releaseData) => {
 *     console.log('Release importado:', releaseData.title)
 *     // Añadir a la lista de releases...
 *   }}
 *   onClose={() => setModalOpen(false)}
 * />
 */
function SpotifyBulkImport ({ onDataImported, type = 'artist', onClose }) {
  const [urls, setUrls] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { importFromSpotify } = useSpotifyImport()

  const parseUrls = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }

  const validateUrls = (urlList) => {
    return urlList.map(url => {
      const isValid = isValidSpotifyUrl(url)
      const spotifyType = isValid ? getSpotifyUrlType(url) : null
      const appType = spotifyType ? mapSpotifyTypeToAppType(spotifyType) : null
      const typeMatch = appType === type

      return {
        url,
        isValid,
        typeMatch,
        spotifyType,
        status: 'pending'
      }
    })
  }

  const processBulkImport = async () => {
    const urlList = parseUrls(urls)
    if (urlList.length === 0) return

    const validatedUrls = validateUrls(urlList)
    setResults(validatedUrls)
    setProcessing(true)
    setCurrentIndex(0)

    const processedResults = []

    for (let i = 0; i < validatedUrls.length; i++) {
      const urlData = validatedUrls[i]
      setCurrentIndex(i + 1)

      if (!urlData.isValid || !urlData.typeMatch) {
        processedResults.push({
          ...urlData,
          status: 'error',
          error: !urlData.isValid ? 'URL inválida' : 'Tipo incompatible'
        })
        continue
      }

      try {
        const importedData = await importFromSpotify(urlData.url, type)
        
        // Extraer nombre correcto según el tipo y estructura de datos
        let name = 'Contenido de Spotify' // fallback
        
        if (importedData.data) {
          // Los datos están en importedData.data
          const actualData = importedData.data
          if (type === 'artist') {
            name = actualData.name || 'Artista sin nombre'
          } else if (type === 'release') {
            name = actualData.title || actualData.name || 'Release sin título'
          }
        } else {
          // Los datos están directamente en importedData
          if (type === 'artist') {
            name = importedData.name || 'Artista sin nombre'
          } else if (type === 'release') {
            name = importedData.title || importedData.name || 'Release sin título'
          }
        }
        
        console.log('💾 Guardando en historial (bulk):', { url: urlData.url, type, name })
        
        // Guardar en historial con el nombre correcto
        addToSpotifyHistory(urlData.url, type, name)
        
        // Llamar callback
        if (onDataImported) {
          onDataImported(importedData)
        }

        processedResults.push({
          ...urlData,
          status: 'success',
          data: importedData,
          name: name // Añadir el nombre para mostrar en resultados
        })

        // Pequeña pausa entre requests para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        processedResults.push({
          ...urlData,
          status: 'error',
          error: error.message || 'Error desconocido'
        })
      }
    }

    setResults(processedResults)
    setProcessing(false)
  }

  const reset = () => {
    setUrls('')
    setResults([])
    setCurrentIndex(0)
    setProcessing(false)
  }

  const urlList = parseUrls(urls)
  const validUrls = urlList.filter(url => {
    const isValid = isValidSpotifyUrl(url)
    const spotifyType = isValid ? getSpotifyUrlType(url) : null
    const appType = spotifyType ? mapSpotifyTypeToAppType(spotifyType) : null
    return isValid && appType === type
  })

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div className="spotify-bulk-import">
      <div className="bulk-import-header">
        <h3>Importación Masiva de Spotify</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="bulk-import-content">
        <div className="bulk-input-section">
          <label htmlFor="bulk-urls">
            URLs de Spotify (una por línea):
          </label>
          <textarea
            id="bulk-urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={`Pega múltiples URLs de Spotify aquí, una por línea:\n\nhttps://open.spotify.com/${type === 'artist' ? 'artist' : 'album'}/...\nhttps://open.spotify.com/${type === 'artist' ? 'artist' : 'album'}/...\nhttps://open.spotify.com/${type === 'artist' ? 'artist' : 'album'}/...`}
            rows={8}
            disabled={processing}
            className="bulk-textarea"
          />
          
          <div className="bulk-stats">
            <span>Total: {urlList.length}</span>
            <span>Válidas: {validUrls.length}</span>
            <span>Inválidas: {urlList.length - validUrls.length}</span>
          </div>
        </div>

        {processing && (
          <div className="bulk-progress">
            <div className="progress-info">
              <span>Procesando {currentIndex} de {results.length}...</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentIndex / results.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && !processing && (
          <div className="bulk-results">
            <div className="results-summary">
              <h4>Resultados de Importación</h4>
              <div className="summary-stats">
                <span className="success-stat">✓ {successCount} exitosas</span>
                <span className="error-stat">✗ {errorCount} fallidas</span>
              </div>
            </div>
            
            <div className="results-list">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`result-item ${result.status}`}
                >
                  <div className="result-info">
                    <span className="result-url">{result.url}</span>
                    {result.status === 'success' && result.data && (
                      <span className="result-name">
                        {result.data.name || result.data.title}
                      </span>
                    )}
                    {result.status === 'error' && (
                      <span className="result-error">{result.error}</span>
                    )}
                  </div>
                  <span className={`result-status ${result.status}`}>
                    {result.status === 'success' ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bulk-actions">
          {!processing && results.length === 0 && (
            <button
              onClick={processBulkImport}
              disabled={validUrls.length === 0}
              className="bulk-import-btn"
            >
              Importar {validUrls.length} elemento{validUrls.length !== 1 ? 's' : ''}
            </button>
          )}
          
          {!processing && results.length > 0 && (
            <button
              onClick={reset}
              className="bulk-reset-btn"
            >
              Importar Más
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpotifyBulkImport
