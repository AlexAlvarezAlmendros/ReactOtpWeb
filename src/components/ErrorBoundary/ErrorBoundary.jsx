import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError (error) {
    return { hasError: true }
  }

  componentDidCatch (error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render () {
    if (this.state.hasError) {
      const errorMessages = [
        '¡Ups! Parece que algo se rompió...',
        '¡Houston, tenemos un problema!',
        '¡Error 500! (Pero con estilo)',
        '¡La aplicación se fue de gira sin avisar!',
        '¡Algo salió mal en el estudio!'
      ]

      const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)]

      return (
        <div className='error-boundary'>
          <div className='error-content'>
            {/* Vinyl record icon animation */}
            <div className='vinyl-container'>
              <div className='vinyl-record'>
                <div className='vinyl-hole'></div>
                <div className='vinyl-line'></div>
                <div className='vinyl-line'></div>
                <div className='vinyl-line'></div>
              </div>
              <div className='needle'></div>
            </div>

            <h1>{randomMessage}</h1>
            <p className='error-subtitle'>
              Parece que nuestro código decidió improvisar un solo... ¡y se perdió!
            </p>

            <div className='error-details'>
              <div className='error-box'>
                <h3>🎵 ¿Qué pasó?</h3>
                <p>
                  Algo en nuestra aplicación se salió del compás. No te preocupes, 
                  nuestros desarrolladores están afinando los instrumentos para solucionarlo.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='error-technical'>
                  <summary>Detalles técnicos (solo para desarrolladores)</summary>
                  <pre>{this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>

            <div className='error-actions'>
              <button onClick={this.handleRetry} className='retry-button'>
                🔄 Intentar de nuevo
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className='home-button'
              >
                🏠 Volver al inicio
              </button>
            </div>

            <div className='error-tips'>
              <h4>Mientras tanto, puedes:</h4>
              <ul>
                <li>🎧 Escuchar nuestra playlist en Spotify</li>
                <li>📸 Seguirnos en Instagram</li>
                <li>🔄 Refrescar la página</li>
                <li>☕ Tomar un café (siempre funciona)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
