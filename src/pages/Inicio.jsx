import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { ProximosEventos } from '../components/Landing/ProximosEventos'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { ArtistasMasActivos } from '../components/Landing/ArtistasMasActivos'
import Footer from '../components/Footer/Footer'

function Inicio () {
  return (
    <>
      <Hero/>
      <ProximosEventos />
      <UltimosLanzamientos />
      <ArtistasMasActivos />
      <Footer />
    </>
  )
}

export default Inicio
