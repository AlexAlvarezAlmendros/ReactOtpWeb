import { renderHook } from '@testing-library/react'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'

describe('SEO smoke', () => {
  test('usePageMeta pone title, description, canonical y robots', () => {
    delete window.location
    window.location = new URL('https://www.otherpeople.es/estudios')

    const { unmount } = renderHook(() => usePageMeta({
      title: 'Estudio de grabación en Barcelona',
      description: 'Desc',
      image: '/img/x.png'
    }))

    expect(document.title).toBe('Estudio de grabación en Barcelona | Other People Records')
    expect(document.querySelector('meta[name="description"]').content).toBe('Desc')
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://www.otherpeople.es/estudios')
    expect(document.querySelector('meta[name="robots"]').content).toContain('index, follow')
    expect(document.querySelector('meta[property="og:image"]').content).toBe('https://www.otherpeople.es/img/x.png')

    unmount()
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  test('noindex marca noindex, follow', () => {
    renderHook(() => usePageMeta({ title: 'Perfil', noindex: true }))
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow')
  })

  test('useJsonLd inyecta y retira el bloque', () => {
    const { unmount } = renderHook(() => useJsonLd({ '@type': 'Organization' }))
    const el = document.querySelector('script[type="application/ld+json"]')
    expect(JSON.parse(el.textContent)['@type']).toBe('Organization')
    unmount()
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
  })
})
