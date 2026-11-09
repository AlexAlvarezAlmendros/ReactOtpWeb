import { useState } from 'react'
import RichTextEditor from '../RichTextEditor/RichTextEditor'
import { usePostsAdmin, POST_CATEGORIES } from '../../hooks/usePosts'
import { useAuth } from '../../hooks/useAuth'
import '../Forms/Forms.css'
import './Admin.css'

const EMPTY = { title: '', excerpt: '', content: '', coverImage: '', category: 'guias', tags: '', authorName: '', authorUrl: '', status: 'draft' }

const toForm = (post) => ({
  _id: post._id,
  title: post.title || '',
  excerpt: post.excerpt || '',
  content: post.content || '',
  coverImage: post.coverImage || '',
  category: post.category || 'guias',
  tags: (post.tags || []).join(', '),
  authorName: post.author?.name || '',
  authorUrl: post.author?.url || '',
  status: post.status || 'draft'
})

/** Panel → Revista: lista de artículos y editor (Fase 4.6 del plan SEO). */
export default function PostsManager () {
  const { user } = useAuth()
  const { posts, loading, error, getFull, save, remove } = usePostsAdmin()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const edit = async (post) => {
    setMessage(null)
    setForm(toForm(await getFull(post._id)))
  }

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await save({
        _id: form._id,
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        category: form.category,
        tags: form.tags,
        author: { name: form.authorName || user?.name || 'Other People Records', url: form.authorUrl },
        status: form.status
      })
      setMessage(form.status === 'published' ? 'Artículo publicado.' : 'Borrador guardado.')
      setForm(null)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (post) => {
    // Sin window.confirm: un segundo clic en el mismo botón confirma.
    if (post._confirm) {
      await remove(post._id)
    } else {
      post._confirm = true
      setMessage(`Vuelve a pulsar «Borrar» para eliminar «${post.title}».`)
    }
  }

  if (form) {
    return (
      <form className="form-layout admin-post-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="post-title">Título*</label>
          <input id="post-title" name="title" value={form.title} onChange={onChange} required maxLength={160} />
        </div>
        <div className="form-group">
          <label htmlFor="post-excerpt">Entradilla (meta description)</label>
          <textarea id="post-excerpt" name="excerpt" value={form.excerpt} onChange={onChange} rows={2} maxLength={320} />
          <small>{form.excerpt.length}/320. Lo que sale en Google y en la lista de la revista.</small>
        </div>
        <div className="form-layout__grid">
          <div className="form-group">
            <label htmlFor="post-category">Categoría</label>
            <select id="post-category" name="category" value={form.category} onChange={onChange}>
              {Object.entries(POST_CATEGORIES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="post-tags">Etiquetas</label>
            <input id="post-tags" name="tags" value={form.tags} onChange={onChange} placeholder="maquetas, contratos" />
          </div>
          <div className="form-group">
            <label htmlFor="post-author">Autor*</label>
            <input id="post-author" name="authorName" value={form.authorName} onChange={onChange} required placeholder="Nombre y apellido" />
          </div>
          <div className="form-group">
            <label htmlFor="post-author-url">Enlace del autor</label>
            <input id="post-author-url" type="url" name="authorUrl" value={form.authorUrl} onChange={onChange} placeholder="https://www.otherpeople.es/artistas/…" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="post-cover">Imagen de portada (URL)</label>
          <input id="post-cover" type="url" name="coverImage" value={form.coverImage} onChange={onChange} placeholder="https://…" />
        </div>
        <div className="form-group">
          <label>Contenido*</label>
          <RichTextEditor value={form.content} onChange={(html) => setForm(prev => ({ ...prev, content: html }))} placeholder="Escribe el artículo…" />
          <small>Experiencia real del sello: casos, cifras y ejemplos propios. Nada de texto genérico.</small>
        </div>
        <div className="form-group">
          <label htmlFor="post-status">Estado</label>
          <select id="post-status" name="status" value={form.status} onChange={onChange}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        {message && <p className="admin-message">{message}</p>}
        <div className="admin-actions">
          <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          <button type="button" onClick={() => setForm(null)}>Cancelar</button>
        </div>
      </form>
    )
  }

  return (
    <div className="admin-list">
      <div className="admin-actions">
        <button type="button" onClick={() => { setMessage(null); setForm({ ...EMPTY, authorName: user?.name || '' }) }}>+ Nuevo artículo</button>
      </div>
      {message && <p className="admin-message">{message}</p>}
      {loading && <p>Cargando…</p>}
      {error && <p className="admin-message">Error: {error}</p>}
      {!loading && posts.length === 0 && <p>Todavía no hay artículos.</p>}
      <table className="admin-table">
        <tbody>
          {posts.map(post => (
            <tr key={post._id}>
              <td>
                <strong>{post.title}</strong>
                <div className="admin-table__meta">
                  {POST_CATEGORIES[post.category]} · {post.status === 'published' ? `Publicado ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-ES') : ''}` : 'Borrador'}
                </div>
              </td>
              <td className="admin-table__actions">
                {post.status === 'published' && <a href={`/revista/${post.slug}`} target="_blank" rel="noopener noreferrer">Ver</a>}
                <button type="button" onClick={() => edit(post)}>Editar</button>
                <button type="button" onClick={() => onDelete(post)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
