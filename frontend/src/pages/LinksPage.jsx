import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLinksPage } from '../hooks/useLinksPage'
import { getPlatformIcon, getFaviconUrl } from '../utils/linkIcons'
import './LinksPage.css'

function LinksPage () {
  const { slug } = useParams()
  const { artist, loading, error } = useLinksPage(slug)

  if (loading) {
    return (
      <div className="lp lp--loading">
        <div className="lp-spinner" />
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="lp lp--error">
        <p className="lp-error-text">Artista no encontrado</p>
        <Link to="/" className="lp-brand">
          <span className="lp-brand__dot" />
          Other People Records
        </Link>
      </div>
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

  const customLinks = artist.customLinks || []

  return (
    <div className="lp">
      {artist.img && (
        <div
          className="lp-bg"
          style={{ backgroundImage: `url(${artist.img})` }}
          aria-hidden="true"
        />
      )}
      <div className="lp-bg-overlay" aria-hidden="true" />
      <div className="lp-orb lp-orb--1" aria-hidden="true" />
      <div className="lp-orb lp-orb--2" aria-hidden="true" />
      <div className="lp-orb lp-orb--3" aria-hidden="true" />

      <main className="lp-main">
        <div className="lp-profile">
          {artist.img && (
            <img src={artist.img} alt={artist.name} className="lp-avatar" />
          )}
          <h1 className="lp-name">{artist.name}</h1>
          {artist.artistType && (
            <span className="lp-type">{artist.artistType}</span>
          )}
          {artist.linksBio && (
            <p className="lp-bio">{artist.linksBio}</p>
          )}
        </div>

        <div className="lp-list">
          {socialLinks.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-item"
              style={{ '--lp-color': item.color }}
            >
              <span className="lp-item__icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className="lp-item__label">{item.label}</span>
              <FontAwesomeIcon icon={['fas', 'arrow-right']} className="lp-item__arrow" />
            </a>
          ))}
          {customLinks.map((item, i) => {
            const platform = getPlatformIcon(item.icon)
            const faviconUrl = !item.icon ? getFaviconUrl(item.url) : null
            return (
              <a
                key={`c-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-item lp-item--custom"
                style={platform ? { '--lp-color': platform.color } : undefined}
              >
                {platform ? (
                  <span className="lp-item__icon" style={{ background: platform.color }}>
                    <FontAwesomeIcon icon={platform.fa} />
                  </span>
                ) : faviconUrl ? (
                  <span className="lp-item__favicon">
                    <img
                      src={faviconUrl}
                      alt=""
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                    />
                    <FontAwesomeIcon icon={['fas', 'link']} style={{ display: 'none' }} />
                  </span>
                ) : (
                  <span className="lp-item__icon lp-item__icon--default">
                    <FontAwesomeIcon icon={['fas', 'link']} />
                  </span>
                )}
                <span className="lp-item__label">{item.label}</span>
                <FontAwesomeIcon icon={['fas', 'arrow-right']} className="lp-item__arrow" />
              </a>
            )
          })}
        </div>

        <footer className="lp-footer">
          <Link to="/" className="lp-brand">
            <span className="lp-brand__dot" />
            Other People Records
          </Link>
        </footer>
      </main>
    </div>
  )
}

export default LinksPage
