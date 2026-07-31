import { Link } from 'react-router-dom'
import GlassSurface from '../GlassSurface'
import './QuienesSomos.css'

/**
 * Bloque de texto de la home. Además de contar quiénes somos, es el único
 * contenido indexable de la portada: el hero es vídeo y las tres secciones de
 * arriba son tarjetas que se cargan desde la API.
 */
export function QuienesSomos () {
  return (
    <section className='quienes-somos' id='sobre-nosotros'>
      <div className='quienes-somos__inner'>
        <h2 className='quienes-somos__title'>
          Discográfica independiente en Barcelona
        </h2>

        <div className='quienes-somos__text'>
          <p>
            Other People Records es un sello discográfico independiente fundado en 2020
            y con base en Igualada, provincia de Barcelona. Trabajamos con artistas
            urbanos —trap, rap, drill y R&amp;B— desde la maqueta hasta el escenario:
            producimos, grabamos, mezclamos, masterizamos, distribuimos en todas las
            plataformas y gestionamos el booking de los conciertos.
          </p>
          <p>
            No somos una multinacional y no queremos serlo. Somos un equipo pequeño que
            firma pocos proyectos al año para poder dedicarles tiempo de verdad. Si
            estás empezando y buscas una discográfica en Barcelona que te acompañe en
            lugar de fichar y olvidar, este es el sitio.
          </p>
        </div>

        <div className='quienes-somos__grid'>
          <GlassSurface as='article' className='quienes-somos__card' borderRadius={16}>
            <h3>Sello y distribución</h3>
            <p>
              Publicamos tu música en Spotify, Apple Music, YouTube y el resto de
              plataformas, con estrategia de lanzamiento y pitching editorial.
            </p>
            <Link to='/discografica-barcelona'>Cómo trabajamos como sello</Link>
          </GlassSurface>

          <GlassSurface as='article' className='quienes-somos__card' borderRadius={16}>
            <h3>Booking de artistas urbanos</h3>
            <p>
              Gestionamos conciertos, festivales y showcases de nuestro roster en
              Barcelona, Cataluña y el resto de España.
            </p>
            <Link to='/booking-artistas'>Contratar un artista</Link>
          </GlassSurface>

          <GlassSurface as='article' className='quienes-somos__card' borderRadius={16}>
            <h3>Estudio de grabación</h3>
            <p>
              Grabación de voces, mezcla, mastering y producción de beats en nuestro
              estudio de Igualada, a 45 minutos de Barcelona.
            </p>
            <Link to='/estudios'>Reservar una sesión</Link>
          </GlassSurface>
        </div>
      </div>
    </section>
  )
}
