// ─────────────────────────────────────────────────────────────────────────────
// Browser client for the audio analysis engine.
//
//   1. Decode the file with Web Audio and resample to the engine rate with a
//      band-limited OfflineAudioContext render (proper anti-aliasing + mono).
//   2. Run the engine in a Web Worker (UI stays responsive, progress events).
//   3. If workers are unavailable, fall back to the same engine on the main
//      thread — identical results, just without parallelism.
//
// Analysis is 100 % local: the audio never leaves the device.
// ─────────────────────────────────────────────────────────────────────────────

import { ENGINE_SAMPLE_RATE } from './engineConfig.js'

// Typed engine errors that describe the *audio* (not the runtime) — they must
// surface to the user instead of triggering the main-thread fallback.
const AUDIO_ERRORS = new Set(['AUDIO_TOO_SHORT', 'AUDIO_SILENT'])

async function decodeToMono (arrayBuffer) {
  const AC = window.AudioContext || window.webkitAudioContext
  const probe = new AC()
  let decoded
  try {
    decoded = await probe.decodeAudioData(arrayBuffer)
  } finally {
    probe.close().catch(() => {})
  }
  const length = Math.max(1, Math.ceil(decoded.duration * ENGINE_SAMPLE_RATE))
  const off = new OfflineAudioContext(1, length, ENGINE_SAMPLE_RATE)
  const src = off.createBufferSource()
  src.buffer = decoded
  src.connect(off.destination)
  src.start(0)
  const rendered = await off.startRendering()
  return { pcm: rendered.getChannelData(0), sampleRate: ENGINE_SAMPLE_RATE, duration: decoded.duration }
}

let worker = null
let jobSeq = 0

function getWorker () {
  if (!worker) {
    worker = new Worker(new URL('../workers/audioAnalysis.worker.js', import.meta.url), { type: 'module' })
  }
  return worker
}

export function disposeAnalyzer () {
  if (worker) {
    worker.terminate()
    worker = null
  }
}

function analyzeInWorker (pcm, sampleRate, duration, report) {
  return new Promise((resolve, reject) => {
    const w = getWorker()
    const id = ++jobSeq
    const timeout = setTimeout(() => {
      cleanup()
      disposeAnalyzer()
      reject(new Error('WORKER_TIMEOUT'))
    }, 120000)

    const onMessage = (e) => {
      const msg = e.data
      if (!msg || msg.id !== id) return
      if (msg.type === 'progress') { report(msg.stage, 10 + msg.pct * 0.9); return }
      cleanup()
      if (msg.type === 'result') {
        resolve(msg.result)
      } else {
        const err = new Error(msg.message)
        if (AUDIO_ERRORS.has(msg.message)) err.audioError = true
        reject(err)
      }
    }
    const onError = () => {
      cleanup()
      disposeAnalyzer()
      reject(new Error('WORKER_FAILED'))
    }
    function cleanup () {
      clearTimeout(timeout)
      w.removeEventListener('message', onMessage)
      w.removeEventListener('error', onError)
    }

    w.addEventListener('message', onMessage)
    w.addEventListener('error', onError)
    // Transfer the PCM buffer — zero-copy handoff to the worker.
    w.postMessage({ id, pcm, sampleRate, duration }, [pcm.buffer])
  })
}

// Main API. `onProgress` receives { stage: 'decode'|'bpm'|'key'|'done', pct }.
export async function analyzeAudioFile (file, { onProgress } = {}) {
  const report = (stage, pct) => {
    if (onProgress) onProgress({ stage, pct: Math.min(100, Math.round(pct)) })
  }

  report('decode', 2)
  const { pcm, sampleRate, duration } = await decodeToMono(await file.arrayBuffer())
  report('decode', 10)

  try {
    return await analyzeInWorker(pcm, sampleRate, duration, report)
  } catch (err) {
    if (err.audioError) throw err
    // Worker unavailable or crashed → same engine on the main thread.
    // The PCM buffer was transferred away, so decode again.
    const again = await decodeToMono(await file.arrayBuffer())
    await new Promise(r => setTimeout(r, 30)) // let the progress UI paint
    const { analyzeAudioData } = await import('./audioEngine.js')
    return analyzeAudioData(again.pcm, again.sampleRate, {
      duration: again.duration,
      onProgress: ({ stage, pct }) => report(stage, 10 + pct * 0.9),
    })
  }
}
