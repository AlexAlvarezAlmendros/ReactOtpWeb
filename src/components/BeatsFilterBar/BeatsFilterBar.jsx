import { BEAT_GENRES, MUSICAL_KEYS } from '../../utils/beatConstants'
import './BeatsFilterBar.css'

/**
 * Barra de filtros minimalista para la página de Beats
 */
function BeatsFilterBar ({ filters, onFilterChange, onReset, artists = [] }) {
  const hasActiveFilters = filters.genre || filters.artistId || filters.key || filters.bpmMin || filters.bpmMax

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const toggleGenre = (genre) => {
    handleChange('genre', filters.genre === genre ? '' : genre)
  }

  return (
    <div className="beats-filter-bar">

      {/* Fila 1: Géneros como chips */}
      <div className="beats-filter-genres">
        {BEAT_GENRES.map(genre => (
          <button
            key={genre}
            className={`genre-chip ${filters.genre === genre ? 'active' : ''}`}
            onClick={() => toggleGenre(genre)}
            type="button"
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Fila 2: Artista, Key, BPM y limpiar */}
      <div className="beats-filter-controls">
        <select
          className="beats-filter-select"
          value={filters.artistId || ''}
          onChange={(e) => handleChange('artistId', e.target.value)}
        >
          <option value="">BeatMaker</option>
          {artists.map((artist, index) => (
            <option key={artist.id || artist._id || index} value={artist.id || artist._id}>
              {artist.title || artist.name}
            </option>
          ))}
        </select>

        <select
          className="beats-filter-select"
          value={filters.key || ''}
          onChange={(e) => handleChange('key', e.target.value)}
        >
          <option value="">Tonalidad</option>
          {MUSICAL_KEYS.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <div className="beats-filter-bpm">
          <input
            type="number"
            className="beats-filter-input"
            value={filters.bpmMin || ''}
            onChange={(e) => handleChange('bpmMin', e.target.value)}
            placeholder="BPM min"
            min="40"
            max="300"
          />
          <span className="bpm-separator">—</span>
          <input
            type="number"
            className="beats-filter-input"
            value={filters.bpmMax || ''}
            onChange={(e) => handleChange('bpmMax', e.target.value)}
            placeholder="BPM max"
            min="40"
            max="300"
          />
        </div>

        <button
          className={`beats-filter-reset ${hasActiveFilters ? '' : 'disabled'}`}
          onClick={onReset}
          type="button"
          disabled={!hasActiveFilters}
        >
          Limpiar filtros
        </button>
      </div>

    </div>
  )
}

export default BeatsFilterBar
