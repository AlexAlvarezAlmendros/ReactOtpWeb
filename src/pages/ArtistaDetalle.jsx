import { useParams, Link } from 'react-router-dom'
import { useArtist } from '../hooks/useArtist'
import { useArtistReleases } from '../hooks/useArtistReleases'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import ReleaseCard from '../components/ReleaseCard/ReleaseCard'
import './ArtistaDetalle.css'

function ArtistaDetalle () {
  const { id } = useParams()
  const { artist, loading, error } = useArtist(id)
  const { releases, loading: releasesLoading } = useArtistReleases(artist?.title, 3)

  if (loading) {
    return <LoadingSpinner message="Cargando artista..." />
  }

  if (error) {
    return (
      <section className="artista-section">
        <div className="artista-container">
          <div className="error-container">
            <h2>Error al cargar el artista</h2>
            <p>{error}</p>
            <Link to="/artistas" className="back-button-subtle">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              Volver a Artistas
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (!artist) {
    return (
      <section className="artista-section">
        <div className="artista-container">
          <div className="error-container">
            <h2>Artista no encontrado</h2>
            <p>El artista que buscas no existe o ha sido eliminado.</p>
            <Link to="/artistas" className="back-button-subtle">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} />
              Volver a Artistas
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const socialLinks = [
    { link: artist.spotifyLink, icon: ['fab', 'spotify'], label: 'Spotify', color: '#1DB954' },
    { link: artist.youtubeLink, icon: ['fab', 'youtube'], label: 'YouTube', color: '#FF0000' },
    { link: artist.appleMusicLink, icon: ['fab', 'apple'], label: 'Apple Music', color: '#000000' },
    { link: artist.instagramLink, icon: ['fab', 'instagram'], label: 'Instagram', color: '#E4405F' },
    { link: artist.soundCloudLink, icon: ['fab', 'soundcloud'], label: 'SoundCloud', color: '#FF3300' },
    { link: artist.beatStarsLink, icon: ['fas', 'music'], label: 'BeatStars', color: '#FF6B35' }
  ].filter(item => item.link)

  return (
    <section className="artista-section">
      <div className="artista-container">
        {/* Botón de volver discreto */}
        <Link to="/artistas" className="back-button-subtle">
          <FontAwesomeIcon icon={['fas', 'arrow-left']} />
          Volver a Artistas
        </Link>

        {/* Encabezado del artista */}
        <header className="artista-header">
          <div className="artista-image-container">
            <img 
              src={artist.img} 
              alt={`Imagen de ${artist.title}`}
              className="artista-image"
            />
          </div>
          <div className="artista-main-info">
            <h1 className="artista-title">{artist.title}</h1>
            <div className="artista-underline"></div>
            <div className="artista-meta">
              {artist.artistType && (
                <span className="artista-type">{artist.artistType}</span>
              )}
            </div>
          </div>
        </header>

        <div className="artista-content">
          {/* Sección de Proyectos */}
          <div className="artista-projects">
            <h2 className="section-title">Proyectos en los que aparece</h2>
            <div className="section-underline"></div>
            
            {releasesLoading ? (
              <div className="projects-loading">
                <LoadingSpinner message="Cargando proyectos..." />
              </div>
            ) : releases.length > 0 ? (
              <div className="projects-grid">
                {releases.map((release) => (
                  <ReleaseCard key={release.id} card={release} />
                ))}
              </div>
            ) : (
              <div className="no-projects">
                <p>Este artista aún no tiene proyectos registrados.</p>
              </div>
            )}
          </div>

          {/* Sección de Enlaces */}
          {socialLinks.length > 0 && (
            <div className="artista-social">
              <h2 className="section-title">Enlaces</h2>
              <div className="section-underline"></div>
              <div className="social-links-grid">
                {socialLinks.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-card"
                    style={{ '--social-color': item.color }}
                    aria-label={`${artist.title} en ${item.label}`}
                  >
                    <div className="social-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <span className="social-label">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ArtistaDetalle
