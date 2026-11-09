import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRelease } from '../hooks/useRelease'
import { useArtists } from '../hooks/useArtists'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { useCanonicalSlug } from '../hooks/useCanonicalSlug'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import LazyImage from '../components/LazyImage/LazyImage'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Footer from '../components/Footer/Footer'
import { getSpotifyUrlType, extractSpotifyId } from '../utils/spotifyHelpers'
import { artistPath, releasePath } from '../utils/paths'
import { excerpt } from '../utils/seoText'
import { serviceForCreditRole, studioServicePath } from '../data/studioServices'
import './ArtistaDetalle.css'
import './ReleaseDetalle.css'

const SITE_URL = 'https://www.otherpeople.es'

const TYPE_LABEL = { Album: 'Álbum', EP: 'EP', Song: 'Single', Videoclip: 'Videoclip' }

/** URL de embed de Spotify para un álbum o canción. */
function spotifyEmbedUrl (link) {
  const type = getSpotifyUrlType(link)
  const id = extractSpotifyId(link)
  if (!id || !['album', 'track'].includes(type)) return null
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
}

function formatDate (value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ReleaseDetalle () {
  const { id } = useParams()
  const { release, loading, error } = useRelease(id)
  const { artists } = useArtists()

  // Artistas del sello que firman el lanzamiento (por artistIds).
  const releaseArtists = useMemo(() => {
    if (!release?.artistIds?.length) return []
    const ids = release.artistIds.map(String)
    return artists.filter(artist => ids.includes(String(artist.id)))
  }, [release, artists])

  const typeLabel = TYPE_LABEL[release?.releaseType] || release?.releaseType
  const dateLabel = formatDate(release?.date)
  const year = release?.date ? new Date(release.date).getFullYear() : null
  const credits = Array.isArray(release?.credits) ? release.credits : []
  const description = (release?.description || '').trim()

  usePageMeta({
    title: release
      ? `${release.title}${release.subtitle ? ` — ${release.subtitle}` : ''} (${[typeLabel, year].filter(Boolean).join(', ')})`
      : undefined,
    description: release
      ? (description
          ? excerpt(description)
          : `${typeLabel || 'Lanzamiento'} «${release.title}»${release.subtitle ? ` de ${release.subtitle}` : ''}${dateLabel ? `, publicado el ${dateLabel}` : ''} por Other People Records, sello independiente de trap y música urbana. Escúchalo en Spotify, Apple Music y YouTube.`)
      : undefined,
    image: release?.img,
    url: release ? releasePath(release) : undefined,
    type: 'music.album'
  })

  // /discografia/<ObjectId> → /discografia/<slug>
  useCanonicalSlug(id, release, releasePath)

  useJsonLd(release
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': release.releaseType === 'Song' ? 'MusicRecording' : 'MusicAlbum',
            name: release.title,
            url: `${SITE_URL}${releasePath(release)}`,
            image: release.img || undefined,
            datePublished: release.date ? String(release.date).slice(0, 10) : undefined,
            description: description ? excerpt(description, 300) : undefined,
            byArtist: (releaseArtists.length ? releaseArtists : [{ title: release.subtitle }])
              .filter(a => a.title)
              .map(a => ({
                '@type': 'MusicGroup',
                name: a.title,
                url: a.id ? `${SITE_URL}${artistPath(a)}` : undefined
              })),
            ...(release.releaseType === 'Song'
              ? {}
              : { albumReleaseType: release.releaseType === 'EP' ? 'https://schema.org/EPRelease' : 'https://schema.org/AlbumRelease' }),
            recordLabel: { '@id': `${SITE_URL}/#organization` },
            sameAs: [release.spotifyLink, release.appleMusicLink, release.youtubeLink, release.soundCloudLink].filter(Boolean)
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Discografía', item: `${SITE_URL}/discografia` },
              { '@type': 'ListItem', position: 3, name: release.title, item: `${SITE_URL}${releasePath(release)}` }
            ]
          }
        ]
      }
    : null)

  if (loading) return <LoadingSpinner message="Cargando lanzamiento..." />

  if (error || !release) {
    return (
      <section className="artista-detail">
        <div className="artista-detail__error">
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="artista-detail__error-icon" />
          <h2>{error || 'Lanzamiento no encontrado'}</h2>
          <Link to="/discografia" className="artista-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a la discografía
          </Link>
        </div>
      </section>
    )
  }

  const embedUrl = spotifyEmbedUrl(release.spotifyLink)
  const listenLinks = [
    { link: release.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify' },
    { link: release.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music' },
    { link: release.youtubeLink, icon: ['fab', 'youtube'], label: 'YouTube' },
    { link: release.soundCloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud' }
  ].filter(item => item.link)

  return (
    <>
      <section className="artista-detail release-detail">
        <div className="artista-hero">
          <div className="artista-hero__backdrop">
            <img src={release.img} alt="" className="artista-hero__bg" aria-hidden="true" />
            <div className="artista-hero__overlay" />
          </div>
          <div className="artista-hero__content">
            <Breadcrumbs items={[
              { label: 'Inicio', to: '/' },
              { label: 'Discografía', to: '/discografia' },
              { label: release.title }
            ]} />
            <div className="artista-hero__profile">
              <div className="artista-hero__avatar-wrapper release-detail__cover">
                <LazyImage src={release.img} alt={`Portada de ${release.title}`} className="artista-hero__avatar" />
              </div>
              <div className="artista-hero__info">
                <h1 className="artista-hero__name">{release.title}</h1>
                <div className="artista-hero__accent" />
                <p className="release-detail__meta">
                  {[typeLabel, release.subtitle, dateLabel].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="artista-detail__body">
          {embedUrl && (
            <div className="artista-detail__section">
              <iframe
                className="release-detail__embed"
                title={`Escuchar ${release.title} en Spotify`}
                src={embedUrl}
                width="100%"
                height={release.releaseType === 'Song' ? 152 : 380}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            </div>
          )}

          {description && (
            <div className="artista-detail__section">
              <div className="artista-detail__section-header">
                <h2>Sobre el lanzamiento</h2>
                <div className="artista-detail__section-line" />
              </div>
              <div className="artista-detail__bio">
                {description.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {releaseArtists.length > 0 && (
            <div className="artista-detail__section">
              <div className="artista-detail__section-header">
                <h2>Artistas</h2>
                <div className="artista-detail__section-line" />
              </div>
              <ul className="release-detail__list">
                {releaseArtists.map(artist => (
                  <li key={artist.id}>
                    <Link to={artistPath(artist)}>{artist.title}</Link>
                    {artist.artistType && <span> · {artist.artistType}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {credits.length > 0 && (
            <div className="artista-detail__section">
              <div className="artista-detail__section-header">
                <h2>Créditos</h2>
                <div className="artista-detail__section-line" />
              </div>
              <dl className="release-detail__credits">
                {credits.map((credit, i) => {
                  const service = credit.inHouse ? serviceForCreditRole(credit.role) : null
                  return (
                    <div key={`${credit.role}-${i}`} className="release-detail__credit">
                      <dt>{credit.role}</dt>
                      <dd>
                        {credit.name}
                        {service && (
                          <> · <Link to={studioServicePath(service)}>{service.name} en Other People Records</Link></>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          )}

          {listenLinks.length > 0 && (
            <div className="artista-detail__section">
              <div className="artista-detail__section-header">
                <h2>Escúchalo</h2>
                <div className="artista-detail__section-line" />
              </div>
              <div className="release-detail__listen">
                {listenLinks.map(item => (
                  <a key={item.label} href={item.link} target="_blank" rel="noopener noreferrer" className="release-detail__listen-link">
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="release-detail__more">
            Más música del sello en la <Link to="/discografia">discografía</Link>. ¿Quieres sacar tu próximo tema con nosotros?
            Mira cómo trabajamos en <Link to="/estudio/produccion-musical">producción musical</Link> o{' '}
            <Link to="/enviar-maqueta">envíanos tu maqueta</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default ReleaseDetalle
