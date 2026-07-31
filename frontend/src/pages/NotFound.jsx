import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import './NotFound.css'
import { usePageMeta } from '../hooks/usePageMeta'

function NotFound () {
  usePageMeta({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    noindex: true
  })

  const [currentJoke, setCurrentJoke] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const jokes = [
    {
      title: 'Remix perdido',
      subtitle: '¡Alguien borró los stems de esta página!',
      description: 'Esta URL necesita un buen mastering... ¡no suena!'
    }
  ]

  const tips = [
    { emoji: '🎵', text: 'Explora nuestra discografía' },
    { emoji: '🎤', text: 'Conoce a nuestros artistas' },
    { emoji: '🎧', text: 'Escucha nuestras playlists' },
    { emoji: '📅', text: 'Revisa próximos eventos' },
    { emoji: '🏠', text: 'Vuelve al inicio' },
    { emoji: '🎸', text: 'Descubre nuestros estudios' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJoke((prev) => (prev + 1) % jokes.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [jokes.length])

  const handlePlayButton = () => {
    setIsPlaying(!isPlaying)
    // Simulate "playing" the error sound
    setTimeout(() => setIsPlaying(false), 2000)
  }

  return (
    <div className='not-found'>
      <div className='not-found-content'>
        {/* Animated cassette tape */}
        <div className='cassette-container'>
          <div className='cassette'>
            <div className='cassette-body'>
              <div className='cassette-label'>
                <div className='label-text'>ERROR 404</div>
                <div className='label-subtext'>PÁGINA PERDIDA</div>
              </div>
              <div className='cassette-reels'>
                <div className={`reel left ${isPlaying ? 'spinning' : ''}`}>
                  <div className='reel-center'></div>
                </div>
                <div className={`reel right ${isPlaying ? 'spinning' : ''}`}>
                  <div className='reel-center'></div>
                </div>
              </div>
              <div className='cassette-controls'>
                <button 
                  className={`play-button ${isPlaying ? 'playing' : ''}`}
                  onClick={handlePlayButton}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
            </div>
          </div>
          <div className='cassette-shadow'></div>
        </div>

        {/* Dynamic content */}
        <div className='error-text'>
          <h1 className='error-title'>{jokes[currentJoke].title}</h1>
          <h2 className='error-subtitle'>{jokes[currentJoke].subtitle}</h2>
          <p className='error-description'>{jokes[currentJoke].description}</p>
        </div>

        {/* Error code display */}
        <div className='error-code'>
          <div className='code-display'>
            <span className='code-number'>404</span>
            <div className='code-bars'>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
            </div>
          </div>
        </div>

        {/* Navigation options */}
        <div className='navigation-section'>
          <h3>¿Qué tal si probamos con...?</h3>
          <div className='navigation-grid'>
            <Link to="/" className='nav-card'>
              <div className='nav-icon'>🏠</div>
              <div className='nav-text'>Inicio</div>
            </Link>
            <Link to="/artistas" className='nav-card'>
              <div className='nav-icon'>🎤</div>
              <div className='nav-text'>Artistas</div>
            </Link>
            <Link to="/discografia" className='nav-card'>
              <div className='nav-icon'>💿</div>
              <div className='nav-text'>Discografía</div>
            </Link>
            <Link to="/eventos" className='nav-card'>
              <div className='nav-icon'>🎵</div>
              <div className='nav-text'>Eventos</div>
            </Link>
            <Link to="/estudios" className='nav-card'>
              <div className='nav-icon'>🎧</div>
              <div className='nav-text'>Estudios</div>
            </Link>
            <Link to="/contacto" className='nav-card'>
              <div className='nav-icon'>📧</div>
              <div className='nav-text'>Contacto</div>
            </Link>
          </div>
        </div>

        {/* Fun tips */}
        <div className='tips-section'>
          <h4>Mientras tanto, puedes:</h4>
          <div className='tips-list'>
            {tips.map((tip, index) => (
              <div key={index} className='tip-item'>
                <span className='tip-emoji'>{tip.emoji}</span>
                <span className='tip-text'>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        <div className='back-actions'>
          <button onClick={() => window.history.back()} className='back-button'>
            ⬅️ Volver atrás
          </button>
          <Link to="/" className='home-button'>
            🏠 Ir al inicio
          </Link>
        </div>

        {/* Easter egg */}
        <div className='easter-egg'>
          <p>
            💡 <strong>Dato curioso:</strong> Las páginas 404 fueron nombradas así por la habitación 404 
            en el CERN donde estaba el primer servidor web del mundo.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
