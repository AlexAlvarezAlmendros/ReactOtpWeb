import { useParams, Link } from 'react-router-dom'
import { useArtist } from '../hooks/useArtist'
import { useArtistReleases } from '../hooks/useArtistReleases'
import { useArtistBeats } from '../hooks/useArtistBeats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import ReleaseCard from '../components/ReleaseCard/ReleaseCard'
import BeatCard from '../components/BeatCard/BeatCard'
import LazyImage from '../components/LazyImage/LazyImage'
import './ArtistaDetalle.css'

function ArtistaDetalle () {
  const { id } = useParams()
  const { artist, loading, error } = useArtist(id)
  const { releases, loading: releasesLoading } = useArtistReleases(artist?.title, 3)
  const { beats, loading: beatsLoading } = useArtistBeats(artist?.title, 6)

  if (loading) {
    return <LoadingSpinner message="Cargando artista..." />
  }

  if (error) {
    return (
      <section className="artista-detail">
        <div className="artista-detail__error">
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="artista-detail__error-icon" />
          <h2>Error al cargar el artista</h2>
          <p>{error}</p>
          <Link to="/artistas" className="artista-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Artistas
          </Link>
        </div>
      </section>
    )
  }

  if (!artist) {
    return (
      <section className="artista-detail">
        <div className="artista-detail__error">
          <FontAwesomeIcon icon={['fas', 'user-slash']} className="artista-detail__error-icon" />
          <h2>Artista no encontrado</h2>
          <p>El artista que buscas no existe o ha sido eliminado.</p>
          <Link to="/artistas" className="artista-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Volver a Artistas
          </Link>
        </div>
      </section>
    )
  }

  const socialLinks = [
    { link: artist.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify', color: '#1DB954' },
    { link: artist.youtubeLink, icon: ['fab', 'youtube'], label: 'YouTube', color: '#FF0000' },
    { link: artist.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music', color: '#fc3c44' },
    { link: artist.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram', color: '#E4405F' },
    { link: artist.soundCloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud', color: '#FF3300' },
    { link: artist.beatStarsLink, icon: ['fas', 'music'], label: 'BeatStars', color: '#FF6B35' }
  ].filter(item => item.link)

  return (
    <section className="artista-detail">
      {/* Hero Banner */}
      <div className="artista-hero">
        <div className="artista-hero__backdrop">
          <img src={artist.img} alt="" className="artista-hero__bg" aria-hidden="true" />
          <div className="artista-hero__overlay" />
        </div>
        <div className="artista-hero__content">
          <Link to="/artistas" className="artista-detail__back-link">
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            Artistas
          </Link>
          <div className="artista-hero__profile">
            <div className="artista-hero__avatar-wrapper">
              <LazyImage
                src={artist.img}
                alt={`Imagen de ${artist.title}`}
                className="artista-hero__avatar"
              />
            </div>
            <div className="artista-hero__info">
              <h1 className="artista-hero__name">{artist.title}</h1>
              <div className="artista-hero__accent" />
              {artist.artistType && (
                <span className="artista-hero__badge">{artist.artistType}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="artista-detail__body">
        {/* Proyectos */}
        <div className="artista-detail__section">
          <div className="artista-detail__section-header">
            <h2>Proyectos</h2>
            <div className="artista-detail__section-line" />
          </div>

          {releasesLoading ? (
            <div className="artista-detail__loading">
              <LoadingSpinner message="Cargando proyectos..." />
            </div>
          ) : releases.length > 0 ? (
            <div className="artista-detail__projects-grid">
              {releases.map((release) => (
                <ReleaseCard key={release.id} card={release} />
              ))}
            </div>
          ) : (
            <div className="artista-detail__empty">
              <FontAwesomeIcon icon={['fas', 'compact-disc']} className="artista-detail__empty-icon" />
              <p>Este artista aún no tiene proyectos registrados.</p>
            </div>
          )}
        </div>

        {/* Beats */}
        {(beatsLoading || beats.length > 0) && (
          <div className="artista-detail__section">
            <div className="artista-detail__section-header">
              <h2>Beats</h2>
              <div className="artista-detail__section-line" />
            </div>
            {beatsLoading ? (
              <div className="artista-detail__loading">
                <LoadingSpinner message="Cargando beats..." />
              </div>
            ) : (
              <div className="artista-detail__beats-grid">
                {beats.map((beat) => (
                  <BeatCard key={beat._id || beat.id} card={beat} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enlaces */}
        {socialLinks.length > 0 && (
          <div className="artista-detail__section">
            <div className="artista-detail__section-header">
              <h2>Escúchalo en</h2>
              <div className="artista-detail__section-line" />
            </div>
            <div className="artista-detail__social-grid">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artista-social-card"
                  style={{ '--social-color': item.color }}
                  aria-label={`${artist.title} en ${item.label}`}
                >
                  <div className="artista-social-card__icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <span className="artista-social-card__label">{item.label}</span>
                  <FontAwesomeIcon icon={['fas', 'arrow-right']} className="artista-social-card__arrow" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ArtistaDetalle
