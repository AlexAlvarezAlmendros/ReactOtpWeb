import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './Admin.css'

const API_URL = import.meta.env.VITE_API_URL
const STATUSES = { nueva: 'Nueva', escuchada: 'Escuchada', interesa: 'Interesa', descartada: 'Descartada' }

/** Panel → Maquetas: lo que llega por /enviar-maqueta (Fase 4.3 del plan SEO). */
export default function DemosManager () {
  const { getToken } = useAuth()
  const [demos, setDemos] = useState([])
  const [filter, setFilter] = useState('nueva')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const request = useCallback(async (path, options = {}) => {
    const token = await getToken()
    const res = await fetch(`${API_URL}/demos${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
    return body
  }, [getToken])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const body = await request(filter ? `?status=${filter}&count=100` : '?count=100')
      setDemos(body.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request, filter])

  useEffect(() => { load() }, [load])

  const update = async (demo, changes) => {
    const saved = await request(`/${demo._id}`, { method: 'PATCH', body: JSON.stringify(changes) })
    setDemos(prev => prev.map(d => (d._id === saved._id ? saved : d)).filter(d => !filter || d.status === filter))
  }

  return (
    <div className="admin-list">
      <div className="admin-actions">
        {Object.entries({ '': 'Todas', ...STATUSES }).map(([key, label]) => (
          <button key={key} type="button" className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      {loading && <p>Cargando…</p>}
      {error && <p className="admin-message">Error: {error}</p>}
      {!loading && demos.length === 0 && <p>No hay maquetas en este estado.</p>}
      {demos.map(demo => (
        <article key={demo._id} className="admin-demo">
          <header>
            <strong>{demo.artistName}</strong>
            <span className="admin-table__meta">
              {[demo.city, demo.genres?.join(', '), new Date(demo.createdAt).toLocaleDateString('es-ES')].filter(Boolean).join(' · ')}
            </span>
          </header>
          <p>
            <a href={`mailto:${demo.email}`}>{demo.email}</a>
            {demo.instagram && <> · {demo.instagram}</>}
          </p>
          <ul>
            {demo.links.map(link => <li key={link}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>)}
          </ul>
          {demo.message && <p className="admin-demo__message">{demo.message}</p>}
          <div className="admin-actions">
            <select value={demo.status} onChange={e => update(demo, { status: e.target.value })} aria-label="Estado">
              {Object.entries(STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <input
              defaultValue={demo.notes}
              placeholder="Notas internas"
              onBlur={e => e.target.value !== demo.notes && update(demo, { notes: e.target.value })}
              aria-label="Notas"
            />
          </div>
        </article>
      ))}
    </div>
  )
}
