import { render, screen } from '@testing-library/react'
import GlassSurface from '../components/GlassSurface'

let mockCapability = false

jest.mock('../hooks/useGlassCapability', () => ({
  useGlassCapability: () => mockCapability
}))

global.ResizeObserver = class ResizeObserver {
  observe () {}

  unobserve () {}

  disconnect () {}
}

describe('GlassSurface', () => {
  test('en modo fallback renderiza el markup original sin extras', () => {
    mockCapability = false
    const { container } = render(
      <GlassSurface as='article' className='card'>
        <p>contenido</p>
      </GlassSurface>
    )

    const article = container.querySelector('article.card')
    expect(article).toBeInTheDocument()
    expect(article).not.toHaveClass('glass-surface')
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  test('en modo mejorado añade la clase glass-surface y el filtro SVG', () => {
    mockCapability = true
    const { container } = render(
      <GlassSurface as='article' className='card'>
        <p>contenido</p>
      </GlassSurface>
    )

    const article = container.querySelector('article.card')
    expect(article).toHaveClass('glass-surface')
    expect(container.querySelector('svg.glass-surface__filter')).toBeInTheDocument()
    expect(container.querySelector('filter')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  test('conserva la etiqueta y los atributos pasados (as="a", href)', () => {
    mockCapability = true
    render(
      <GlassSurface as='a' href='https://example.com' className='lp-item'>
        enlace
      </GlassSurface>
    )

    const link = screen.getByRole('link', { name: /enlace/ })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })
})
