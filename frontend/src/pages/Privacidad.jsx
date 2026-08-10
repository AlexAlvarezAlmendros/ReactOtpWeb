import React from 'react'
import './Privacidad.css'
import Footer from '../components/Footer/Footer'
import GlassSurface from '../components/GlassSurface'
import { usePageMeta } from '../hooks/usePageMeta'

function Privacidad () {
  usePageMeta({
    title: 'Política de Privacidad',
    description: 'Información sobre el tratamiento de datos personales en otherpeople.es, web de Other People Records.'
  })

  return (
	<>
      <div className="legal-container">
        <header className="legal-header">
          <h1>Política de Privacidad</h1>
          <p className="legal-date">Última actualización: 10 de agosto de 2026</p>
        </header>

        <GlassSurface className="legal-content">
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
              <li><strong>Analítica web:</strong> Para conocer cómo se utiliza el sitio y mejorar su contenido y usabilidad</li>
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
              <li><strong>Datos de navegación:</strong> Páginas visitadas, página de procedencia, tipo de dispositivo, navegador, sistema operativo, idioma, resolución de pantalla y país aproximado</li>
              <li><strong>Datos de interacción:</strong> Clics, desplazamiento y movimientos del cursor dentro de las páginas públicas (ver apartado 7)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Base Legal del Tratamiento</h2>
            <div className="info-box">
              <p><strong>Consentimiento:</strong> Para el envío de newsletter y comunicaciones de marketing</p>
              <p><strong>Ejecución de contrato:</strong> Para la gestión de reservas y prestación de servicios</p>
              <p><strong>Interés legítimo:</strong> Para responder a consultas, mejorar nuestros servicios y medir el uso del sitio web (art. 6.1.f RGPD)</p>
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
              <li><strong>Datos de navegación y grabaciones de sesión:</strong> Durante 12 meses</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Destinatarios de los Datos</h2>
            <p>Sus datos personales <strong>no se comparten con terceros</strong>. Únicamente utilizamos:</p>
            <ul>
              <li><strong>Nodemailer + Gmail:</strong> Para el envío de correos electrónicos</li>
              <li><strong>Herramientas propias:</strong> Para la gestión de la web y los servicios</li>
            </ul>
            <p>No utilizamos Google Analytics ni ninguna plataforma publicitaria o de analítica de terceros. Las estadísticas de uso se generan con <strong>Umami</strong>, una herramienta de software libre alojada en un servidor propio del responsable, de modo que los datos de navegación no salen de nuestra infraestructura ni se ceden a nadie.</p>
          </section>

          <section className="legal-section">
            <h2>7. Analítica Web y Grabación de Sesiones</h2>
            <p>Para entender cómo se usa la web y poder mejorarla, utilizamos <strong>Umami</strong>, una herramienta de analítica de software libre <strong>alojada en un servidor propio</strong> (analiticas.alexalvarez.dev). No interviene ningún proveedor externo de publicidad ni de perfilado.</p>

            <div className="info-box">
              <p><strong>Sin cookies:</strong> la analítica no instala cookies ni almacena identificadores permanentes en su dispositivo</p>
              <p><strong>Sin IP almacenada:</strong> su dirección IP se usa únicamente, en el momento de la visita, para deducir el país y generar un identificador de sesión anónimo; no se conserva</p>
              <p><strong>Sin perfiles individuales:</strong> no cruzamos estos datos con su nombre, email ni con ninguna cuenta de usuario</p>
            </div>

            <h3>7.1 Qué medimos</h3>
            <ul>
              <li>Páginas visitadas, momento de la visita y página de procedencia</li>
              <li>Datos técnicos del dispositivo: navegador, sistema operativo, idioma, resolución y país aproximado</li>
              <li><strong>Grabación de sesión y mapas de calor:</strong> registramos los clics, el desplazamiento y los movimientos del cursor para reproducir de forma anónima el recorrido por la web y detectar problemas de usabilidad</li>
            </ul>

            <h3>7.2 Dónde se aplica</h3>
            <p>La analítica y la grabación de sesiones funcionan <strong>únicamente en las páginas públicas</strong> del sitio. Las áreas que requieren iniciar sesión —perfil de usuario, panel de creación de contenido, escáner de entradas y administración— están <strong>excluidas</strong>: en ellas no se registra ninguna página vista.</p>

            <h3>7.3 Conservación y oposición</h3>
            <p>Las estadísticas agregadas y las grabaciones de sesión se conservan un máximo de <strong>12 meses</strong>, tras los cuales se eliminan. Puede oponerse a esta medición en cualquier momento escribiendo a <strong>justsomeotherpeople@gmail.com</strong>, o activando la opción <em>«No rastrear» (Do Not Track)</em> o un bloqueador de scripts en su navegador.</p>
          </section>

          <section className="legal-section">
            <h2>8. Sus Derechos</h2>
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
            <h2>9. Ejercicio de Derechos</h2>
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
            <h2>10. Autoridad de Control</h2>
            <p>Si considera que el tratamiento de sus datos no se ajusta a la normativa, puede presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>:</p>
            <div className="info-box">
              <p><strong>Web:</strong> www.aepd.es</p>
              <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
              <p><strong>Teléfono:</strong> 901 100 099 / 912 663 517</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>11. Modificaciones</h2>
            <p>Esta Política de Privacidad puede ser actualizada periódicamente. Le notificaremos cualquier cambio significativo a través de nuestro sitio web o por correo electrónico.</p>
          </section>

          <section className="legal-section">
            <h2>12. Contacto</h2>
            <div className="contact-box">
              <p>Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos:</p>
              <ul>
                <li><strong>Email:</strong> justsomeotherpeople@gmail.com</li>
                <li><strong>Teléfono:</strong> +34 656 852 437</li>
                <li><strong>Dirección:</strong> Av Europa, Carrer de Dinamarca, 35, 08700 Igualada, Barcelona</li>
              </ul>
            </div>
          </section>
        </GlassSurface>
      </div>
		<Footer />
	</>
  )
}

export default Privacidad
