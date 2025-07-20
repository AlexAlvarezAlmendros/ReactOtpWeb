import './Inicio.css'
import { Hero } from '../components/Landing/Hero'
import { UltimosLanzamientos } from '../components/Landing/UltimosLanzamientos'
import { ArtistasMasActivos } from '../components/Landing/ArtistasMasActivos'

function Inicio () {
  return (
    <>
      <Hero/>
      <UltimosLanzamientos />
      <ArtistasMasActivos />
    </>
  )
}

export default Inicio
