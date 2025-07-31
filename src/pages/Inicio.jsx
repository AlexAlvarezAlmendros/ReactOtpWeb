import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { ArtistasMasActivos } from '../components/Landing/ArtistasMasActivos'
import Footer from '../components/Footer/Footer'

function Inicio () {
  return (
    <>
      <Hero/>
      <UltimosLanzamientos />
      <ArtistasMasActivos />
      <Footer />
    </>
  )
}

export default Inicio
