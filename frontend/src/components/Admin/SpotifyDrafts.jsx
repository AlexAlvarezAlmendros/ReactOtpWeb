import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSpotifySyncApi, RELEASE_TYPES, formatDate } from './useSpotifySyncApi'
import './SpotifySync.css'

const PAGE_SIZE = 50

const TABS = {
  draft: {
    label: 'Pendientes',
    intro: 'Lanzamientos que la sincronización ha traído de Spotify de artistas en modo Revisión. No se ven en la web hasta que los publiques.',
    empty: 'No hay borradores pendientes.'
  },
  rejected: {
    label: 'Rechazados',
    intro: 'Los rechazados se guardan para que la sincronización no vuelva a traerlos. Puedes publicarlos o devolverlos a pendientes.',
    empty: 'No has rechazado ningún lanzamiento.'
  }
}

// La API acepta hasta 200 ids por petición.
const REVIEW_CHUNK = 200

const DONE_LABELS = {
  publish: ['publicado', 'publicados'],
  reject: ['rechazado', 'rechazados'],
  restore: ['devuelto a pendientes', 'devueltos a pendientes']
}

const BULK_LABELS = {
  publish: (n) => `Publicar ${n === 1 ? 'el' : `los ${n}`}`,
  reject: (n) => `Rechazar ${n === 1 ? 'el' : `los ${n}`}`
}

/**
 * Panel → Spotify → Borradores: aceptar o rechazar lo que la sincronización
 * ha importado de los artistas que no publican en automático.
 */
export default function SpotifyDrafts ({ artistId = '', onArtistChange, onChanged }) {
  const request = useSpotifySyncApi()
  const [status, setStatus] = useState('draft')
  const [artists, setArtists] = useState([])
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(() => new Set())
  const [confirmBulk, setConfirmBulk] = useState(null) // 'publish' | 'reject'
  const [notice, setNotice] = useState('')

  const loadArtists = useCallback(async () => {
    try {
      const body = await request('/artists')
      setArtists(body.data || [])
    } catch {
      // El filtro por artista es opcional: sin él, la cola sigue funcionando.
    }
  }, [request])

  const loadPage = useCallback(async (pageToLoad) => {
    const params = new URLSearchParams({ status, page: String(pageToLoad), count: String(PAGE_SIZE) })
    if (artistId) params.set('artistId', artistId)
    const body = await request(`/releases?${params}`)
    return body
  }, [request, status, artistId])

  const showFirstPage = (body) => {
    setItems(body.data || [])
    setTotal(body.pagination?.total || 0)
    setPage(1)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setConfirmBulk(null)
    loadPage(1)
      .then(body => {
        if (cancelled) return
        showFirstPage(body)
        setError(null)
      })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadPage])

  useEffect(() => { loadArtists() }, [loadArtists])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const body = await loadPage(page + 1)
      setItems(prev => [...prev, ...(body.data || []).filter(r => !prev.some(p => p._id === r._id))])
      setTotal(body.pagination?.total || 0)
      setPage(page + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const review = async (ids, action) => {
    setBusy(prev => new Set([...prev, ...ids]))
    setNotice('')
    try {
      let n = 0
      for (let i = 0; i < ids.length; i += REVIEW_CHUNK) {
        const body = await request('/releases/review', {
          method: 'POST',
          body: JSON.stringify({ ids: ids.slice(i, i + REVIEW_CHUNK), action })
        })
        n += body.modified || 0
      }
      // Los que no han cambiado ya los había revisado alguien: también salen de esta lista.
      setItems(prev => prev.filter(r => !ids.includes(r._id)))
      setTotal(prev => Math.max(prev - ids.length, 0))
      const [one, many] = DONE_LABELS[action]
      setNotice(n === 1 ? `1 lanzamiento ${one}.` : `${n} lanzamientos ${many}.`)
      setError(null)
      loadArtists()
      onChanged?.()
      // Al quitar elementos, las páginas se desplazan: se vuelve a pedir la primera.
      loadPage(1).then(showFirstPage).catch(() => {})
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
      setConfirmBulk(null)
    }
  }

  const tab = TABS[status]
  const visibleIds = items.map(r => r._id)
  const artistOptions = artists.filter(a => a.pendingDrafts > 0 || a._id === artistId || status === 'rejected')

  return (
    <div className="spotify-sync">
      <div className="spotify-sync__toolbar">
        <div className="spotify-sync__tabs" role="tablist" aria-label="Estado">
          {Object.entries(TABS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={status === key}
              className={status === key ? 'is-active' : ''}
              onClick={() => { setStatus(key); setNotice('') }}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="spotify-sync__field">
          <span>Artista</span>
          <select value={artistId} onChange={e => { onArtistChange?.(e.target.value); setNotice('') }}>
            <option value="">Todos</option>
            {artistOptions.map(a => (
              <option key={a._id} value={a._id}>
                {a.name}{status === 'draft' && a.pendingDrafts ? ` (${a.pendingDrafts})` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="spotify-sync__intro">{tab.intro}</p>

      {notice && <p className="spotify-sync__notice" role="status"><FontAwesomeIcon icon={['fas', 'check-circle']} /> {notice}</p>}
      {error && <p className="spotify-sync__error" role="alert"><FontAwesomeIcon icon={['fas', 'exclamation-circle']} /> {error}</p>}

      {!loading && items.length > 0 && status === 'draft' && (
        <div className="spotify-sync__bulk">
          <span>{total === 1 ? '1 pendiente' : `${total} pendientes`}{items.length < total ? ` · ${items.length} cargados` : ''}</span>
          {confirmBulk
            ? (
              <>
                <span className="spotify-sync__bulk-question">
                  {confirmBulk === 'publish' ? '¿Publicar' : '¿Rechazar'} {items.length === 1 ? 'el lanzamiento' : `los ${items.length} lanzamientos`} de la lista?
                </span>
                <button
                  type="button"
                  className={confirmBulk === 'publish' ? 'spotify-btn spotify-btn--primary' : 'spotify-btn spotify-btn--danger'}
                  onClick={() => review(visibleIds, confirmBulk)}
                  disabled={busy.size > 0}
                >
                  Sí, {confirmBulk === 'publish' ? 'publicar' : 'rechazar'}
                </button>
                <button type="button" className="spotify-btn" onClick={() => setConfirmBulk(null)}>Cancelar</button>
              </>
              )
            : (
              <>
                <button type="button" className="spotify-btn" onClick={() => setConfirmBulk('publish')} disabled={busy.size > 0}>
                  <FontAwesomeIcon icon={['fas', 'check']} /> {BULK_LABELS.publish(items.length)}
                </button>
                <button type="button" className="spotify-btn" onClick={() => setConfirmBulk('reject')} disabled={busy.size > 0}>
                  <FontAwesomeIcon icon={['fas', 'times']} /> {BULK_LABELS.reject(items.length)}
                </button>
              </>
              )}
        </div>
      )}

      {loading && <p className="spotify-sync__empty"><FontAwesomeIcon icon={['fas', 'spinner']} spin /> Cargando…</p>}

      {!loading && items.length === 0 && !error && (
        <p className="spotify-sync__empty">
          <FontAwesomeIcon icon={['fas', status === 'draft' ? 'check-circle' : 'inbox']} />
          {artistId ? `${tab.empty.replace('.', '')} de este artista.` : tab.empty}
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className="spotify-drafts">
          {items.map(release => {
            const isBusy = busy.has(release._id)
            return (
              <li key={release._id} className={`spotify-draft${isBusy ? ' is-busy' : ''}`}>
                <img className="spotify-draft__cover" src={release.img} alt="" width="88" height="88" loading="lazy" />
                <div className="spotify-draft__body">
                  <h3 className="spotify-draft__title">{release.title}</h3>
                  <p className="spotify-draft__artists">{release.subtitle}</p>
                  <p className="spotify-draft__meta">
                    <span>{RELEASE_TYPES[release.releaseType] || release.releaseType}</span>
                    <span>{formatDate(release.date)}</span>
                    {release.spotifyLink && (
                      <a href={release.spotifyLink} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={['fab', 'spotify']} /> Escuchar
                      </a>
                    )}
                  </p>
                </div>
                <div className="spotify-draft__actions">
                  <button
                    type="button"
                    className="spotify-btn spotify-btn--primary"
                    onClick={() => review([release._id], 'publish')}
                    disabled={isBusy}
                  >
                    <FontAwesomeIcon icon={['fas', isBusy ? 'spinner' : 'check']} spin={isBusy} /> Publicar
                  </button>
                  {status === 'draft'
                    ? (
                      <button type="button" className="spotify-btn" onClick={() => review([release._id], 'reject')} disabled={isBusy}>
                        <FontAwesomeIcon icon={['fas', 'times']} /> Rechazar
                      </button>
                      )
                    : (
                      <button type="button" className="spotify-btn" onClick={() => review([release._id], 'restore')} disabled={isBusy}>
                        <FontAwesomeIcon icon={['fas', 'undo']} /> A pendientes
                      </button>
                      )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && items.length < total && (
        <button type="button" className="spotify-btn spotify-sync__more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Cargando…' : `Cargar más (${total - items.length})`}
        </button>
      )}
    </div>
  )
}
