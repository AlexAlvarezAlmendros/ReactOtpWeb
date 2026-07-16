import { renderHook } from '@testing-library/react'
import { useTilt } from '../hooks/useTilt'

let mockCapability = false

jest.mock('../hooks/useGlassCapability', () => ({
  useTiltCapability: () => mockCapability
}))

describe('useTilt', () => {
  test('sin capacidad (equipo modesto, reduced-motion o táctil) no devuelve nada', () => {
    mockCapability = false
    const { result } = renderHook(() => useTilt())

    expect(result.current).toEqual({})
  })

  test('con capacidad devuelve el transform y los manejadores de ratón', () => {
    mockCapability = true
    const { result } = renderHook(() => useTilt())

    expect(result.current.style.transform).toBeDefined()
    expect(typeof result.current.onMouseMove).toBe('function')
    expect(typeof result.current.onMouseEnter).toBe('function')
    expect(typeof result.current.onMouseLeave).toBe('function')
  })

  test('el movimiento del ratón inclina la card y al salir vuelve al reposo', () => {
    mockCapability = true
    const { result } = renderHook(() => useTilt({ rotateAmplitude: 10 }))

    const event = {
      clientX: 0, // esquina izquierda => rotateY negativo
      clientY: 100, // centro vertical => sin rotateX
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 })
      }
    }

    result.current.onMouseMove(event)
    // El transform es una plantilla de motion; comprobamos que refleja la entrada
    expect(result.current.style.transform.get()).toContain('perspective(800px)')

    result.current.onMouseLeave()
    expect(typeof result.current.style.transform.get()).toBe('string')
  })
})
