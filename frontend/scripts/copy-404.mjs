/**
 * Copia dist/index.html a dist/404.html después del build.
 *
 * vercel.json ya no tiene un catch-all: solo reescribe a index.html las rutas
 * que existen. El resto cae en 404.html, que Vercel sirve con estado 404. Al
 * ser una copia de la SPA, el usuario ve la página NotFound de siempre, pero
 * Google y los escáneres reciben un 404 de verdad (antes, cualquier URL daba
 * 200 y Search Console lo marcaba como «Soft 404»).
 */
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const from = join(dist, 'index.html')

if (!existsSync(from)) {
  console.error('[copy-404] No existe dist/index.html: ¿ha fallado el build?')
  process.exit(1)
}

copyFileSync(from, join(dist, '404.html'))
console.log('[copy-404] dist/404.html listo')
