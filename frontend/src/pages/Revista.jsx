import { Link, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SeoPage from '../components/SeoPage/SeoPage'
import { SeoButton } from '../components/SeoPage/SeoBlocks'
import GlassSurface from '../components/GlassSurface'
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
      hero={
        <nav className="revista-categories" aria-label="Categorías">
          <Link to="/revista" className={!category ? 'is-active' : ''}>Todo</Link>
          {Object.entries(POST_CATEGORIES).map(([key, label]) => (
            <Link key={key} to={`/revista?categoria=${key}`} className={category === key ? 'is-active' : ''}>{label}</Link>
          ))}
        </nav>
      }
    >
      <section className="seo-section">
        {loading && <LoadingSpinner message="Cargando artículos..." />}

        {!loading && posts.length === 0 && (
          <GlassSurface className="seo-empty">
            <span className="seo-feature__icon" aria-hidden="true">
              <FontAwesomeIcon icon={['fas', 'newspaper']} />
            </span>
            <h2 className="seo-empty__title">Los primeros artículos, en camino</h2>
            <p className="seo-empty__text">
              Mientras tanto, si eres artista, mira cómo trabajamos con nuevos talentos o mándanos tu música.
            </p>
            <div className="seo-actions">
              <SeoButton to="/enviar-maqueta" icon="arrow-right">Enviar mi maqueta</SeoButton>
              <SeoButton to="/nuevos-talentos" variant="secondary">Nuevos talentos</SeoButton>
            </div>
          </GlassSurface>
        )}

        {posts.length > 0 && (
          <ul className="revista-grid">
            {posts.map(post => (
              <li key={post._id}>
                <GlassSurface as={Link} to={`/revista/${post.slug}`} className="revista-card">
                  {post.coverImage && (
                    <img src={post.coverImage} alt="" loading="lazy" width="640" height="360" className="revista-card__cover" />
                  )}
                  <span className="revista-card__body">
                    <span className="revista-card__meta">
                      {POST_CATEGORIES[post.category]} · {formatDate(post.publishedAt)}
                    </span>
                    <h2 className="revista-card__title">{post.title}</h2>
                    {post.excerpt && <span className="revista-card__excerpt">{post.excerpt}</span>}
                    <span className="seo-feature__more" aria-hidden="true">
                      Leer <FontAwesomeIcon icon={['fas', 'arrow-right']} />
                    </span>
                  </span>
                </GlassSurface>
              </li>
            ))}
          </ul>
        )}

        <p className="revista-rss">
          <FontAwesomeIcon icon={['fas', 'envelope-open-text']} aria-hidden="true" />
          <span>
            Suscríbete por <a href="/revista/rss.xml">RSS</a> o a la <Link to="/newsletters">newsletter</Link>.
          </span>
        </p>
      </section>
    </SeoPage>
  )
}

export default Revista
