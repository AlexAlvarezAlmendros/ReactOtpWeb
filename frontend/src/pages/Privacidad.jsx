import React from 'react'
import './Privacidad.css'
import Footer from '../components/Footer/Footer'

function Privacidad () {
  return (
	<>
      <div className="legal-container">
        <header className="legal-header">
          <h1>Política de Privacidad</h1>
          <p className="legal-date">Última actualización: 29 de julio de 2025</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Responsable del Tratamiento</h2>
            <div className="info-box">
              <p><strong>Denominación:</strong> Other People Records</p>
              <p><strong>NIF/CIF:</strong> A00982223</p>
              <p><strong>Domicilio:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</p>
              <p><strong>Email:</strong> justsomeotherpeople@gmail.com</p>
              <p><strong>Teléfono:</strong> +34 656 852 437</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>2. Finalidades del Tratamiento</h2>
            <p>Tratamos sus datos personales para las siguientes finalidades:</p>
            <ul>
              <li><strong>Gestión de contacto:</strong> Para responder a sus consultas y solicitudes de información</li>
              <li><strong>Newsletter:</strong> Para enviarle información sobre nuestros servicios, eventos y novedades</li>
              <li><strong>Reservas de estudio:</strong> Para gestionar las reservas de sesiones de grabación y otros servicios</li>
              <li><strong>Marketing directo:</strong> Para informarle sobre nuestros servicios y promociones</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Datos que Recopilamos</h2>
            <p>Los tipos de datos personales que podemos recopilar incluyen:</p>
            <ul>
              <li><strong>Datos de identificación:</strong> Nombre y apellidos</li>
              <li><strong>Datos de contacto:</strong> Dirección de correo electrónico y número de teléfono</li>
              <li><strong>Datos de la reserva:</strong> Fecha, hora y tipo de servicio solicitado</li>
              <li><strong>Datos de comunicación:</strong> Mensajes y consultas que nos envíe</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Base Legal del Tratamiento</h2>
            <div className="info-box">
              <p><strong>Consentimiento:</strong> Para el envío de newsletter y comunicaciones de marketing</p>
              <p><strong>Ejecución de contrato:</strong> Para la gestión de reservas y prestación de servicios</p>
              <p><strong>Interés legítimo:</strong> Para responder a consultas y mejorar nuestros servicios</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>5. Conservación de Datos</h2>
            <p>Sus datos personales se conservarán durante los siguientes períodos:</p>
            <ul>
              <li><strong>Datos de contacto:</strong> Hasta que solicite la baja o retire el consentimiento</li>
              <li><strong>Newsletter:</strong> Hasta que se desuscriba</li>
              <li><strong>Reservas:</strong> Durante 5 años desde la última actividad</li>
              <li><strong>Consultas:</strong> Durante 2 años desde la respuesta</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Destinatarios de los Datos</h2>
            <p>Sus datos personales <strong>no se comparten con terceros</strong>. Únicamente utilizamos:</p>
            <ul>
              <li><strong>Nodemailer + Gmail:</strong> Para el envío de correos electrónicos</li>
              <li><strong>Herramientas propias:</strong> Para la gestión de la web y los servicios</li>
            </ul>
            <p>No utilizamos Google Analytics ni otras herramientas de terceros para el análisis.</p>
          </section>

          <section className="legal-section">
            <h2>7. Sus Derechos</h2>
            <p>De conformidad con el RGPD, usted tiene los siguientes derechos:</p>
            <div className="rights-grid">
              <div className="right-item">
                <h3>Acceso</h3>
                <p>Solicitar información sobre qué datos tenemos sobre usted</p>
              </div>
              <div className="right-item">
                <h3>Rectificación</h3>
                <p>Corregir datos inexactos o incompletos</p>
              </div>
              <div className="right-item">
                <h3>Supresión</h3>
                <p>Solicitar la eliminación de sus datos</p>
              </div>
              <div className="right-item">
                <h3>Limitación</h3>
                <p>Limitar el tratamiento de sus datos</p>
              </div>
              <div className="right-item">
                <h3>Portabilidad</h3>
                <p>Recibir sus datos en formato estructurado</p>
              </div>
              <div className="right-item">
                <h3>Oposición</h3>
                <p>Oponerse al tratamiento de sus datos</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>8. Ejercicio de Derechos</h2>
            <div className="contact-box">
              <p>Para ejercer cualquiera de estos derechos, puede contactarnos:</p>
              <ul>
                <li><strong>Email:</strong> justsomeotherpeople@gmail.com</li>
                <li><strong>Asunto:</strong> "Ejercicio de Derechos RGPD"</li>
                <li><strong>Información requerida:</strong> Nombre completo, email y derecho que desea ejercer</li>
              </ul>
              <p>Responderemos a su solicitud en un plazo máximo de <strong>30 días</strong>.</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>9. Autoridad de Control</h2>
            <p>Si considera que el tratamiento de sus datos no se ajusta a la normativa, puede presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>:</p>
            <div className="info-box">
              <p><strong>Web:</strong> www.aepd.es</p>
              <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
              <p><strong>Teléfono:</strong> 901 100 099 / 912 663 517</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>10. Modificaciones</h2>
            <p>Esta Política de Privacidad puede ser actualizada periódicamente. Le notificaremos cualquier cambio significativo a través de nuestro sitio web o por correo electrónico.</p>
          </section>

          <section className="legal-section">
            <h2>11. Contacto</h2>
            <div className="contact-box">
              <p>Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos:</p>
              <ul>
                <li><strong>Email:</strong> justsomeotherpeople@gmail.com</li>
                <li><strong>Teléfono:</strong> +34 656 852 437</li>
                <li><strong>Dirección:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
		<Footer />
	</>
  )
}

export default Privacidad
