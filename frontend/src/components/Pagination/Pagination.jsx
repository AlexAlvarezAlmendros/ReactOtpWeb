import './Pagination.css'

/**
 * Componente de paginación reutilizable
 * @param {Object} props
 * @param {Object} props.pagination - Objeto con información de paginación
 * @param {number} props.pagination.page - Página actual
 * @param {number} props.pagination.pages - Total de páginas
 * @param {number} props.pagination.total - Total de elementos
 * @param {Function} props.onPageChange - Función llamada al cambiar de página
 */
function Pagination ({ pagination, onPageChange }) {
  const { page, pages, total } = pagination

  if (!pages || pages <= 1) {
    return null // No mostrar paginación si hay una sola página o menos
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, page - halfVisible)
    let endPage = Math.min(pages, page + halfVisible)

    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(pages, startPage + maxVisiblePages - 1)
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="pagination">
      <div className="pagination-info">
        Mostrando página {page} de {pages} ({total} elementos en total)
      </div>

      <div className="pagination-controls">
        {/* Botón Primera página */}
        <button
          className="pagination-btn"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          title="Primera página"
        >
          ««
        </button>

        {/* Botón Anterior */}
        <button
          className="pagination-btn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          title="Página anterior"
        >
          «
        </button>

        {/* Números de página */}
        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}

        {/* Botón Siguiente */}
        <button
          className="pagination-btn"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          title="Página siguiente"
        >
          »
        </button>

        {/* Botón Última página */}
        <button
          className="pagination-btn"
          disabled={page === pages}
          onClick={() => onPageChange(pages)}
          title="Última página"
        >
          »»
        </button>
      </div>
    </div>
  )
}

export default Pagination
