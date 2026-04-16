import React from 'react'
import './Cookies.css'
import Footer from '../components/Footer/Footer'

function Cookies () {
  return (
    
	<>
	<div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Política de Cookies</h1>
          <p className="legal-date">Última actualización: 29 de julio de 2025</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Información General</h2>
            <div className="info-box">
              <p><strong>Responsable:</strong> Other People Records</p>
              <p><strong>NIF/CIF:</strong> A00982223</p>
              <p><strong>Domicilio:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</p>
              <p><strong>Email:</strong> justsomeotherpeople@gmail.com</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>2. ¿Qué son las Cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos permiten reconocer su dispositivo y mejorar su experiencia de navegación.</p>
          </section>

          <section className="legal-section">
            <h2>3. Tipos de Cookies que Utilizamos</h2>
            
            <div className="cookie-type">
              <h3>🔧 Cookies Técnicas Necesarias</h3>
              <div className="cookie-item">
                <h4>Gestión de Newsletter</h4>
                <p><strong>Finalidad:</strong> Recordar si ya se ha suscrito al newsletter</p>
                <p><strong>Duración:</strong> 1 año</p>
                <p><strong>Tipo:</strong> Cookie propia</p>
              </div>
              
              <div className="cookie-item">
                <h4>Aceptación de Cookies</h4>
                <p><strong>Finalidad:</strong> Recordar su preferencia sobre el uso de cookies</p>
                <p><strong>Duración:</strong> 1 año</p>
                <p><strong>Tipo:</strong> Cookie propia</p>
              </div>
              
              <div className="cookie-item">
                <h4>Auth0 (Autenticación)</h4>
                <p><strong>Finalidad:</strong> Gestión de sesiones de usuario y autenticación</p>
                <p><strong>Duración:</strong> Según configuración de Auth0</p>
                <p><strong>Tipo:</strong> Cookie de terceros (Auth0)</p>
                <p><strong>Más información:</strong> <a href="https://auth0.com/docs/secure/cookies" target="_blank" rel="noopener noreferrer">Política de Cookies de Auth0</a></p>
              </div>
            </div>

            <div className="no-cookies-section">
              <h3>❌ Cookies que NO Utilizamos</h3>
              <div className="no-cookie-grid">
                <div className="no-cookie-item">
                  <h4>Análisis/Estadísticas</h4>
                  <p>No utilizamos Google Analytics ni otras herramientas de análisis</p>
                </div>
                <div className="no-cookie-item">
                  <h4>Redes Sociales</h4>
                  <p>No tenemos cookies de tracking de redes sociales</p>
                </div>
                <div className="no-cookie-item">
                  <h4>Publicitarias</h4>
                  <p>No utilizamos cookies para publicidad o marketing</p>
                </div>
                <div className="no-cookie-item">
                  <h4>Terceros</h4>
                  <p>No compartimos datos con terceros (excepto Auth0)</p>
                </div>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Base Legal para el Uso de Cookies</h2>
            <div className="legal-basis">
              <div className="basis-item">
                <h3>Cookies Técnicas Necesarias</h3>
                <p><strong>Base legal:</strong> Interés legítimo y necesidad técnica</p>
                <p>Estas cookies son esenciales para el funcionamiento del sitio web y no requieren consentimiento.</p>
              </div>
              
              <div className="basis-item">
                <h3>Cookies de Auth0</h3>
                <p><strong>Base legal:</strong> Necesidad técnica para la autenticación</p>
                <p>Requeridas para el funcionamiento del sistema de login y registro.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>5. Gestión de Cookies</h2>
            
            <h3>5.1 Configuración del Navegador</h3>
            <p>Puede configurar su navegador para:</p>
            <ul>
              <li>Aceptar o rechazar todas las cookies</li>
              <li>Ser notificado cuando se reciban cookies</li>
              <li>Eliminar cookies existentes</li>
            </ul>

            <div className="browser-links">
              <h4>Enlaces de ayuda por navegador:</h4>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
            </div>

            <h3>5.2 Deshabilitar Cookies</h3>
            <div className="warning-box">
              <p><strong>⚠️ Importante:</strong> Si deshabilita las cookies técnicas necesarias, algunas funcionalidades del sitio web podrían no funcionar correctamente, como:</p>
              <ul>
                <li>Recordar si ya está suscrito al newsletter</li>
                <li>Mantener sus preferencias de cookies</li>
                <li>Funcionalidades de autenticación</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>6. Cookies de Terceros</h2>
            
            <h3>Auth0</h3>
            <div className="third-party-info">
              <p><strong>Proveedor:</strong> Auth0, Inc.</p>
              <p><strong>Finalidad:</strong> Autenticación y gestión de sesiones de usuario</p>
              <p><strong>Política de Privacidad:</strong> <a href="https://auth0.com/privacy" target="_blank" rel="noopener noreferrer">https://auth0.com/privacy</a></p>
              <p><strong>Política de Cookies:</strong> <a href="https://auth0.com/docs/secure/cookies" target="_blank" rel="noopener noreferrer">https://auth0.com/docs/secure/cookies</a></p>
            </div>
          </section>

          <section className="legal-section">
            <h2>7. Actualización de la Política</h2>
            <p>Esta Política de Cookies puede ser actualizada periódicamente para reflejar cambios en nuestras prácticas o por motivos operativos, legales o regulatorios.</p>
            <p>Le recomendamos revisar esta página periódicamente para estar informado sobre cómo utilizamos las cookies.</p>
          </section>

          <section className="legal-section">
            <h2>8. Más Información</h2>
            <div className="info-links">
              <p>Para obtener más información sobre las cookies, puede consultar:</p>
              <ul>
                <li><a href="https://www.aepd.es/es/areas-de-actuacion/internet/cookies" target="_blank" rel="noopener noreferrer">Guía sobre cookies - AEPD</a></li>
                <li><a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer">About Cookies (inglés)</a></li>
                <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">All About Cookies (inglés)</a></li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>9. Contacto</h2>
            <div className="contact-box">
              <p>Si tiene alguna pregunta sobre nuestra Política de Cookies:</p>
              <ul>
                <li><strong>Email:</strong> justsomeotherpeople@gmail.com</li>
                <li><strong>Asunto:</strong> "Consulta sobre Cookies"</li>
                <li><strong>Teléfono:</strong> +34 656 852 437</li>
                <li><strong>Dirección:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
	<Footer />
	</>

  )
}

export default Cookies
