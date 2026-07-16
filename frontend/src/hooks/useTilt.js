import { useMotionValue, useSpring, useMotionTemplate } from 'motion/react'
import { useTiltCapability } from './useGlassCapability'

// Física del TiltedCard de ReactBits
const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
}

/**
 * Efecto tilt 3D al pasar el ratón (TiltedCard de ReactBits), adaptado para
 * aplicarse sobre una card existente en vez de envolverla: devuelve los props
 * que se le pasan al elemento, así las cards siguen siendo hijas directas del
 * grid y no cambia la maquetación.
 *
 * La perspectiva va en el propio transform, de modo que no hace falta un
 * contenedor padre con `perspective`.
 *
 * Uso: <GlassSurface as={motion.article} className='card' {...useTilt()} />
 *
 * Devuelve {} cuando no procede (equipo modesto, reduced-motion o táctil),
 * dejando la card con su hover CSS de siempre.
 */
export function useTilt ({ rotateAmplitude = 10, scaleOnHover = 1.05 } = {}) {
  const enabled = useTiltCapability()

  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)

  const transform = useMotionTemplate`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`

  if (!enabled) return {}

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude)
  }

  const handleMouseEnter = () => {
    scale.set(scaleOnHover)
  }

  const handleMouseLeave = () => {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  return {
    style: { transform },
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}
