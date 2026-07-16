/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import { Color } from 'three'

const hexToNormalizedRGB = hex => {
  hex = hex.replace('#', '')
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ]
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`

/**
 * Con frameloop="demand" el canvas solo redibuja cuando se invalida:
 * aquí limitamos los redibujados a `fps` y los paramos del todo cuando
 * `active` es false (p. ej. el footer fuera de pantalla). Esto también
 * reduce a la mitad los re-filtrados del cristal (GlassSurface), que se
 * recalculan cada vez que el fondo animado cambia.
 */
function InvalidateLoop ({ fps, active }) {
  const { invalidate } = useThree()

  useEffect(() => {
    if (!active) return
    let rafId
    let last = 0
    const interval = 1000 / fps
    const tick = t => {
      rafId = requestAnimationFrame(tick)
      if (t - last >= interval) {
        last = t
        invalidate()
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [invalidate, fps, active])

  return null
}

const SilkPlane = forwardRef(function SilkPlane ({ uniforms }, ref) {
  const { viewport } = useThree()

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1)
    }
  }, [ref, viewport])

  useFrame((_, delta) => {
    ref.current.material.uniforms.uTime.value += 0.1 * delta
  })

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  )
})
SilkPlane.displayName = 'SilkPlane'

const Silk = ({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
  fps = 30,
  dpr = 0.75,
  active = true
}) => {
  const meshRef = useRef()

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  )

  return (
    <Canvas
      dpr={dpr}
      frameloop='demand'
      gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
    >
      <InvalidateLoop fps={fps} active={active} />
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  )
}

export default Silk
