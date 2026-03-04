import { useState } from 'react'
import { BEAT_GENRES, MUSICAL_KEYS } from '../../utils/beatConstants'
import './FilterPanel.css'

]

/**
 * Panel de filtros avanzados reutilizable
 * @param {Object} props
 * @param {string} props.type - Tipo de contenido ('releases', 'artists', 'events', 'studios', 'beats')
 * @param {Object} props.filters - Filtros actuales
 * @param {Function} props.onFilterChange - Función llamada al cambiar filtros
 * @param {Function} props.onReset - Función para resetear filtros
 * @param {Array} props.artists - Lista de artistas (usado para type='beats')
 */
function FilterPanel ({ type, filters, onFilterChange, onReset, artists = [] }) {
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
      case 'beats':
        return [
          { value: 'createdAt-desc', label: 'Más recientes' },
          { value: 'createdAt-asc', label: 'Más antiguos' },
          { value: 'bpm-asc', label: 'BPM: menor a mayor' },
          { value: 'bpm-desc', label: 'BPM: mayor a menor' },
          { value: 'title-asc', label: 'Título A-Z' },
          { value: 'title-desc', label: 'Título Z-A' }
        ]
      default:
        return []
    }
  }

  const hasActiveFilters = () => {
    return filters.type || filters.subtitle || filters.genre || filters.location ||
           filters.dateMin || filters.dateMax ||
           filters.artistId || filters.key || filters.bpmMin || filters.bpmMax
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

            {/* Elementos por página (no para infinite scroll) */}
            {type !== 'beats' && (
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
            )}
          </div>

          <div className="filter-row">
            {/* Filtro por tipo (no para beats) */}
            {type !== 'beats' && (
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
            )}

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

          {/* Filtros específicos de beats */}
          {type === 'beats' && (
            <>
              <div className="filter-row">
                {/* Género */}
                <div className="filter-group">
                  <label>Género:</label>
                  <select
                    value={filters.genre || ''}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                  >
                    <option value="">Todos los géneros</option>
                    {BEAT_GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Artista */}
                <div className="filter-group">
                  <label>Artista:</label>
                  <select
                    value={filters.artistId || ''}
                    onChange={(e) => handleInputChange('artistId', e.target.value)}
                  >
                    <option value="">Todos los artistas</option>
                    {artists.map(artist => (
                      <option key={artist._id || artist.id} value={artist.userId || artist._id || artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Key musical */}
                <div className="filter-group">
                  <label>Tonalidad:</label>
                  <select
                    value={filters.key || ''}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                  >
                    <option value="">Todas las tonalidades</option>
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BPM range */}
              <div className="filter-row">
                <div className="filter-group">
                  <label>BPM mínimo:</label>
                  <input
                    type="number"
                    value={filters.bpmMin || ''}
                    onChange={(e) => handleInputChange('bpmMin', e.target.value)}
                    placeholder="Ej: 80"
                    min="40"
                    max="300"
                  />
                </div>
                <div className="filter-group">
                  <label>BPM máximo:</label>
                  <input
                    type="number"
                    value={filters.bpmMax || ''}
                    onChange={(e) => handleInputChange('bpmMax', e.target.value)}
                    placeholder="Ej: 160"
                    min="40"
                    max="300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Filtros de fecha (no para beats) */}
          {type !== 'beats' && (
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
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel
