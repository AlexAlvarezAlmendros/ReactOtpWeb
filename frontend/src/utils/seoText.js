/**
 * Utilidades de texto para metadatos (description, JSON-LD).
 *
 * api/og.js tiene su propia copia: las funciones de Vercel se mantienen
 * autocontenidas para que un fallo de empaquetado no tumbe el HTML de los bots.
 */

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
}

/** Decodifica las entidades HTML habituales (&amp;, &#39;, &#x27;…). */
export function decodeEntities (str) {
  return String(str || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

/**
 * HTML (p. ej. el de Tiptap) → texto plano. Los saltos de párrafo y los <br>
 * se conservan como saltos de línea.
 */
export function htmlToText (html) {
  if (!html) return ''
  const text = String(html)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6]|blockquote)\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
  return decodeEntities(text)
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Texto en una sola línea, cortado por palabra a `max` caracteres. */
export function excerpt (text, max = 155) {
  const flat = String(text || '').replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, '')}…`
}

/** Número de palabras de un texto. */
export function wordCount (text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

/** «Hoodtrap, Reggaeton» → «hoodtrap y reggaeton». */
export function genreLabel (genre) {
  const parts = String(genre || '').split(',').map(g => g.trim().toLowerCase()).filter(Boolean)
  if (parts.length <= 1) return parts[0] || ''
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`
}

/**
 * Title SEO de un beat: «Come Back — Beat de reggaeton 93 BPM (prod. LilBru)».
 * El nombre del beat solo no dice nada a Google; el género y el BPM son lo
 * que se busca.
 */
export function beatSeoTitle ({ title, genre, bpm, producerName }) {
  if (!title) return ''
  const genres = genreLabel(genre)
  const kind = `Beat${genres ? ` de ${genres}` : ''}${bpm ? ` ${bpm} BPM` : ''}`
  return `${title} — ${kind}${producerName ? ` (prod. ${producerName})` : ''}`
}
