// ─────────────────────────────────────────────────────────────────────────────
// Synthetic test-track generator shared by the validation suite and debug
// tools. Everything is deterministic (seeded RNG) and rendered at the
// engine's working sample rate.
// ─────────────────────────────────────────────────────────────────────────────

import { ENGINE_SAMPLE_RATE } from '../src/utils/audioEngine.js'
import { MODE_MINOR } from '../src/utils/musicTheory.js'

export const SR = ENGINE_SAMPLE_RATE

// Deterministic RNG (mulberry32) so runs are reproducible.
export function makeRng (seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const noteHz = (midi, detune) => 440 * Math.pow(2, (midi - 69) / 12) * detune

// ─── Instrument renderers (additive, into a shared buffer) ──────────────────
function addKick (buf, t0, vel) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(0.35 * SR)
  const tau = 0.04
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    const phase = 2 * Math.PI * (45 * t + 100 * tau * (1 - Math.exp(-t / tau)))
    buf[n0 + i] += vel * Math.sin(phase) * Math.exp(-t / 0.13)
  }
}

function addSnare (buf, t0, vel, rng) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(0.22 * SR)
  let lp = 0
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    const white = rng() * 2 - 1
    lp += 0.25 * (white - lp) // crude band shaping
    const noise = (white - lp) * 0.7
    const tone = 0.5 * Math.sin(2 * Math.PI * 186 * t) * Math.exp(-t / 0.05)
    buf[n0 + i] += vel * 0.8 * ((noise * Math.exp(-t / 0.08)) + tone)
  }
}

function addHat (buf, t0, vel, rng) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(0.06 * SR)
  let prev = 0
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    const white = rng() * 2 - 1
    const hp = white - prev // 1st-order highpass
    prev = white
    buf[n0 + i] += vel * 0.32 * hp * Math.exp(-t / 0.022)
  }
}

function addBass (buf, t0, midi, dur, vel, detune) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(dur * SR)
  const f = noteHz(midi, detune)
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    const env = Math.exp(-t / 0.18) * Math.min(1, t / 0.005)
    buf[n0 + i] += vel * 0.9 * env * (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t))
  }
}

function addPadNote (buf, t0, midi, dur, vel, detune) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(dur * SR)
  const f = noteHz(midi, detune)
  const rel = Math.max(1, len - Math.floor(0.1 * SR))
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    let s = 0
    for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * h * f * t) / Math.pow(h, 1.3)
    let env = Math.min(1, t / 0.03)
    if (i > rel) env *= 1 - (i - rel) / (len - rel)
    buf[n0 + i] += vel * env * s
  }
}

function addArpNote (buf, t0, midi, vel, detune) {
  const n0 = Math.floor(t0 * SR)
  const len = Math.floor(0.12 * SR)
  const f = noteHz(midi, detune)
  for (let i = 0; i < len && n0 + i < buf.length; i++) {
    const t = i / SR
    buf[n0 + i] += vel * 0.3 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.05)
  }
}

// ─── Track synthesis ─────────────────────────────────────────────────────────
// Cadential progressions with an unambiguous tonic. The 'axis' progression
// (i–VI–III–VII) is deliberately relative-ambiguous, used by one test case.
const PROGRESSIONS = {
  cadentialMinor: [[0, 'm'], [5, 'm'], [7, 'M'], [0, 'm']], // i  iv V  i (harmonic V)
  cadentialMajor: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']], // I  IV V  I
  axisMinor: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']],     // i  VI III VII
}

const PATTERNS = {
  fourFloor: { kick: [0, 1, 2, 3], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5], swing: 0 },
  breakbeat: { kick: [0, 1.75, 2.5], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], swing: 0 },
  hiphop: { kick: [0, 0.75, 2.25], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], swing: 0.07 },
}

export function synthTrack ({
  bpm, dur = 50, keyPc, mode, pattern = 'fourFloor', detuneCents = 0,
  progression, seed = 1234, bassEighths = false, noDrums = false,
  noBass = false, introSec = 0,
}) {
  const n = Math.floor(dur * SR)
  const buf = new Float32Array(n)
  const rng = makeRng(seed)
  const detune = Math.pow(2, detuneCents / 1200)
  const beat = 60 / bpm
  const bar = 4 * beat
  const nBars = Math.floor(dur / bar)
  const rootMidi = 48 + keyPc
  const prog = PROGRESSIONS[progression ?? (mode === MODE_MINOR ? 'cadentialMinor' : 'cadentialMajor')]
  const pat = PATTERNS[pattern]
  const triad = (q) => (q === 'M' ? [0, 4, 7] : [0, 3, 7])
  const human = () => (rng() - 0.5) * 0.006
  const velj = () => 0.9 + 0.2 * rng()

  for (let b = 0; b < nBars; b++) {
    const t0 = b * bar
    const inIntro = t0 < introSec // pads only (beatless intro)
    const [deg, quality] = prog[b % prog.length]
    const chordRoot = rootMidi + deg
    const tones = triad(quality)

    // Pad chord (triad + octave) across the bar
    for (const iv of tones) addPadNote(buf, t0 + human(), chordRoot + iv, bar, 0.16 * velj(), detune)
    addPadNote(buf, t0 + human(), chordRoot + 12, bar, 0.12 * velj(), detune)

    // Bass: chord root, one/two octaves down — quarters or rolling eighths
    if (!noBass && !inIntro) {
      const steps = bassEighths ? 8 : 4
      const stepBeat = bassEighths ? 0.5 : 1
      for (let q = 0; q < steps; q++) {
        addBass(buf, t0 + q * stepBeat * beat + human(), chordRoot - 24, stepBeat * beat * 0.6, velj(), detune)
      }
    }

    // Arp: eighth notes cycling chord tones, two octaves up
    if (!inIntro) {
      for (let e = 0; e < 8; e++) {
        const tone = tones[e % tones.length]
        addArpNote(buf, t0 + e * 0.5 * beat + human(), chordRoot + tone + 24, velj(), detune)
      }
    }

    // Drums
    if (!noDrums && !inIntro) {
      for (const kb of pat.kick) addKick(buf, t0 + kb * beat + human(), velj())
      for (const sb of pat.snare) addSnare(buf, t0 + sb * beat + human(), velj(), rng)
      for (const hb of pat.hat) {
        const swung = hb % 1 !== 0 ? hb + pat.swing : hb
        addHat(buf, t0 + swung * beat + human(), velj(), rng)
      }
    }
  }

  // Gentle noise floor + soft clip + normalize
  let lp = 0
  let peak = 0
  for (let i = 0; i < n; i++) {
    lp += 0.02 * ((rng() * 2 - 1) - lp)
    buf[i] = Math.tanh(0.8 * (buf[i] + lp * 0.02))
    const a = Math.abs(buf[i])
    if (a > peak) peak = a
  }
  if (peak > 0) for (let i = 0; i < n; i++) buf[i] = (buf[i] / peak) * 0.95
  return buf
}

export function synthNoise (dur, seed = 7) {
  const rng = makeRng(seed)
  const n = Math.floor(dur * SR)
  const buf = new Float32Array(n)
  let lp = 0
  for (let i = 0; i < n; i++) {
    lp += 0.15 * ((rng() * 2 - 1) - lp)
    buf[i] = lp * 1.5
  }
  return buf
}

