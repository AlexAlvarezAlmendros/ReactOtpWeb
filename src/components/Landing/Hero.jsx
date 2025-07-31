import './Hero.css'
import { NavLink } from 'react-router'

export function Hero () {
  return (
    <section className='hero-section'>
      <div className='hero-video-container'>
        <video
          loop
          muted
          autoPlay
          playsInline
          poster="/img/hero/portada1.png"
          className='hero-video'
        >
          <source src="/video/hero1.mp4" type="video/mp4" />
        </video>
        <div className='hero-overlay'></div>
      </div>

      <div className='hero-content'>
        <img src="/img/logo.gif" alt="Logo" className='hero-logo' />
        <div className='hero-text'>
          <h1 className='hero-title'>OTHER PEOPLE RECORDS</h1>
          <p className='hero-subtitle'>Trap & Rap Live - Producción y Distribución</p>
          <div className='hero-buttons'>
            <NavLink className='hero-cta' to="/contacto">Booking</NavLink>
            <NavLink target="_blank" className='hero-cta' to="https://open.spotify.com/playlist/0dn9LnyS9u2kbBGTPKAHPz?si=ba612b6413ea40ad">Escuchar</NavLink>
          </div>
        </div>
      </div>
    </section>
  )
}
