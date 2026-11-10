import { Link, useParams } from 'react-router-dom'
import { usePost, POST_CATEGORIES } from '../hooks/usePosts'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import Footer from '../components/Footer/Footer'
import { SeoButton, SeoCta } from '../components/SeoPage/SeoBlocks'
import { excerpt, htmlToText, wordCount } from '../utils/seoText'
import NotFound from './NotFound'
import './Landing.css'
import './Revista.css'

const SITE_URL = 'https://www.otherpeople.es'

function formatDate (value) {
  return value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

/** /revista/:slug — artículo con JSON-LD Article y autor real. */
function RevistaPost () {
  const { id } = useParams()
  const { post, loading, error } = usePost(id)

  const text = htmlToText(post?.content)
  const url = post ? `${SITE_URL}/revista/${post.slug}` : undefined
  const minutes = Math.max(1, Math.round(wordCount(text) / 220))

  usePageMeta({
    title: post?.title,
    description: post ? (post.excerpt || excerpt(text)) : undefined,
    image: post?.coverImage || undefined,
    url: post ? `/revista/${post.slug}` : undefined,
    type: 'article'
  })

  useJsonLd(post
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt || excerpt(text, 300),
            image: post.coverImage || undefined,
            datePublished: post.publishedAt || post.createdAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: url,
            inLanguage: 'es-ES',
            articleSection: POST_CATEGORIES[post.category],
            keywords: (post.tags || []).join(', ') || undefined,
            wordCount: wordCount(text),
            author: { '@type': 'Person', name: post.author?.name, url: post.author?.url || undefined },
            publisher: { '@id': `${SITE_URL}/#organization` }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Revista', item: `${SITE_URL}/revista` },
              { '@type': 'ListItem', position: 3, name: post.title, item: url }
            ]
          }
        ]
      }
    : null)

  if (loading) return <LoadingSpinner message="Cargando artículo..." />
  if (error || !post) return <NotFound />

  return (
    <>
      <article className="seo-page revista-post">
        <header className="seo-hero revista-post__header">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Revista', to: '/revista' }, { label: post.title }]} align="center" />
          <span className="seo-eyebrow">{POST_CATEGORIES[post.category]}</span>
          <h1 className="revista-post__title">{post.title}</h1>
          <div className="seo-accent" aria-hidden="true" />
          <p className="revista-post__byline">
            Por {post.author?.url
              ? <a href={post.author.url}>{post.author.name}</a>
              : post.author?.name}{' '}
            · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {minutes} min de lectura
          </p>
          {post.excerpt && <p className="seo-hero__lead">{post.excerpt}</p>}
        </header>

        <div className="seo-body revista-post__body">
          <div>
            {post.coverImage && (
              <img className="revista-post__cover" src={post.coverImage} alt="" width="1200" height="675" />
            )}
            {/* HTML del editor del panel (lo escribe el equipo). */}
            <div className="revista-post__content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {post.tags?.length > 0 && (
              <ul className="revista-post__tags" aria-label="Etiquetas">
                {post.tags.map(tag => <li key={tag}>#{tag}</li>)}
              </ul>
            )}
          </div>

          <SeoCta
            title="¿Eres artista?"
            text="Escuchamos maquetas de trap y música urbana de toda España."
            to="/enviar-maqueta"
            label="Enviar mi maqueta"
          />

          <p className="revista-post__back">
            <SeoButton to="/revista" variant="secondary">Volver a la revista</SeoButton>
          </p>
        </div>
      </article>
      <Footer />
    </>
  )
}

export default RevistaPost
