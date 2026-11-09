import { createContext } from 'react'

/**
 * Solo existe durante el prerender del build (entry-server.jsx). En el
 * navegador vale null y usePageMeta/useJsonLd funcionan con efectos, como
 * siempre. En el servidor no hay efectos, así que los hooks apuntan aquí los
 * metadatos durante el render y scripts/prerender.mjs los escribe en <head>.
 *
 * @type {import('react').Context<null | { meta: object|null, jsonLd: object[] }>}
 */
export const HeadContext = createContext(null)
