/**
 * HTML para buscadores (api/og.js) y sitemap (api/sitemap.js): son lo que
 * Google lee de las fichas, así que comprobamos estados HTTP, noindex y que
 * no se cuele HTML escapado.
 */
import { htmlToText, excerpt, genreLabel, beatSeoTitle, wordCount } from '../utils/seoText'

const API = 'https://api.test/api'

const ARTIST = {
  _id: 'a1',
  name: 'LilBru',
  genre: 'Trap',
  artistType: 'Producer',
  img: 'https://img.test/lilbru.jpg',
  spotifyLink: 'https://open.spotify.com/artist/x',
  bio: 'LilBru es productor de trap de Igualada.\n\nHa producido para todo el roster del sello.'
}

const RELEASES = [
  { _id: 'r1', title: 'Sexología', subtitle: 'LilBru, pinkdolly', releaseType: 'Song', date: '2026-08-25T00:00:00.000Z', spotifyLink: 'https://open.spotify.com/album/r1' }
]

const BEAT_PLAIN = {
  _id: 'b1',
  title: 'Come Back',
  bpm: 93,
  key: 'A min',
  genre: 'Hoodtrap, Reggaeton',
  tags: ['dark'],
  active: true,
  producer: { _id: 'a1', name: 'LilBru' },
  licenses: [
    { name: 'Basic', price: 29.99, formats: ['MP3'] },
    { name: 'Premium', price: 49.99, formats: ['MP3', 'WAV'] }
  ]
}

const BEAT_DESCRIBED = { ...BEAT_PLAIN, _id: 'b2', description: 'Beat oscuro con 808 largos, pensado para un tema de calle a medio tiempo.' }
const BEAT_INACTIVE = { ...BEAT_DESCRIBED, _id: 'b3', active: false }

const EVENT = {
  _id: 'e1',
  name: 'OTP!',
  location: 'Sala River, Barcelona',
  date: '2026-03-14T20:00:00.000Z',
  eventType: 'Concert',
  description: '<p style="text-align: left;">Volvemos con 2 showcases &amp; 3 DJ sets.</p><p>Entrada <strong>libre</strong>.</p>'
}

/** Respuesta de la API simulada según la URL. */
function routes (url) {
  const u = new URL(url)
  const path = u.pathname.replace('/api', '')
  if (path === '/artists/a1') return { status: 200, body: ARTIST }
  if (path.startsWith('/releases/artist/')) return { status: 200, body: { data: RELEASES } }
  if (path === '/beats') return { status: 200, body: { data: [BEAT_PLAIN, BEAT_DESCRIBED, BEAT_INACTIVE], pagination: { pages: 1 } } }
  if (path === '/beats/b1') return { status: 200, body: BEAT_PLAIN }
  if (path === '/beats/b2') return { status: 200, body: BEAT_DESCRIBED }
  if (path === '/beats/b3') return { status: 200, body: BEAT_INACTIVE }
  if (path === '/beats/boom') return { status: 500, body: { error: 'boom' } }
  if (path === '/events/e1') return { status: 200, body: EVENT }
  if (path === '/events') return { status: 200, body: { data: [EVENT], pagination: { pages: 1 } } }
  if (path === '/artists') return { status: 200, body: { data: [ARTIST], pagination: { pages: 1 } } }
  return { status: 404, body: { error: 'not found' } }
}

function mockFetch () {
  global.fetch = jest.fn(async (url) => {
    if (String(url).includes('/beats/offline')) throw new Error('ECONNRESET')
    const { status, body } = routes(String(url))
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  })
}

function mockRes () {
  const res = { statusCode: null, headers: {}, body: '' }
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; return res }
  res.status = (code) => { res.statusCode = code; return res }
  res.send = (body) => { res.body = body; return res }
  return res
}

let og
let sitemap

beforeAll(async () => {
  process.env.VITE_API_URL = API
  og = (await import('../../api/og.js')).default
  sitemap = (await import('../../api/sitemap.js')).default
})

beforeEach(mockFetch)

async function render (type, id, mode = 'index') {
  const res = mockRes()
  await og({ query: { type, id, mode }, headers: { host: 'www.otherpeople.es' } }, res)
  return res
}

describe('seoText', () => {
  test('htmlToText quita etiquetas, decodifica entidades y separa párrafos', () => {
    expect(htmlToText(EVENT.description)).toBe('Volvemos con 2 showcases & 3 DJ sets.\n\nEntrada libre.')
    expect(htmlToText('a<br>b')).toBe('a\nb')
    expect(htmlToText('')).toBe('')
  })

  test('excerpt corta por palabra y añade puntos suspensivos', () => {
    const text = 'palabra '.repeat(40)
    const out = excerpt(text, 50)
    expect(out.length).toBeLessThanOrEqual(50)
    expect(out.endsWith('…')).toBe(true)
    expect(excerpt('corto')).toBe('corto')
  })

  test('genreLabel y beatSeoTitle', () => {
    expect(genreLabel('Hoodtrap, Reggaeton')).toBe('hoodtrap y reggaeton')
    expect(genreLabel('Trap')).toBe('trap')
    expect(beatSeoTitle({ title: 'Come Back', genre: 'Jerk, reggaeton', bpm: 93, producerName: 'LilBru' }))
      .toBe('Come Back — Beat de jerk y reggaeton 93 BPM (prod. LilBru)')
    expect(wordCount('  uno dos\ntres ')).toBe(3)
  })
})

describe('api/og.js (modo index)', () => {
  test('evento: texto limpio, sin HTML escapado, title con lugar y fecha', async () => {
    const res = await render('events', 'e1')
    expect(res.statusCode).toBe(200)
    expect(res.body).not.toMatch(/&lt;p/)
    expect(res.body).toContain('<p>Volvemos con 2 showcases &amp; 3 DJ sets.</p>')
    expect(res.body).toMatch(/<title>OTP! — Sala River, Barcelona, 14 de marzo de 2026 \| Other People Records<\/title>/)
    expect(res.body).toContain('<meta name="description" content="Volvemos con 2 showcases &amp; 3 DJ sets. Entrada libre." />')
    expect(res.body).toContain('<h1>OTP!</h1>')
  })

  test('beat sin descripción: noindex y title con género y BPM', async () => {
    const res = await render('beats', 'b1')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('<meta name="robots" content="noindex, follow" />')
    expect(res.headers['x-robots-tag']).toBe('noindex')
    expect(res.body).toContain('<title>Come Back — Beat de hoodtrap y reggaeton 93 BPM (prod. LilBru) | Other People Records</title>')
    expect(res.body).toContain('Premium: 49,99 €')
  })

  test('beat con descripción: indexable y con su texto', async () => {
    const res = await render('beats', 'b2')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('<meta name="robots" content="index, follow')
    expect(res.headers['x-robots-tag']).toBeUndefined()
    expect(res.body).toContain('<p>Beat oscuro con 808 largos')
    expect(res.body).toContain('href="https://www.otherpeople.es/artistas/a1"')
  })

  test('beat desactivado: 410', async () => {
    const res = await render('beats', 'b3')
    expect(res.statusCode).toBe(410)
    expect(res.headers['x-robots-tag']).toBe('noindex')
  })

  test('artista: biografía, lanzamientos y beats producidos', async () => {
    const res = await render('artists', 'a1')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('<p>LilBru es productor de trap de Igualada.</p>')
    expect(res.body).toContain('<h2>Lanzamientos de LilBru</h2>')
    expect(res.body).toContain('Sexología')
    expect(res.body).toContain('<h2>Beats producidos por LilBru</h2>')
    // El beat desactivado no se enlaza.
    expect(res.body).not.toContain('/beats/b3')
    expect(res.body).toContain('<title>LilBru — trap | Other People Records</title>')
  })

  test('la API dice 404: 404', async () => {
    const res = await render('beats', 'nope')
    expect(res.statusCode).toBe(404)
  })

  test('la API falla: 503, no 404', async () => {
    expect((await render('beats', 'boom')).statusCode).toBe(503)
    const offline = await render('beats', 'offline')
    expect(offline.statusCode).toBe(503)
    expect(offline.headers['retry-after']).toBeDefined()
  })

  test('tipo desconocido: 404', async () => {
    expect((await render('users', 'x')).statusCode).toBe(404)
  })
})

describe('api/og.js (modo social)', () => {
  test('tarjeta con meta refresh y el nombre corto', async () => {
    const res = await render('beats', 'b1', 'social')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('http-equiv="refresh"')
    expect(res.body).toContain('<meta property="og:title" content="Come Back" />')
  })
})

describe('api/sitemap.js', () => {
  test('solo URLs indexables y sin priority/changefreq', async () => {
    const res = mockRes()
    await sitemap({}, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('<loc>https://www.otherpeople.es/beats/b2</loc>')
    expect(res.body).not.toContain('/beats/b1<')
    expect(res.body).not.toContain('/beats/b3<')
    expect(res.body).toContain('<loc>https://www.otherpeople.es/artistas/a1</loc>')
    expect(res.body).toContain('<loc>https://www.otherpeople.es/eventos/e1</loc>')
    expect(res.body).not.toMatch(/<priority>|<changefreq>/)
  })
})
