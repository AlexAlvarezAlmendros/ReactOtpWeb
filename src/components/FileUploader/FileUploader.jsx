import { useState, useRef, useEffect } from 'react'
import { useFileUpload } from '../../hooks/useFileUpload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './FileUploader.css'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024 // 4MB

/**
 * Componente para subir archivos
 * Soporta archivos hasta 100MB usando signed uploads para archivos >4MB
 * @param {Object} props
 * @param {string} props.fileType - Tipo: 'audio' o 'archive'
 * @param {string} props.accept - Tipos de archivo aceptados
 * @param {string} props.label - Etiqueta del campo
 * @param {Function} props.onUploadSuccess - Callback cuando se sube exitosamente
 * @param {Object} props.metadata - Metadatos adicionales para el archivo
 * @param {Object} props.existingFile - Archivo ya subido previamente (para edición)
 */
export function FileUploader ({
  fileType = 'audio',
  accept = '.mp3,.wav,.ogg,.flac',
  label = 'Seleccionar archivo',
  onUploadSuccess,
  metadata = {},
  existingFile = null
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [displayedUploadedFile, setDisplayedUploadedFile] = useState(null)
  const [sizeWarning, setSizeWarning] = useState(null)
  const fileInputRef = useRef(null)

  const { uploadFile, uploading, progress, error, uploadedFile, reset } = useFileUpload(fileType)

  // Sincronizar con archivo existente cuando cambie
  useEffect(() => {
    if (existingFile) {
      setDisplayedUploadedFile(existingFile)
    }
  }, [existingFile])

  // Actualizar displayedUploadedFile cuando se sube un nuevo archivo
  useEffect(() => {
    if (uploadedFile) {
      setDisplayedUploadedFile(uploadedFile)
    }
  }, [uploadedFile])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamaño máximo
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / 1024 / 1024)
      alert(`El archivo es demasiado grande (${sizeMB}MB). El tamaño máximo permitido es 100MB.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tipo de archivo
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac']
    const validArchiveTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-zip-compressed']
    
    if (fileType === 'audio' && !validAudioTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de audio válido (.mp3, .wav, .ogg, .flac)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }
    
    if (fileType === 'archive' && !validArchiveTypes.includes(file.type) && !file.name.match(/\.(zip|rar|7z)$/i)) {
      alert('Por favor selecciona un archivo comprimido válido (.zip, .rar, .7z)')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)

    // Mostrar advertencia si el archivo es grande
    if (file.size > LARGE_FILE_THRESHOLD) {
      const sizeMB = Math.round(file.size / 1024 / 1024)
      setSizeWarning(`Este archivo es grande (${sizeMB}MB). La subida puede tardar varios minutos.`)
    } else {
      setSizeWarning(null)
    }

    // Crear preview para archivos de audio
    if (file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const result = await uploadFile(selectedFile, metadata)

    if (result && onUploadSuccess) {
      onUploadSuccess(result)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setDisplayedUploadedFile(null)
    setSizeWarning(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="file-uploader">
      <label className="file-uploader-label">
        {label}
      </label>

      {!displayedUploadedFile && !uploading && (
        <>
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-input-label">
              <FontAwesomeIcon icon="upload" className="upload-icon" />
              <span>Elegir archivo</span>
            </label>
          </div>

          {selectedFile && (
            <div className="file-selected">
              <div className="file-info">
                <FontAwesomeIcon icon="file" className="file-icon" />
                <div className="file-details">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
              </div>

              {sizeWarning && (
                <div className="size-warning">
                  <FontAwesomeIcon icon="info-circle" />
                  <span>{sizeWarning}</span>
                </div>
              )}

              {previewUrl && (
                <div className="audio-preview">
                  <audio controls src={previewUrl}>
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
              )}

              <div className="file-actions">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="btn-upload"
                  disabled={uploading}
                >
                  <FontAwesomeIcon icon="cloud-upload-alt" />
                  Subir archivo
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                  disabled={uploading}
                >
                  <FontAwesomeIcon icon="times" />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <FontAwesomeIcon icon="exclamation-circle" />
          <span>{error}</span>
        </div>
      )}

      {displayedUploadedFile && (
        <div className="upload-success">
          <FontAwesomeIcon icon="check-circle" className="success-icon" />
          <div className="success-info">
            <span className="success-message">¡Archivo subido exitosamente!</span>
            <span className="file-url">{displayedUploadedFile.originalName}</span>
            <a
              href={displayedUploadedFile.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              <FontAwesomeIcon icon="external-link-alt" />
              Ver archivo
            </a>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-upload-another"
          >
            Subir otro archivo
          </button>
        </div>
      )}
    </div>
  )
}
