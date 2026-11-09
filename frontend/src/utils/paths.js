/**
 * URLs públicas de las fichas. Con slug si lo tienen (/artistas/lilbru) y con
 * el ObjectId si todavía no (datos anteriores a los slugs). Las URLs con id
 * se redirigen a la del slug: ver useCanonicalSlug y api/og.js.
 */

/** ¿Es un ObjectId de MongoDB (24 hex)? */
export const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value || ''))

const key = (item) => item?.slug || item?.id || item?._id

export const artistPath = (artist) => `/artistas/${key(artist)}`
export const eventPath = (event) => `/eventos/${key(event)}`
export const beatPath = (beat) => `/beats/${key(beat)}`
export const releasePath = (release) => `/discografia/${key(release)}`

/** Id de un vídeo de YouTube (watch?v=, youtu.be/, /embed/, /shorts/) o null. */
export function youtubeId (url) {
  const match = String(url || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}
