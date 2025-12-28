import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const ENDPOINT = `${API_URL}/files`

/**
 * Hook para obtener y gestionar archivos
 * @param {Object} options - Opciones de filtrado
 * @returns {Object} Estado y funciones
 */
export function useFiles (options = {}) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(options.page || 1)
  const [totalFiles, setTotalFiles] = useState(0)

  const fetchFiles = useCallback(async (signal) => {
    try {
      setLoading(true)
      setError(null)

      // Construir query params
      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page)
      if (options.limit) params.append('limit', options.limit)
      if (options.fileType) params.append('fileType', options.fileType)
      if (options.uploadedBy) params.append('uploadedBy', options.uploadedBy)
      if (options.isPublic !== undefined) params.append('isPublic', options.isPublic)
      if (options.search) params.append('search', options.search)

      const url = `${ENDPOINT}${params.toString() ? '?' + params.toString() : ''}`

      const response = await fetch(url, { signal })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setFiles(result.data || [])
        setTotalPages(result.totalPages || 0)
        setCurrentPage(result.currentPage || 1)
        setTotalFiles(result.totalFiles || 0)
      } else {
        throw new Error(result.message || 'Error al obtener archivos')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        console.error('Error fetching files:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [options.page, options.limit, options.fileType, options.uploadedBy, options.isPublic, options.search])

  useEffect(() => {
    const controller = new AbortController()
    fetchFiles(controller.signal)
    return () => controller.abort()
  }, [fetchFiles])

  const deleteFile = useCallback(async (fileId) => {
    try {
      const response = await fetch(`${ENDPOINT}/${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al eliminar archivo')
      }

      // Actualizar lista de archivos
      setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId))
      setTotalFiles(prev => prev - 1)

      return { success: true }
    } catch (err) {
      console.error('Error deleting file:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const updateFile = useCallback(async (fileId, updates) => {
    try {
      const response = await fetch(`${ENDPOINT}/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al actualizar archivo')
      }

      // Actualizar archivo en la lista
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file._id === fileId ? { ...file, ...result.data } : file
        )
      )

      return { success: true, data: result.data }
    } catch (err) {
      console.error('Error updating file:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const getDownloadUrl = useCallback(async (fileId) => {
    try {
      const response = await fetch(`${ENDPOINT}/${fileId}/download`)

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al obtener URL de descarga')
      }

      return { success: true, data: result.data }
    } catch (err) {
      console.error('Error getting download URL:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return {
    files,
    loading,
    error,
    totalPages,
    currentPage,
    totalFiles,
    refetch: fetchFiles,
    deleteFile,
    updateFile,
    getDownloadUrl
  }
}
