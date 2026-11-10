import { Link, useSearchParams } from 'react-router-dom'
import SeoPage from '../components/SeoPage/SeoPage'
import { usePosts, POST_CATEGORIES } from '../hooks/usePosts'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import './Revista.css'

function formatDate (value) {
  return value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

/** /revista: guías para artistas, escena y producción (Fase 4.6 del plan SEO). */
function Revista () {
  const [searchParams] = useSearchParams()
  const category = POST_CATEGORIES[searchParams.get('categoria')] ? searchParams.get('categoria') : undefined
  const { posts, loading } = usePosts({ count: 30, category })

  return (
    <SeoPage
      path="/revista"
      title="Revista: guías para artistas, escena urbana y producción"
      description="La revista de Other People Records: guías para artistas que empiezan (maquetas, contratos, distribución), la escena de trap y música urbana en España y producción musical."
      eyebrow="Revista"
      h1="Revista"
      lead="Lo que aprendemos trabajando con artistas: cómo mover una maqueta, qué mirar antes de firmar, cómo preparar un lanzamiento, quién está sonando en la escena y cómo producimos."
      crumbs={[{ label: 'Revista' }]}
    >
      <nav className="revista-categories" aria-label="Categorías">
        <Link to="/revista" className={!category ? 'is-active' : ''}>Todo</Link>
        {Object.entries(POST_CATEGORIES).map(([key, label]) => (
          <Link key={key} to={`/revista?categoria=${key}`} className={category === key ? 'is-active' : ''}>{label}</Link>
        ))}
      </nav>

      {loading && <LoadingSpinner message="Cargando artículos..." />}

      {!loading && posts.length === 0 && (
        <p>
          Estamos preparando los primeros artículos. Mientras tanto, si eres artista, mira cómo trabajamos con{' '}
          <Link to="/nuevos-talentos">nuevos talentos</Link> o <Link to="/enviar-maqueta">envíanos tu maqueta</Link>.
        </p>
      )}

      <ul className="revista-list">
        {posts.map(post => (
          <li key={post._id} className="revista-item">
            {post.coverImage && (
              <Link to={`/revista/${post.slug}`} className="revista-item__cover" tabIndex={-1} aria-hidden="true">
                <img src={post.coverImage} alt="" loading="lazy" width="640" height="360" />
              </Link>
            )}
            <div>
              <span className="revista-item__meta">
                {POST_CATEGORIES[post.category]} · {formatDate(post.publishedAt)}
              </span>
              <h2><Link to={`/revista/${post.slug}`}>{post.title}</Link></h2>
              {post.excerpt && <p>{post.excerpt}</p>}
            </div>
          </li>
        ))}
      </ul>

      <p className="revista-rss">
        <a href="/revista/rss.xml">Suscríbete por RSS</a> o a la <Link to="/newsletters">newsletter</Link>.
      </p>
    </SeoPage>
  )
}

export default Revista
