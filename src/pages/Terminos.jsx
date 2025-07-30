import React from 'react'
import './Terminos.css'
import Footer from '../components/Footer/Footer'

function Terminos () {
  return (
    <>
	<div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Términos de Uso</h1>
          <p className="legal-date">Última actualización: 29 de julio de 2025</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Información General</h2>
            <div className="info-box">
              <p><strong>Denominación:</strong> Other People Records</p>
              <p><strong>NIF/CIF:</strong> A00982223</p>
              <p><strong>Domicilio:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</p>
              <p><strong>Email:</strong> justsomeotherpeople@gmail.com</p>
              <p><strong>Teléfono:</strong> +34 656 852 437</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>2. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes y reglamentos aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar este sitio web.</p>
          </section>

          <section className="legal-section">
            <h2>3. Servicios Ofrecidos</h2>
            <p>Other People Records ofrece los siguientes servicios:</p>
            <div className="services-grid">
              <div className="service-item">
                <h3>🎤 Servicios de Estudio</h3>
                <ul>
                  <li>Grabación profesional</li>
                  <li>Mezcla y mastering</li>
                  <li>Producción de beats</li>
                  <li>Sesiones de composición</li>
                  <li>Pulido de vocales</li>
                </ul>
              </div>
              <div className="service-item">
                <h3>🎵 Productos Digitales</h3>
                <ul>
                  <li>Venta de música</li>
                  <li>Beats instrumentales</li>
                  <li>Stems y multipistas</li>
                  <li>Licencias de uso</li>
                  <li>Productos digitales</li>
                </ul>
              </div>
              <div className="service-item">
                <h3>🎸 Servicios Adicionales</h3>
                <ul>
                  <li>Booking de artistas</li>
                  <li>Distribución digital</li>
                  <li>Consultoría musical</li>
                  <li>Promoción de artistas</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Uso del Sitio Web</h2>
            <h3>4.1 Uso Permitido</h3>
            <p>Usted puede utilizar nuestro sitio web para:</p>
            <ul>
              <li>Explorar información sobre nuestros servicios</li>
              <li>Contactar con nosotros para consultas</li>
              <li>Solicitar reservas de estudio</li>
              <li>Suscribirse a nuestro newsletter</li>
              <li>Conocer a nuestros artistas y eventos</li>
            </ul>

            <h3>4.2 Uso Prohibido</h3>
            <p>Está prohibido utilizar nuestro sitio web para:</p>
            <ul>
              <li>Realizar actividades ilegales o fraudulentas</li>
              <li>Enviar spam o contenido malicioso</li>
              <li>Intentar acceder a áreas restringidas</li>
              <li>Copiar o distribuir contenido sin autorización</li>
              <li>Interferir con el funcionamiento del sitio</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Reservas de Estudio</h2>
            <h3>5.1 Proceso de Reserva</h3>
            <p>Las reservas de estudio se realizan a través del formulario web. El proceso incluye:</p>
            <ul>
              <li>Envío de solicitud con fecha, hora y servicio deseado</li>
              <li>Confirmación de disponibilidad en 24-48 horas</li>
              <li>Acuerdo de condiciones específicas</li>
              <li>No se requiere pago online - todo es presencial</li>
            </ul>

            <h3>5.2 Cancelaciones</h3>
            <div className="info-box">
              <p><strong>Política de Cancelación:</strong> Las cancelaciones pueden realizarse sin penalización. Se recomienda avisar con la mayor antelación posible para facilitar la reorganización de horarios.</p>
            </div>

            <h3>5.3 Disponibilidad</h3>
            <p><strong>Horario de estudio:</strong> 9:00 - 20:00 horas</p>
            <p>Las reservas están sujetas a disponibilidad y confirmación previa.</p>
          </section>

          <section className="legal-section">
            <h2>6. Propiedad Intelectual</h2>
            <h3>6.1 Contenido del Sitio Web</h3>
            <p>Todo el contenido de este sitio web (textos, imágenes, logos, música) es propiedad de Other People Records y está protegido por las leyes de propiedad intelectual.</p>

            <h3>6.2 Material Grabado</h3>
            <div className="important-box">
              <p><strong>Derechos del Material Grabado:</strong> Los derechos sobre el material grabado en nuestros estudios se establecerán mediante contrato específico en cada caso, donde se definirán claramente:</p>
              <ul>
                <li>Propiedad de las grabaciones</li>
                <li>Derechos de uso y explotación</li>
                <li>Condiciones de distribución</li>
                <li>Créditos y reconocimientos</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>7. Limitación de Responsabilidad</h2>
            <p>Other People Records no será responsable de:</p>
            <ul>
              <li>Daños indirectos o consecuenciales</li>
              <li>Pérdida de datos o interrupciones del servicio</li>
              <li>Uso indebido de nuestros servicios por parte del usuario</li>
              <li>Contenido de sitios web de terceros enlazados</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Edad y Capacidad</h2>
            <div className="info-box">
              <p><strong>Sin Limitación de Edad:</strong> No hay restricciones de edad para utilizar nuestros servicios. Los menores de edad deberán contar con autorización de sus padres o tutores legales para la contratación de servicios.</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>9. Modificaciones del Servicio</h2>
            <p>Nos reservamos el derecho de:</p>
            <ul>
              <li>Modificar o discontinuar servicios con previo aviso</li>
              <li>Actualizar precios y condiciones</li>
              <li>Cambiar horarios de disponibilidad</li>
              <li>Mejorar o modificar el sitio web</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Ley Aplicable y Jurisdicción</h2>
            <div className="info-box">
              <p><strong>Ley Aplicable:</strong> Estos términos se rigen por la legislación española.</p>
              <p><strong>Jurisdicción:</strong> Los tribunales de Barcelona serán competentes para resolver cualquier disputa relacionada con estos términos.</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>11. Contacto</h2>
            <div className="contact-box">
              <p>Para cualquier consulta sobre estos Términos de Uso:</p>
              <ul>
                <li><strong>Email:</strong> justsomeotherpeople@gmail.com</li>
                <li><strong>Teléfono:</strong> +34 656 852 437</li>
                <li><strong>Dirección:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>12. Vigencia</h2>
            <p>Estos Términos de Uso entran en vigor el 29 de julio de 2025 y permanecerán vigentes hasta su modificación o sustitución.</p>
          </section>
        </div>
      </div>
    </div>
	<Footer />
	</>
  )
}

export default Terminos
