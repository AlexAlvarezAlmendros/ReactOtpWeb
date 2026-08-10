import { isPublicRoute, hasDoNotTrack, PRIVATE_ROUTE_PREFIXES, UMAMI_HOST, UMAMI_WEBSITE_ID } from '../utils/analytics'

describe('analytics config', () => {
  test('apunta a la instancia de Umami correcta', () => {
    expect(UMAMI_HOST).toBe('https://analiticas.alexalvarez.dev')
    expect(UMAMI_WEBSITE_ID).toBe('e7a6fb2d-aad9-4e96-a990-739ca7b82cd8')
  })
})

describe('isPublicRoute', () => {
  const publicRoutes = [
    '/',
    '/artistas',
    '/artistas/64f0c1',
    '/contacto',
    '/estudios',
    '/discografia',
    '/discografica-barcelona',
    '/booking-artistas',
    '/eventos',
    '/eventos/64f0c1',
    '/beats',
    '/beats/64f0c1',
    '/privacidad',
    '/terminos',
    '/cookies',
    '/ticket/ABC123',
    '/newsletters',
    '/news/mi-newsletter',
    '/unsubscribe',
    '/herramientas',
    '/plugins',
    '/plugins/opr-w1',
    '/ruralmafia',
    '/l/lilbru',
    '/ruta-que-no-existe'
  ]

  const privateRoutes = [
    '/crear',
    '/perfil',
    '/scanner',
    '/admin',
    '/admin/newsletter'
  ]

  test.each(publicRoutes)('mide la ruta pública %s', (route) => {
    expect(isPublicRoute(route)).toBe(true)
  })

  test.each(privateRoutes)('no mide la ruta privada %s', (route) => {
    expect(isPublicRoute(route)).toBe(false)
  })

  test('ignora la barra final y las mayúsculas', () => {
    expect(isPublicRoute('/perfil/')).toBe(false)
    expect(isPublicRoute('/Perfil')).toBe(false)
    expect(isPublicRoute('/artistas/')).toBe(true)
  })

  test('no confunde rutas públicas que empiezan igual que una privada', () => {
    expect(isPublicRoute('/creadores')).toBe(true)
    expect(isPublicRoute('/administracion-de-fincas')).toBe(true)
  })

  test('trata una ruta vacía como la home', () => {
    expect(isPublicRoute('')).toBe(true)
    expect(isPublicRoute(undefined)).toBe(true)
  })

  test('todas las rutas privadas declaradas quedan excluidas', () => {
    PRIVATE_ROUTE_PREFIXES.forEach(prefix => {
      expect(isPublicRoute(prefix)).toBe(false)
      expect(isPublicRoute(`${prefix}/algo`)).toBe(false)
    })
  })
})

// La política de privacidad promete que respetamos Do Not Track, así que
// esta comprobación es la que sostiene esa afirmación.
describe('hasDoNotTrack', () => {
  test('detecta la señal en navigator.doNotTrack', () => {
    expect(hasDoNotTrack({ doNotTrack: '1' }, {})).toBe(true)
  })

  test('detecta la señal heredada de Internet Explorer y de window', () => {
    expect(hasDoNotTrack({ msDoNotTrack: '1' }, {})).toBe(true)
    expect(hasDoNotTrack({}, { doNotTrack: '1' })).toBe(true)
  })

  test('acepta el valor "yes" que usan algunos navegadores', () => {
    expect(hasDoNotTrack({ doNotTrack: 'yes' }, {})).toBe(true)
  })

  test('no la detecta cuando el visitante no la ha activado', () => {
    expect(hasDoNotTrack({ doNotTrack: '0' }, {})).toBe(false)
    expect(hasDoNotTrack({ doNotTrack: 'unspecified' }, {})).toBe(false)
    expect(hasDoNotTrack({ doNotTrack: null }, {})).toBe(false)
    expect(hasDoNotTrack({}, {})).toBe(false)
  })
})
