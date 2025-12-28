import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook para subir archivos al servidor
 * @param {string} fileType - Tipo de archivo: 'audio' o 'archive'
 * @returns {Object} Estado y función de subida
 */
export function useFileUpload (fileType = 'audio') {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  const uploadFile = useCallback(async (file, metadata = {}) => {
    if (!file) {
      setError('No se ha seleccionado ningún archivo')
      return null
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    // Log para debugging
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      fileType: fileType,
      endpoint: `${API_URL}/files/upload/${fileType}`
    })

    // Añadir metadatos opcionales
    if (metadata.description) {
      formData.append('description', metadata.description)
    }
    if (metadata.tags && Array.isArray(metadata.tags)) {
      formData.append('tags', JSON.stringify(metadata.tags))
    }
    if (metadata.uploadedBy) {
      formData.append('uploadedBy', metadata.uploadedBy)
    }
    if (metadata.isPublic !== undefined) {
      formData.append('isPublic', metadata.isPublic.toString())
    }
    if (metadata.duration) {
      formData.append('duration', metadata.duration.toString())
    }

    try {
      const xhr = new XMLHttpRequest()

      // Monitorear progreso
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setProgress(percentComplete)
        }
      })

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            // Intentar parsear el error del servidor
            let errorMessage = `Error ${xhr.status}: ${xhr.statusText}`
            try {
              const errorData = JSON.parse(xhr.responseText)
              if (errorData.message) {
                errorMessage = errorData.message
              }
            } catch (e) {
              // Si no se puede parsear, usar el mensaje por defecto
            }
            reject(new Error(errorMessage))
          }
        }
        xhr.onerror = () => reject(new Error('Error de red'))

        xhr.open('POST', `${API_URL}/files/upload/${fileType}`)
        xhr.send(formData)
      })

      if (response.success) {
        setUploadedFile(response.data)
        setProgress(100)
        return response.data
      } else {
        throw new Error(response.message || 'Error al subir el archivo')
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al subir el archivo'
      setError(errorMessage)
      console.error('Upload error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }, [fileType])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
    setUploadedFile(null)
  }, [])

  return {
    uploadFile,
    uploading,
    progress,
    error,
    uploadedFile,
    reset
  }
}
