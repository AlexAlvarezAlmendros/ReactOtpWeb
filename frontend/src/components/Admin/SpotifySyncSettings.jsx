import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSpotifySyncApi, SYNC_MODES, formatDate } from './useSpotifySyncApi'
import './SpotifySync.css'

const normalize = (text) => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const syncSummary = ({ created = 0, drafts = 0 }) => {
  if (!created) return 'Sin novedades'
  const published = created - drafts
  const parts = []
  if (published) parts.push(published === 1 ? '1 publicado' : `${published} publicados`)
  if (drafts) parts.push(drafts === 1 ? '1 borrador nuevo' : `${drafts} borradores nuevos`)
  return parts.join(' · ')
}

/**
 * Panel → Spotify → Sincronización: qué artistas publican solos lo que
 * sacan en Spotify y cuáles pasan antes por la cola de borradores.
 */
export default function SpotifySyncSettings ({ onOpenDrafts, onChanged }) {
  const request = useSpotifySyncApi()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(() => new Set())
  const [syncing, setSyncing] = useState(() => new Set())
  const [results, setResults] = useState({}) // artistId → { ok, text }

  const load = useCallback(async () => {
    try {
      const body = await request('/artists')
      setArtists(body.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => { load() }, [load])

  const replaceArtist = (updated) => {
    setArtists(prev => prev.map(a => (a._id === updated._id ? updated : a)))
  }

  const mark = (setter, id, on) => setter(prev => {
    const next = new Set(prev)
    if (on) next.add(id)
    else next.delete(id)
    return next
  })

  const changeMode = async (artist, mode) => {
    if (artist.mode === mode) return
    const previous = artist
    replaceArtist({ ...artist, mode }) // optimista
    mark(setSaving, artist._id, true)
    try {
      const saved = await request(`/artists/${artist._id}`, { method: 'PATCH', body: JSON.stringify({ mode }) })
      replaceArtist(saved)
      setError(null)
    } catch (err) {
      replaceArtist(previous)
      setError(`${artist.name}: ${err.message}`)
    } finally {
      mark(setSaving, artist._id, false)
    }
  }

  const syncNow = async (artist) => {
    mark(setSyncing, artist._id, true)
    setResults(prev => ({ ...prev, [artist._id]: null }))
    try {
      const body = await request(`/artists/${artist._id}/sync`, { method: 'POST' })
      replaceArtist(body.artist)
      setResults(prev => ({ ...prev, [artist._id]: { ok: true, text: syncSummary(body.summary) } }))
      onChanged?.()
    } catch (err) {
      setResults(prev => ({ ...prev, [artist._id]: { ok: false, text: err.message } }))
    } finally {
      mark(setSyncing, artist._id, false)
    }
  }

  const counts = useMemo(() => artists.reduce((acc, a) => ({ ...acc, [a.mode]: (acc[a.mode] || 0) + 1 }), {}), [artists])
  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return q ? artists.filter(a => normalize(a.name).includes(q)) : artists
  }, [artists, query])

  return (
    <div className="spotify-sync">
      <ul className="spotify-sync__legend">
        {SYNC_MODES.map(mode => (
          <li key={mode.value}>
            <span className={`sync-dot sync-dot--${mode.value}`} aria-hidden="true" />
            <strong>{mode.label}</strong>
            <span>{mode.hint}</span>
            <em>{counts[mode.value] || 0}</em>
          </li>
        ))}
      </ul>

      <p className="spotify-sync__intro">
        La sincronización corre cada madrugada y trae los lanzamientos nuevos de los artistas con enlace de Spotify en su ficha.
        El modo solo decide qué pasa con lo nuevo: lo que ya está publicado no cambia.
      </p>

      {error && <p className="spotify-sync__error" role="alert"><FontAwesomeIcon icon={['fas', 'exclamation-circle']} /> {error}</p>}

      {!loading && artists.length > 8 && (
        <label className="spotify-sync__field spotify-sync__search">
          <span>Buscar</span>
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre del artista" />
        </label>
      )}

      {loading && <p className="spotify-sync__empty"><FontAwesomeIcon icon={['fas', 'spinner']} spin /> Cargando…</p>}

      {!loading && artists.length === 0 && !error && (
        <p className="spotify-sync__empty">
          <FontAwesomeIcon icon={['fas', 'user-slash']} />
          Ningún artista tiene enlace de Spotify en su ficha.
        </p>
      )}

      {!loading && visible.length > 0 && (
        <ul className="sync-artists">
          {visible.map(artist => {
            const isSyncing = syncing.has(artist._id)
            const result = results[artist._id]
            return (
              <li key={artist._id} className="sync-artist">
                <img className="sync-artist__avatar" src={artist.img} alt="" width="48" height="48" loading="lazy" />

                <div className="sync-artist__body">
                  <h3 className="sync-artist__name">{artist.name}</h3>
                  <p className="sync-artist__meta">
                    {artist.spotifySyncedAt
                      ? <>Sincronizado el {formatDate(artist.spotifySyncedAt, true)}</>
                      : 'Aún no se ha sincronizado'}
                  </p>
                  {artist.spotifySyncError && !result && (
                    <p className="sync-artist__error"><FontAwesomeIcon icon={['fas', 'exclamation-triangle']} /> {artist.spotifySyncError}</p>
                  )}
                  {result && (
                    <p className={result.ok ? 'sync-artist__result' : 'sync-artist__error'} role="status">
                      <FontAwesomeIcon icon={['fas', result.ok ? 'check-circle' : 'exclamation-triangle']} /> {result.text}
                    </p>
                  )}
                  {artist.pendingDrafts > 0 && (
                    <button type="button" className="sync-artist__pending" onClick={() => onOpenDrafts?.(artist._id)}>
                      {artist.pendingDrafts === 1 ? '1 borrador pendiente' : `${artist.pendingDrafts} borradores pendientes`}
                      <FontAwesomeIcon icon={['fas', 'chevron-right']} />
                    </button>
                  )}
                </div>

                <div className="sync-artist__controls">
                  <div className="sync-modes" role="group" aria-label={`Modo de ${artist.name}`}>
                    {SYNC_MODES.map(mode => (
                      <button
                        key={mode.value}
                        type="button"
                        aria-pressed={artist.mode === mode.value}
                        title={mode.hint}
                        onClick={() => changeMode(artist, mode.value)}
                        disabled={saving.has(artist._id)}
                      >
                        <span className={`sync-dot sync-dot--${mode.value}`} aria-hidden="true" />
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="sync-artist__actions">
                    <button
                      type="button"
                      className="spotify-btn"
                      onClick={() => syncNow(artist)}
                      disabled={isSyncing || artist.mode === 'off'}
                      title={artist.mode === 'off' ? 'Activa la sincronización para poder lanzarla' : 'Trae ahora lo nuevo de Spotify'}
                    >
                      <FontAwesomeIcon icon={['fas', isSyncing ? 'spinner' : 'arrows-rotate']} spin={isSyncing} />
                      {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && artists.length > 0 && visible.length === 0 && (
        <p className="spotify-sync__empty">Ningún artista coincide con «{query}».</p>
      )}
    </div>
  )
}
