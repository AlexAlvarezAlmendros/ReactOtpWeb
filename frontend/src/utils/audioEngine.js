// ─────────────────────────────────────────────────────────────────────────────
// Audio analysis orchestrator — pure function over mono PCM.
// Runs identically in a Web Worker, on the main thread, or in Node (used by
// the ground-truth validation suite in scripts/validate-audio-engine.mjs).
// ─────────────────────────────────────────────────────────────────────────────

import { estimateTempo } from './tempoEngine.js'
import { estimateKey } from './keyEngine.js'
import { snapBpm } from './musicTheory.js'

export { ENGINE_SAMPLE_RATE } from './engineConfig.js'

export function analyzeAudioData (pcm, sampleRate, { duration, onProgress } = {}) {
  const report = (stage, pct) => {
    if (onProgress) onProgress({ stage, pct: Math.min(100, Math.round(pct)) })
  }

  if (!pcm || pcm.length < sampleRate * 3) {
    throw new Error('AUDIO_TOO_SHORT')
  }

  let rms = 0
  for (let i = 0; i < pcm.length; i += 16) rms += pcm[i] * pcm[i]
  rms = Math.sqrt(rms / Math.ceil(pcm.length / 16))
  if (rms < 1e-5) {
    throw new Error('AUDIO_SILENT')
  }

  report('bpm', 2)
  const tempo = estimateTempo(pcm, sampleRate, {
    onProgress: (p) => report('bpm', 2 + p * 53),
  })

  report('key', 55)
  const key = estimateKey(pcm, sampleRate, {
    onProgress: (p) => report('key', 55 + p * 43),
  })

  const snapped = snapBpm(tempo.bpm)
  const altSnapped = tempo.alt ? snapBpm(tempo.alt) : null
  report('done', 100)

  return {
    bpm: snapped.value,
    bpmDisplay: snapped.display,
    bpmConfidence: tempo.confidence,
    bpmAlt: altSnapped ? altSnapped.value : null,
    bpmAltDisplay: altSnapped ? altSnapped.display : null,
    key: key.note,
    mode: key.mode,
    camelot: key.camelot,
    openKey: key.openKey,
    keyConfidence: key.confidence,
    keyAlternative: key.alternative,
    tuningHz: key.tuningHz,
    tuningCents: key.tuningCents,
    duration: duration ?? pcm.length / sampleRate,
    metrics: { tempo: tempo.metrics, key: key.details ?? null },
  }
}
