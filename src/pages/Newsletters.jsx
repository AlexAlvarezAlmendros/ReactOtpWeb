import { useNewsletters } from '../hooks/useNewsletters'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Newsletters.css'

const API_URL = import.meta.env.VITE_API_URL

function Newsletters () {
  const { newsletters, loading, error } = useNewsletters({ 
    count: 100, 
    sortBy: 'createdAt',
    sortOrder: 'desc' 
  })
  
  const [featuredRelease, setFeaturedRelease] = useState(null)

  // Filtrar solo newsletters enviadas
  const sentNewsletters = newsletters.filter(n => n.status === 'sent')
  const latestNewsletter = sentNewsletters[0]
  const olderNewsletters = sentNewsletters.slice(1)

  // Obtener el primer release de upcomingReleases
  useEffect(() => {
    const fetchFirstRelease = async () => {
      if (!latestNewsletter?.content?.upcomingReleases?.length) {
        setFeaturedRelease(null)
        return
      }

      const firstReleaseId = latestNewsletter.content.upcomingReleases[0]
      
      try {
        const response = await fetch(`${API_URL}/releases/${firstReleaseId}`)
        if (!response.ok) throw new Error('Error fetching release')
        
        const release = await response.json()
        setFeaturedRelease(release)
      } catch (err) {
        console.error('Error fetching featured release:', err)
        setFeaturedRelease(null)
      }
    }

    fetchFirstRelease()
  }, [latestNewsletter])

  if (loading) {
    return (
      <div className="newsletters-page">
        <h1>Nuestras Newsletters</h1>
        <p>Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="newsletters-page">
        <h1>Nuestras Newsletters</h1>
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!sentNewsletters.length) {
    return (
      <div className="newsletters-page">
        <h1>Nuestras Newsletters</h1>
        <p>Aún no hay newsletters publicadas.</p>
      </div>
    )
  }

  return (
    <div className="newsletters-page">
      <h1>Nuestras Newsletters</h1>
      
      {/* Newsletter destacada */}
      {latestNewsletter && (
        <section className="featured-newsletter">
          <div className="featured-label">Última Newsletter</div>
          <NavLink 
            to={`/news/${latestNewsletter.slug}`} 
            className="featured-card"
            style={{
              backgroundImage: featuredRelease?.img 
                ? `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%), url(${featuredRelease.img})`
                : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
            }}
          >
            <div className="featured-content">
              <div className="featured-date">
                {new Date(latestNewsletter.createdAt).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <h2 className="featured-title">{latestNewsletter.title}</h2>
            </div>
            <div className="featured-cta">
              Leer más →
            </div>
          </NavLink>
        </section>
      )}

      {/* Newsletter anteriores */}
      {olderNewsletters.length > 0 && (
        <section className="older-newsletters">
          <h2 className="section-title">Newsletters Anteriores</h2>
          <div className="newsletters-grid">
            {olderNewsletters.map((newsletter) => (
              <NavLink
                key={newsletter._id}
                to={`/news/${newsletter.slug}`}
                className="newsletter-item"
              >
                <div className="newsletter-item-date">
                  {new Date(newsletter.createdAt).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <h3 className="newsletter-item-title">{newsletter.title}</h3>
                {newsletter.preview && (
                  <p className="newsletter-item-preview">{newsletter.preview}</p>
                )}
              </NavLink>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Newsletters
