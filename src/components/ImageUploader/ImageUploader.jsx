import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ImageUploader.css'

/**
 * Componente para seleccionar y previsualizar imágenes de portada
 * No sube directamente, solo maneja la selección y preview
 * @param {Object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {Function} props.onChange - Callback con el archivo seleccionado
 * @param {string} props.currentImageUrl - URL de imagen actual (modo edición)
 * @param {File} props.selectedFile - Archivo seleccionado previamente (para persistencia)
 * @param {string} props.accept - Tipos de archivo aceptados
 */
export function ImageUploader ({
  label = 'Imagen de portada',
  onChange,
  currentImageUrl = '',
  selectedFile: externalSelectedFile = null,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
}) {
  const [selectedFile, setSelectedFile] = useState(externalSelectedFile)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Sincronizar con el archivo externo si cambia
  useEffect(() => {
    if (externalSelectedFile && externalSelectedFile !== selectedFile) {
      setSelectedFile(externalSelectedFile)
      // Crear preview del archivo externo
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(externalSelectedFile)
    } else if (!externalSelectedFile && selectedFile) {
      // Si el archivo externo se eliminó, limpiar
      setSelectedFile(null)
      setPreviewUrl(currentImageUrl)
    }
  }, [externalSelectedFile])

  // Sincronizar previewUrl con currentImageUrl cuando cambie
  useEffect(() => {
    // Solo actualizar si no hay archivo seleccionado localmente
    if (!selectedFile && currentImageUrl !== previewUrl) {
      setPreviewUrl(currentImageUrl)
    }
  }, [currentImageUrl, selectedFile, previewUrl])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError(null)

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tamaño (32MB máximo para ImgBB)
    const maxSize = 32 * 1024 * 1024 // 32MB
    if (file.size > maxSize) {
      setError('La imagen no puede superar los 32MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    // Notificar al padre
    if (onChange) {
      onChange(file)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(currentImageUrl)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onChange) {
      onChange(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">
        {label}
      </label>

      <div className="image-uploader-content">
        {/* Preview de la imagen */}
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" />
            {selectedFile && (
              <div className="image-overlay">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="btn-remove-image"
                  title="Eliminar imagen"
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input de archivo */}
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="file-input-label">
            <FontAwesomeIcon icon="image" className="upload-icon" />
            <span>{previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
          </label>
        </div>

        {/* Información del archivo seleccionado */}
        {selectedFile && (
          <div className="file-info">
            <FontAwesomeIcon icon="check-circle" className="success-icon" />
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon="exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        {/* Instrucciones */}
        <div className="upload-instructions">
          <p>Formatos: JPG, PNG, WEBP, GIF</p>
          <p>Tamaño máximo: 32MB</p>
          <p>Recomendado: Aspecto 1:1 (cuadrado)</p>
        </div>
      </div>
    </div>
  )
}
