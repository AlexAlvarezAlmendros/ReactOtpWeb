import './Hero.css'

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
            <button className='hero-cta'>Booking</button>
            <button className='hero-cta'>Escuchar</button>
          </div>
        </div>
      </div>
    </section>
  )
}
