import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook avanzado para scroll infinito
 * 
 * @param {Function} fetchFunction - Función que hace fetch de datos (debe retornar { data, pagination })
 * @param {Object} options - Opciones de configuración
 * @param {number} options.initialCount - Items por página (default: 20)
 * @param {number} options.threshold - Distancia del bottom para cargar más (default: 500px)
 * @param {Object} options.filters - Filtros adicionales para la búsqueda
 * 
 * @returns {{
 *   items: Array,
 *   loading: boolean,
 *   error: string | null,
 *   hasMore: boolean,
 *   loadMore: Function,
 *   refresh: Function,
 *   isLoadingMore: boolean
 * }}
 */
export function useInfiniteScroll (fetchFunction, options = {}) {
  const {
    initialCount = 20,
    threshold = 500,
    filters = {}
  } = options

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  // Refs para evitar múltiples llamadas simultáneas
  const isFetchingRef = useRef(false)
  const observerRef = useRef(null)

  /**
   * Función para cargar datos
   */
  const loadItems = useCallback(async (pageNumber, append = false) => {
    // Evitar múltiples fetches simultáneos
    if (isFetchingRef.current) return
    
    isFetchingRef.current = true
    
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      setError(null)

      const result = await fetchFunction({
        ...filters,
        page: pageNumber,
        count: initialCount
      })

      const newItems = result.data || result
      const paginationData = result.pagination || {}

      if (append) {
        setItems(prev => [...prev, ...newItems])
      } else {
        setItems(newItems)
      }

      // Actualizar estado de paginación
      setTotalPages(paginationData.pages || 1)
      setHasMore(pageNumber < (paginationData.pages || 1))
      
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
      console.error('Error en infinite scroll:', err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
      isFetchingRef.current = false
    }
  }, [fetchFunction, filters, initialCount])

  /**
   * Cargar la siguiente página
   */
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return
    
    const nextPage = page + 1
    setPage(nextPage)
    loadItems(nextPage, true)
  }, [hasMore, isLoadingMore, page, loadItems])

  /**
   * Refrescar desde el inicio
   */
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    setItems([])
    loadItems(1, false)
  }, [loadItems])

  /**
   * Detectar cuando el usuario está cerca del bottom
   */
  useEffect(() => {
    const handleScroll = () => {
      // Verificar si estamos cerca del bottom
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const clientHeight = document.documentElement.clientHeight

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      // Si estamos cerca del bottom y hay más items, cargar más
      if (distanceFromBottom < threshold && hasMore && !isLoadingMore && !isFetchingRef.current) {
        loadMore()
      }
    }

    // Throttle para optimizar performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [hasMore, isLoadingMore, threshold, loadMore])

  /**
   * Intersection Observer alternativo (más eficiente)
   */
  const sentinelRef = useCallback(node => {
    if (loading || isLoadingMore) return
    
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
        loadMore()
      }
    }, {
      rootMargin: `${threshold}px`
    })

    if (node) {
      observerRef.current.observe(node)
    }
  }, [loading, isLoadingMore, hasMore, threshold, loadMore])

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadItems(1, false)
  }, []) // Solo en mount inicial

  /**
   * Recargar cuando cambien los filtros
   */
  useEffect(() => {
    // Skip en mount inicial
    if (items.length > 0) {
      refresh()
    }
  }, [JSON.stringify(filters)]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isLoadingMore,
    sentinelRef, // Ref para usar con Intersection Observer
    pagination: {
      currentPage: page,
      totalPages,
      itemsPerPage: initialCount
    }
  }
}
