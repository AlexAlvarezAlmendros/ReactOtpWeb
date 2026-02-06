import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const MAX_NORMAL_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_SIGNED_UPLOAD_SIZE = 100 * 1024 * 1024 // 100MB

/**
 * Hook para subir archivos al servidor
 * Usa signed uploads para archivos >10MB (hasta 100MB)
 * @param {string} fileType - Tipo de archivo: 'audio' o 'archive'
 * @returns {Object} Estado y función de subida
 */
export function useFileUpload (fileType = 'audio') {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  /**
   * Sube archivos grandes (>10MB) usando signed upload directo a Cloudinary
   */
  const uploadLargeFile = useCallback(async (file, metadata = {}) => {
    try {
      // Paso 1: Obtener parámetros firmados del backend
      const folder = fileType === 'audio' ? 'audio_files' : 'archive_files'
      const resourceType = fileType === 'audio' ? 'video' : 'raw'
      
      console.log('Obteniendo parámetros firmados para archivo grande:', {
        name: file.name,
        size: file.size,
        folder,
        resourceType
      })

      const paramsResponse = await fetch(
        `${API_URL}/files/upload/signed-params?folder=${folder}&resourceType=${resourceType}`
      )

      if (!paramsResponse.ok) {
        throw new Error('Error al obtener parámetros de subida firmados')
      }

      const paramsData = await paramsResponse.json()
      const uploadParams = paramsData.data

      console.log('Parámetros firmados recibidos del backend:', uploadParams)

      // Paso 2: Preparar FormData para Cloudinary
      // IMPORTANTE: Solo enviar parámetros que fueron incluidos en la firma
      // El resource_type ya está en la URL (/video/upload o /raw/upload)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', uploadParams.api_key)
      formData.append('timestamp', uploadParams.timestamp)
      formData.append('signature', uploadParams.signature)
      formData.append('folder', uploadParams.folder)

      console.log('FormData que se enviará a Cloudinary:')
      console.log('- api_key:', uploadParams.api_key)
      console.log('- timestamp:', uploadParams.timestamp)
      console.log('- signature:', uploadParams.signature)
      console.log('- folder:', uploadParams.folder)
      console.log('- file:', file.name)
      console.log('- URL destino:', uploadParams.upload_url)

      // Paso 3: Subir directamente a Cloudinary con tracking de progreso
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setProgress(percentComplete)
        }
      })

      const cloudinaryResult = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            let errorMessage = `Error ${xhr.status} al subir a Cloudinary`
            try {
              const errorData = JSON.parse(xhr.responseText)
              if (errorData.error?.message) {
                errorMessage = errorData.error.message
              }
            } catch (e) {
              // Usar mensaje por defecto
            }
            reject(new Error(errorMessage))
          }
        }
        xhr.onerror = () => reject(new Error('Error de red al subir a Cloudinary'))

        xhr.open('POST', uploadParams.upload_url)
        xhr.send(formData)
      })

      console.log('Archivo subido a Cloudinary:', cloudinaryResult)

      // Paso 4: Registrar el archivo en la base de datos
      const dbResponse = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: cloudinaryResult.public_id,
          originalName: file.name,
          fileType: fileType,
          mimeType: file.type,
          size: cloudinaryResult.bytes,
          cloudinaryId: cloudinaryResult.public_id,
          cloudinaryUrl: cloudinaryResult.url,
          secureUrl: cloudinaryResult.secure_url,
          resourceType: cloudinaryResult.resource_type,
          format: cloudinaryResult.format,
          duration: cloudinaryResult.duration,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          ...metadata
        })
      })

      if (!dbResponse.ok) {
        throw new Error('Error al registrar archivo en la base de datos')
      }

      const dbResult = await dbResponse.json()
      
      return dbResult.data || dbResult
    } catch (err) {
      throw err
    }
  }, [fileType])

  /**
   * Sube archivos pequeños (<=10MB) usando el método tradicional a través del backend
   */
  const uploadSmallFile = useCallback(async (file, metadata = {}) => {
    const formData = new FormData()
    formData.append('file', file)

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
        return response.data
      } else {
        throw new Error(response.message || 'Error al subir el archivo')
      }
    } catch (err) {
      throw err
    }
  }, [fileType])

  /**
   * Función principal que decide qué método usar según el tamaño del archivo
   */
  const uploadFile = useCallback(async (file, metadata = {}) => {
    if (!file) {
      setError('No se ha seleccionado ningún archivo')
      return null
    }

    // Validar tamaño máximo
    if (file.size > MAX_SIGNED_UPLOAD_SIZE) {
      const sizeMB = Math.round(file.size / 1024 / 1024)
      setError(`El archivo es demasiado grande (${sizeMB}MB). El tamaño máximo es 100MB.`)
      return null
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    const useLargeUpload = file.size > MAX_NORMAL_UPLOAD_SIZE

    // Log para debugging
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      fileType: fileType,
      method: useLargeUpload ? 'Signed Upload (>10MB)' : 'Normal Upload (<=10MB)'
    })

    try {
      let result
      
      if (useLargeUpload) {
        result = await uploadLargeFile(file, metadata)
      } else {
        result = await uploadSmallFile(file, metadata)
      }

      setUploadedFile(result)
      setProgress(100)
      return result
    } catch (err) {
      const errorMessage = err.message || 'Error al subir el archivo'
      setError(errorMessage)
      console.error('Upload error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }, [fileType, uploadLargeFile, uploadSmallFile])

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
