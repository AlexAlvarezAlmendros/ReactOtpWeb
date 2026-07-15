// ─────────────────────────────────────────────────────────────────────────────
// Ground-truth validation suite for the audio analysis engine.
//
//   node scripts/validate-audio-engine.mjs
//
// Synthesizes realistic multi-genre test tracks (drums + bass + chords + arp,
// deterministic humanization) whose BPM and key are known exactly, runs the
// production engine on them and asserts the results. Exit code 1 on failure.
// ─────────────────────────────────────────────────────────────────────────────

import { analyzeAudioData } from '../src/utils/audioEngine.js'
import { NOTE_NAMES, MODE_MAJOR, MODE_MINOR, relativeKey } from '../src/utils/musicTheory.js'
import { SR, synthTrack, synthNoise } from './synth-tracks.mjs'

// ─── Test matrix ─────────────────────────────────────────────────────────────
const CASES = [
  { name: 'House 128 · F menor', bpm: 128, keyPc: 5, mode: MODE_MINOR, pattern: 'fourFloor', seed: 11 },
  { name: 'Techno 140 · A menor', bpm: 140, keyPc: 9, mode: MODE_MINOR, pattern: 'fourFloor', seed: 22 },
  { name: 'Hip-hop 95 · G menor', bpm: 95, keyPc: 7, mode: MODE_MINOR, pattern: 'hiphop', seed: 33 },
  { name: 'Halftime 87.5 · C# menor', bpm: 87.5, keyPc: 1, mode: MODE_MINOR, pattern: 'hiphop', seed: 44 },
  { name: 'DnB 174 · F# menor', bpm: 174, keyPc: 6, mode: MODE_MINOR, pattern: 'breakbeat', seed: 55, allowHalfTempo: true },
  { name: 'Dance 110 · Eb mayor', bpm: 110, keyPc: 3, mode: MODE_MAJOR, pattern: 'fourFloor', seed: 66 },
  { name: 'Breaks 150 · B menor', bpm: 150, keyPc: 11, mode: MODE_MINOR, pattern: 'breakbeat', seed: 77 },
  { name: 'Downtempo 70 · Bb mayor', bpm: 70, keyPc: 10, mode: MODE_MAJOR, pattern: 'hiphop', seed: 88 },
  { name: 'Axis loop 124 · A menor (relativa ok)', bpm: 124, keyPc: 9, mode: MODE_MINOR, pattern: 'fourFloor', progression: 'axisMinor', seed: 99, allowRelative: true },
  { name: 'Detune +30c 122 · D menor', bpm: 122, keyPc: 2, mode: MODE_MINOR, pattern: 'fourFloor', detuneCents: 30, seed: 111, expectCents: 30 },
  { name: 'Detune −25c 133 · E mayor', bpm: 133, keyPc: 4, mode: MODE_MAJOR, pattern: 'fourFloor', detuneCents: -25, seed: 122, expectCents: -25 },
  { name: 'Trance 138 bajo en 8as · F menor', bpm: 138, keyPc: 5, mode: MODE_MINOR, pattern: 'fourFloor', bassEighths: true, seed: 133 },
  { name: 'Sin batería 90 · A mayor', bpm: 90, keyPc: 9, mode: MODE_MAJOR, noDrums: true, noBass: true, seed: 144, allowBpmSet: [90, 180], skipConfCheck: true },
  { name: 'Intro 20s + House 126 · Ab menor', bpm: 126, keyPc: 8, mode: MODE_MINOR, pattern: 'fourFloor', introSec: 20, dur: 65, seed: 155 },
]

function checkCase (c, r) {
  const failures = []

  // BPM: exact metrical level required (alternate levels only if flagged).
  const targets = c.allowBpmSet ?? [c.bpm]
  const bpmOk = targets.some(t => Math.abs(r.bpm - t) <= 0.6)
  const halfOk = c.allowHalfTempo && Math.abs(r.bpm - c.bpm / 2) <= 0.4
  if (!bpmOk && !halfOk) failures.push(`bpm ${r.bpm} ≠ ${targets.join('/')}`)

  // Key: exact, or relative when the progression is genuinely ambiguous.
  const expNote = NOTE_NAMES[c.keyPc]
  const keyExact = r.key === expNote && r.mode === c.mode
  let keyOk = keyExact
  if (!keyOk && c.allowRelative) {
    const rel = relativeKey(c.keyPc, c.mode)
    keyOk = r.key === NOTE_NAMES[rel.pitchClass] && r.mode === rel.mode
  }
  if (!keyOk) failures.push(`key ${r.key} ${r.mode} ≠ ${expNote} ${c.mode}`)

  if (c.expectCents !== undefined && Math.abs(r.tuningCents - c.expectCents) > 8) {
    failures.push(`tuning ${r.tuningCents}c ≠ ${c.expectCents}c`)
  }

  if (!c.skipConfCheck && bpmOk && r.bpmConfidence < 70) failures.push(`bpmConf baja: ${r.bpmConfidence}`)
  if (keyExact && r.keyConfidence < 60) failures.push(`keyConf baja: ${r.keyConfidence}`)

  return failures
}

async function main () {
  let failed = 0
  const rows = []

  for (const c of CASES) {
    const pcm = synthTrack(c)
    const t0 = Date.now()
    const r = analyzeAudioData(pcm, SR, { duration: pcm.length / SR })
    const ms = Date.now() - t0
    const failures = checkCase(c, r)
    if (failures.length) failed++
    rows.push({
      caso: c.name,
      esperado: `${c.bpm} · ${NOTE_NAMES[c.keyPc]} ${c.mode}`,
      bpm: `${r.bpmDisplay} (${r.bpmConfidence}%)${r.bpmAltDisplay ? ` alt:${r.bpmAltDisplay}` : ''}`,
      key: `${r.key} ${r.mode} ${r.camelot} (${r.keyConfidence}%)`,
      afin: `${r.tuningCents}c`,
      per: r.metrics.tempo ? r.metrics.tempo.medStrength?.toFixed(3) : '—',
      ms,
      estado: failures.length ? `FAIL: ${failures.join('; ')}` : 'OK',
    })
  }

  // Edge cases: must degrade gracefully, never crash or overclaim.
  const noise = analyzeAudioData(synthNoise(30), SR, {})
  const noiseOk = noise.bpmConfidence < 60 && noise.keyConfidence < 55
  rows.push({
    caso: 'Ruido 30 s (sin música)',
    esperado: 'confianzas bajas',
    bpm: `${noise.bpmDisplay} (${noise.bpmConfidence}%)`,
    key: `${noise.key} ${noise.mode} (${noise.keyConfidence}%)`,
    afin: `${noise.tuningCents}c`,
    ms: 0,
    estado: noiseOk ? 'OK' : 'FAIL: sobre-confianza en ruido',
  })
  if (!noiseOk) failed++

  let silentOk = false
  try { analyzeAudioData(new Float32Array(SR * 10), SR, {}) } catch (e) { silentOk = e.message === 'AUDIO_SILENT' }
  let shortOk = false
  try { analyzeAudioData(new Float32Array(SR * 2).fill(0.1), SR, {}) } catch (e) { shortOk = e.message === 'AUDIO_TOO_SHORT' }
  rows.push({ caso: 'Silencio / clip corto', esperado: 'errores tipados', bpm: '—', key: '—', afin: '—', ms: 0, estado: silentOk && shortOk ? 'OK' : 'FAIL' })
  if (!silentOk || !shortOk) failed++

  console.table(rows)
  console.log(failed === 0 ? `✔ ${rows.length} casos OK` : `✘ ${failed} casos FALLAN`)
  process.exit(failed === 0 ? 0 : 1)
}

main()
