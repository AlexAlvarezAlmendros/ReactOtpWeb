import { lazy, Suspense } from 'react'
import { useGlassCapability } from '../../hooks/useGlassCapability'
import './SilkBackground.css'

// three + @react-three/fiber solo se descargan si el fondo Silk llega a renderizarse
const Silk = lazy(() => import('./Silk'))

let webglCached = null

function hasWebGL () {
  if (webglCached !== null) return webglCached
  try {
    const canvas = document.createElement('canvas')
    webglCached = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webglCached = false
  }
  return webglCached
}

/**
 * Fondo ambiental Silk (ReactBits, WebGL). En equipos antiguos/lentos, con
 * reduced-motion o sin WebGL renderiza los orbes rojos CSS de siempre
 * (`orbClass` es el prefijo actual: listing-orb, footer-orb, lp-orb).
 * Los orbes también actúan de placeholder mientras carga el chunk de three.
 */
function SilkBackground ({
  orbClass = 'listing-orb',
  className = '',
  speed = 2.5,
  scale = 1.1,
  color = '#4A0D1C',
  noiseIntensity = 1.2,
  rotation = 0
}) {
  const capable = useGlassCapability()

  const orbs = (
    <>
      <div className={`${orbClass} ${orbClass}--1`} aria-hidden='true' />
      <div className={`${orbClass} ${orbClass}--2`} aria-hidden='true' />
      <div className={`${orbClass} ${orbClass}--3`} aria-hidden='true' />
    </>
  )

  if (!capable || !hasWebGL()) {
    return orbs
  }

  return (
    <div className={`silk-background ${className}`} aria-hidden='true'>
      <Suspense fallback={orbs}>
        <Silk
          speed={speed}
          scale={scale}
          color={color}
          noiseIntensity={noiseIntensity}
          rotation={rotation}
        />
      </Suspense>
    </div>
  )
}

export default SilkBackground
