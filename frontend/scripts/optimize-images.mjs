/**
 * Optimiza las imágenes pesadas de public/img (Fase 1.4 del plan SEO).
 *
 *   node scripts/optimize-images.mjs
 *
 * El logo animado del hero (26 MB de GIF a 1000 px para pintarlo a 220 px) se
 * convierte con ffmpeg, que es mucho más rápido que sharp con 150 fotogramas:
 *
 *   ffmpeg -i public/img/logo.gif -vf "scale=440:-1:flags=lanczos,format=yuva420p" \
 *     -c:v libwebp_anim -lossless 0 -quality 70 -loop 0 public/img/logo-anim.webp
 *
 * Cada entrada genera un archivo nuevo junto al original. Los originales ya
 * se han borrado del repo (siguen en el historial de git): para volver a
 * generarlos, recupéralos primero con `git checkout <commit>~1 -- <ruta>`. Las imágenes que salen en
 * correos (OTPNewsletter.png) se quedan en PNG: hay clientes de correo que
 * no muestran WebP.
 */
import sharp from 'sharp'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const JOBS = [
  { from: 'img/studio/prod.png', to: 'img/studio/prod.webp', width: 1024, webp: { quality: 76 } },
  { from: 'img/studio/comp.png', to: 'img/studio/comp.webp', width: 1024, webp: { quality: 76 } },
  { from: 'img/studio/vocal.png', to: 'img/studio/vocal.webp', width: 1024, webp: { quality: 76 } },
  { from: 'img/Cartelrural mafia.png', to: 'img/cartel-rural-mafia.webp', width: 1320, webp: { quality: 76 } },
  { from: 'img/logoruralmafia.png', to: 'img/logoruralmafia.webp', width: 1200, webp: { quality: 80 } },
  // og:image de /ruralmafia: PNG para las redes, pero a 1200 px.
  { from: 'img/logoruralmafia.png', to: 'img/logoruralmafia-og.png', width: 1200, png: { compressionLevel: 9, palette: true } },
  { from: 'img/colabs/logoinvertido.png', to: 'img/colabs/logoinvertido.webp', width: 600, webp: { quality: 80 } },
  { from: 'img/OTPNewsletter.png', to: 'img/OTPNewsletter-600.png', width: 600, png: { compressionLevel: 9, palette: true } }
]

const kb = (path) => `${Math.round(statSync(path).size / 1024)} KB`

for (const job of JOBS) {
  const src = join(PUBLIC, job.from)
  const dest = join(PUBLIC, job.to)
  let pipeline = sharp(src, job.animated ? { animated: true } : {}).resize({ width: job.width, withoutEnlargement: true })
  pipeline = job.png ? pipeline.png(job.png) : pipeline.webp(job.webp)
  await pipeline.toFile(dest)
  console.log(`${job.from} (${kb(src)}) → ${job.to} (${kb(dest)})`)
}
