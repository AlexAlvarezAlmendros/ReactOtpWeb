import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { ProximosEventos } from '../components/Landing/ProximosEventos'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { UltimosBeats } from '../components/Landing/UltimosBeats'
import { QuienesSomos } from '../components/Landing/QuienesSomos'
import Footer from '../components/Footer/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

function Inicio () {
  usePageMeta({
    title: 'Discográfica en Barcelona y booking urbano | Other People Records',
    description: 'Sello discográfico independiente en Barcelona. Artistas urbanos de trap, rap y drill: booking, producción, distribución y estudio de grabación en Igualada.',
    url: '/',
    appendSiteName: false
  })

  return (
    <>
      <Hero/>
      <ProximosEventos />
      <UltimosLanzamientos />
      <UltimosBeats />
      <QuienesSomos />
      <Footer />
    </>
  )
}

export default Inicio
