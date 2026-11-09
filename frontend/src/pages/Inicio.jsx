import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { ProximosEventos } from '../components/Landing/ProximosEventos'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { UltimosBeats } from '../components/Landing/UltimosBeats'
import Footer from '../components/Footer/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

function Inicio () {
  usePageMeta({
    title: 'Discográfica independiente de trap y música urbana | Other People Records',
    description: 'Sello independiente de trap y música urbana. Firmamos y desarrollamos nuevos talentos: producción, mezcla y mastering, distribución, booking y beats con licencia.',
    url: '/',
    appendSiteName: false
  })

  return (
    <>
      <Hero/>
      <ProximosEventos />
      <UltimosLanzamientos />
      <UltimosBeats />
      <Footer />
    </>
  )
}

export default Inicio
