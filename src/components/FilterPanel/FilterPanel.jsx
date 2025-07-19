import { useState } from 'react'
import './FilterPanel.css'

/**
 * Panel de filtros avanzados reutilizable
 * @param {Object} props
 * @param {string} props.type - Tipo de contenido ('releases', 'artists', 'events', 'studios')
 * @param {Object} props.filters - Filtros actuales
 * @param {Function} props.onFilterChange - Función llamada al cambiar filtros
 * @param {Function} props.onReset - Función para resetear filtros
 */
function FilterPanel ({ type, filters, onFilterChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleInputChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const getTypeOptions = () => {
    switch (type) {
      case 'releases':
        return ['Song', 'Album', 'EP', 'Remix', 'Instrumental']
      case 'artists':
        return ['Singer', 'Producer', 'DJ', 'Songwriter', 'Musician']
      case 'events':
        return ['Concert', 'Festival', 'Live Session', 'Workshop', 'Release Party']
      case 'studios':
        return ['Recording', 'Mixing', 'Mastering', 'Rehearsal', 'Live']
      default:
        return []
    }
  }

  const getSortOptions = () => {
    switch (type) {
      case 'releases':
        return [
          { value: 'date-desc', label: 'Más recientes' },
          { value: 'date-asc', label: 'Más antiguos' },
          { value: 'title-asc', label: 'Título A-Z' },
          { value: 'title-desc', label: 'Título Z-A' }
        ]
      case 'artists':
        return [
          { value: 'name-asc', label: 'Nombre A-Z' },
          { value: 'name-desc', label: 'Nombre Z-A' },
          { value: 'createdAt-desc', label: 'Más recientes' },
          { value: 'createdAt-asc', label: 'Más antiguos' }
        ]
      case 'events':
        return [
          { value: 'date-asc', label: 'Próximos eventos' },
          { value: 'date-desc', label: 'Eventos recientes' },
          { value: 'name-asc', label: 'Nombre A-Z' },
          { value: 'name-desc', label: 'Nombre Z-A' }
        ]
      case 'studios':
        return [
          { value: 'name-asc', label: 'Nombre A-Z' },
          { value: 'name-desc', label: 'Nombre Z-A' },
          { value: 'createdAt-desc', label: 'Más recientes' },
          { value: 'createdAt-asc', label: 'Más antiguos' }
        ]
      default:
        return []
    }
  }

  const hasActiveFilters = () => {
    return filters.type || filters.subtitle || filters.genre || filters.location ||
           filters.dateMin || filters.dateMax
  }

  return (
    <div className={`filter-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-panel-header">
        <h3>Filtros</h3>
        <div className="filter-panel-actions">
          {hasActiveFilters() && (
            <button
              className="filter-reset-btn"
              onClick={onReset}
              title="Limpiar filtros"
            >
              Limpiar
            </button>
          )}
          <button
            className="filter-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-panel-content">
          <div className="filter-row">
            {/* Ordenación */}
            <div className="filter-group">
              <label>Ordenar por:</label>
              <select
                value={`${filters.sortBy || 'date'}-${filters.sortOrder || 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleInputChange('sortBy', sortBy)
                  handleInputChange('sortOrder', sortOrder)
                }}
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Elementos por página */}
            <div className="filter-group">
              <label>Elementos por página:</label>
              <select
                value={filters.count || 10}
                onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            {/* Filtro por tipo */}
            <div className="filter-group">
              <label>Tipo:</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {getTypeOptions().map(typeOption => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtros específicos por tipo de contenido */}
            {type === 'releases' && (
              <div className="filter-group">
                <label>Subtítulo:</label>
                <input
                  type="text"
                  value={filters.subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Buscar en subtítulo..."
                />
              </div>
            )}

            {type === 'artists' && (
              <div className="filter-group">
                <label>Género:</label>
                <input
                  type="text"
                  value={filters.genre || ''}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  placeholder="Buscar por género..."
                />
              </div>
            )}

            {(type === 'events' || type === 'studios') && (
              <div className="filter-group">
                <label>Ubicación:</label>
                <input
                  type="text"
                  value={filters.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Buscar por ubicación..."
                />
              </div>
            )}
          </div>

          {/* Filtros de fecha */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Desde:</label>
              <input
                type="date"
                value={filters.dateMin || ''}
                onChange={(e) => handleInputChange('dateMin', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Hasta:</label>
              <input
                type="date"
                value={filters.dateMax || ''}
                onChange={(e) => handleInputChange('dateMax', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
