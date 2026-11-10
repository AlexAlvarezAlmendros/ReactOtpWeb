/**
 * Configuración del build SSR del prerender (scripts/prerender.mjs).
 * Va aparte para no tocar vite.config.js.
 *
 * Font Awesome se empaqueta dentro del bundle SSR: si se deja externo, Node
 * carga dos copias de la librería (CJS y ESM) y los iconos registrados en
 * fontawesome.js no se encuentran al renderizar.
 */
import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.js'

export default mergeConfig(base, defineConfig({
  ssr: {
    noExternal: [/^@fortawesome\//]
  }
}))
