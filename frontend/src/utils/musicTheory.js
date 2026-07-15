// ─────────────────────────────────────────────────────────────────────────────
// Music theory helpers — note naming, Camelot wheel, BPM display rules.
// Pure functions, no DOM/audio dependencies (unit-testable in Node/Jest).
// ─────────────────────────────────────────────────────────────────────────────

// Display spelling favours the conventional DJ/producer names (flats where
// customary). Index = pitch class, 0 = C.
export const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const MODE_MAJOR = 'major'
export const MODE_MINOR = 'minor'

// Camelot wheel — the de-facto DJ standard for harmonic mixing.
// 8B = C major, 8A = A minor; +7 semitones (a fifth) = +1 on the wheel.
const CAMELOT_MAJOR = new Array(12)
const CAMELOT_MINOR = new Array(12)
for (let step = 0; step < 12; step++) {
  const num = ((8 + step - 1) % 12) + 1          // 8, 9, …, 12, 1, …, 7
  CAMELOT_MAJOR[(0 + 7 * step) % 12] = `${num}B` // C, G, D, …
  CAMELOT_MINOR[(9 + 7 * step) % 12] = `${num}A` // Am, Em, Bm, …
}

export function toCamelot (pitchClass, mode) {
  const pc = ((pitchClass % 12) + 12) % 12
  return mode === MODE_MAJOR ? CAMELOT_MAJOR[pc] : CAMELOT_MINOR[pc]
}

// Open Key notation (Traktor): same wheel, 1d = C major / 1m = A minor.
export function toOpenKey (pitchClass, mode) {
  const camelot = toCamelot(pitchClass, mode)
  const num = parseInt(camelot, 10)
  const openNum = ((num + 5 - 1) % 12) + 1
  return `${openNum}${mode === MODE_MAJOR ? 'd' : 'm'}`
}

export function keyLabel (pitchClass, mode) {
  const pc = ((pitchClass % 12) + 12) % 12
  return { note: NOTE_NAMES[pc], mode }
}

// Relative major/minor (shares the same key signature).
export function relativeKey (pitchClass, mode) {
  const pc = ((pitchClass % 12) + 12) % 12
  return mode === MODE_MAJOR
    ? { pitchClass: (pc + 9) % 12, mode: MODE_MINOR }
    : { pitchClass: (pc + 3) % 12, mode: MODE_MAJOR }
}

// Musical relationship between two keys, for explaining alternatives.
// Returns 'same' | 'relative' | 'fifth' | 'parallel' | 'other'.
export function keyRelationship (a, b) {
  if (a.mode === b.mode && a.pitchClass === b.pitchClass) return 'same'
  const rel = relativeKey(a.pitchClass, a.mode)
  if (rel.pitchClass === b.pitchClass && rel.mode === b.mode) return 'relative'
  if (a.mode === b.mode) {
    const d = ((b.pitchClass - a.pitchClass) % 12 + 12) % 12
    if (d === 7 || d === 5) return 'fifth'
  }
  if (a.mode !== b.mode && a.pitchClass === b.pitchClass) return 'parallel'
  return 'other'
}

// Produced music sits on integer (or half-integer) BPM almost always.
// Snap when close; otherwise keep one decimal so odd tempos stay honest.
export function snapBpm (bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return { value: 0, display: '—' }
  const nearestInt = Math.round(bpm)
  if (Math.abs(bpm - nearestInt) <= 0.25) {
    return { value: nearestInt, display: String(nearestInt) }
  }
  const nearestHalf = Math.round(bpm * 2) / 2
  if (Math.abs(bpm - nearestHalf) <= 0.12) {
    return { value: nearestHalf, display: nearestHalf.toFixed(1) }
  }
  const oneDec = Math.round(bpm * 10) / 10
  return { value: oneDec, display: oneDec.toFixed(1) }
}

// Fold a BPM into [lo, hi) by octave (×2 / ÷2) — used to compare candidates
// that describe the same pulse at different metrical levels.
export function foldBpm (bpm, lo = 85, hi = 170) {
  if (!Number.isFinite(bpm) || bpm <= 0) return bpm
  let b = bpm
  while (b >= hi) b /= 2
  while (b < lo) b *= 2
  return b
}
