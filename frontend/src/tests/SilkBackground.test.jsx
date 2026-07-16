import { render } from '@testing-library/react'
import SilkBackground from '../components/SilkBackground'

let mockCapability = false

jest.mock('../hooks/useGlassCapability', () => ({
  useGlassCapability: () => mockCapability
}))

describe('SilkBackground', () => {
  test('en modo fallback renderiza los tres orbes originales', () => {
    mockCapability = false
    const { container } = render(<SilkBackground />)

    expect(container.querySelector('.listing-orb.listing-orb--1')).toBeInTheDocument()
    expect(container.querySelector('.listing-orb.listing-orb--2')).toBeInTheDocument()
    expect(container.querySelector('.listing-orb.listing-orb--3')).toBeInTheDocument()
    expect(container.querySelector('.silk-background')).not.toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  test('respeta el prefijo de clase de orbes del contexto', () => {
    mockCapability = false
    const { container } = render(<SilkBackground orbClass='footer-orb' />)

    expect(container.querySelector('.footer-orb.footer-orb--1')).toBeInTheDocument()
    expect(container.querySelector('.listing-orb')).not.toBeInTheDocument()
  })
})
