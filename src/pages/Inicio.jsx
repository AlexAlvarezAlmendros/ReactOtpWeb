import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { ProximosEventos } from '../components/Landing/ProximosEventos'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { UltimosBeats } from '../components/Landing/UltimosBeats'
import Footer from '../components/Footer/Footer'

function Inicio () {
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
