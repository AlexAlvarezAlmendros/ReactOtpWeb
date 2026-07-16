import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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
 * Fondo ambiental Silk (ReactBits, WebGL). Se monta una sola vez por árbol
 * (RootLayout para todo el sitio, LinksPage aparte por ser ruta suelta) y va
 * fijo detrás de todo el contenido, así que páginas y footer comparten
 * exactamente el mismo fondo.
 *
 * En equipos antiguos/lentos, con reduced-motion o sin WebGL renderiza los
 * orbes rojos CSS de siempre (`orbClass` es el prefijo: listing-orb, lp-orb),
 * que además hacen de placeholder mientras carga el chunk de three.
 */
function SilkBackground ({
  orbClass = 'listing-orb',
  className = '',
  speed = 2.5,
  scale = 1.1,
  color = '#4A0D1C',
  noiseIntensity = 1.2,
  rotation = 0,
  fps = 30,
  dpr = 0.75
}) {
  const capable = useGlassCapability()
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!capable || !containerRef.current) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0]?.isIntersecting ?? true)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [capable])

  const orbs = (
    <>
      <div className={`${orbClass} ${orbClass}--1`} aria-hidden='true' />
      <div className={`${orbClass} ${orbClass}--2`} aria-hidden='true' />
      <div className={`${orbClass} ${orbClass}--3`} aria-hidden='true' />
    </>
  )

  // El contenedor fija el fondo detrás de todo (z-index: -1) también en modo
  // fallback: los orbes llevan z-index propio pensado para páginas de listado
  // y sin él taparían el contenido de páginas sin capa posicionada (Inicio).
  return (
    <div ref={containerRef} className={`silk-background ${className}`} aria-hidden='true'>
      {!capable || !hasWebGL()
        ? orbs
        : (
          <Suspense fallback={orbs}>
            <Silk
              speed={speed}
              scale={scale}
              color={color}
              noiseIntensity={noiseIntensity}
              rotation={rotation}
              fps={fps}
              dpr={dpr}
              active={visible}
            />
          </Suspense>
          )}
    </div>
  )
}

export default SilkBackground
