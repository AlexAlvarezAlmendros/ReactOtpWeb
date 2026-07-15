// ─────────────────────────────────────────────────────────────────────────────
// Key engine — professional-grade musical key estimation.
//
// Method:
//   1. STFT with long frames (≈370 ms) → spectral peaks with quadratic
//      interpolation (sub-bin frequency precision).
//   2. Tuning-frequency estimation from the peak deviation histogram —
//      tracks not tuned to A=440 no longer smear across pitch classes.
//   3. HPCP (Harmonic Pitch Class Profile, Gómez 2006): 36-bin resolution,
//      harmonic summation (peaks vote for their possible fundamentals),
//      cos² spreading, per-frame unit-max normalization, silence gating.
//   4. Template matching against four published key profiles —
//      Krumhansl-Kessler, Temperley, EDMA and bgate (Faraldo, Beatport
//      corpus — strongest on electronic music) — ensemble-weighted.
//   5. Temporal voting over ~20 s chunks + full-track profile: a key must
//      win both globally and consistently over time to score high confidence.
// ─────────────────────────────────────────────────────────────────────────────

import { fft, hannWindow, pearson } from './dsp.js'
import { keyLabel, toCamelot, toOpenKey, keyRelationship, MODE_MAJOR, MODE_MINOR } from './musicTheory.js'

// Published key profiles (index 0 = tonic). Sources: Krumhansl & Kessler 1982;
// Temperley (Kostka-Payne); Faraldo et al. — EDMA and bgate (Beatport corpus).
export const KEY_PROFILES = [
  {
    name: 'krumhansl',
    weight: 0.85,
    major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
    minor: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
  },
  {
    name: 'temperley',
    weight: 1.0,
    major: [5.0, 2.0, 3.5, 2.0, 4.5, 4.0, 2.0, 4.5, 2.0, 3.5, 1.5, 4.0],
    minor: [5.0, 2.0, 3.5, 4.5, 2.0, 4.0, 2.0, 4.5, 3.5, 2.0, 1.5, 4.0],
  },
  {
    name: 'edma',
    weight: 1.1,
    major: [1.00, 0.29, 0.50, 0.40, 0.60, 0.56, 0.32, 0.80, 0.31, 0.45, 0.42, 0.39],
    minor: [1.00, 0.31, 0.44, 0.58, 0.33, 0.49, 0.29, 0.78, 0.43, 0.29, 0.53, 0.32],
  },
  {
    name: 'bgate',
    weight: 1.15,
    major: [1.00, 0.00, 0.42, 0.00, 0.53, 0.37, 0.00, 0.77, 0.00, 0.38, 0.21, 0.30],
    minor: [1.00, 0.00, 0.36, 0.39, 0.00, 0.38, 0.00, 0.74, 0.27, 0.00, 0.42, 0.23],
  },
]

const MIN_FREQ = 55
const MAX_FREQ = 5000
const MAX_PEAKS = 40
const HPCP_BINS = 36
const HARMONIC_WEIGHTS = [1.0, 0.8, 0.64, 0.512] // peak votes for f, f/2, f/3, f/4

// ─── Spectral peak extraction (quadratic interpolation on log magnitude) ────
function framePeaks (mag, sr, fftSize, out) {
  const binHz = sr / fftSize
  const loBin = Math.max(2, Math.ceil(MIN_FREQ / binHz))
  const hiBin = Math.min(mag.length - 2, Math.floor(MAX_FREQ / binHz))

  let frameMax = 0
  for (let k = loBin; k <= hiBin; k++) if (mag[k] > frameMax) frameMax = mag[k]
  if (frameMax <= 1e-9) return 0
  const thresh = Math.max(frameMax * 1e-3, 1e-8) // −60 dB relative floor

  let count = 0
  for (let k = loBin; k <= hiBin && count < MAX_PEAKS * 3; k++) {
    const m = mag[k]
    if (m < thresh || m <= mag[k - 1] || m < mag[k + 1]) continue
    // Quadratic interpolation on log-magnitude → sub-bin frequency.
    const a = Math.log(mag[k - 1] + 1e-12)
    const b = Math.log(m + 1e-12)
    const c = Math.log(mag[k + 1] + 1e-12)
    const denom = a - 2 * b + c
    const off = Math.abs(denom) > 1e-12 ? Math.min(0.5, Math.max(-0.5, 0.5 * (a - c) / denom)) : 0
    out.push({ freq: (k + off) * binHz, power: m * m })
    count++
  }

  if (count > MAX_PEAKS) {
    out.sort((p, q) => q.power - p.power)
    out.length = MAX_PEAKS
  }
  let power = 0
  for (const p of out) power += p.power
  return power
}

// ─── Tuning estimation: histogram of peak deviations from the 440 grid ──────
function estimateTuningCents (histogram) {
  const n = histogram.length // 100 bins → 1 cent each, index 0 = −50 cents
  let total = 0
  let max = 0
  for (let i = 0; i < n; i++) { total += histogram[i]; if (histogram[i] > max) max = histogram[i] }
  if (total <= 0 || max < (total / n) * 1.8) return 0 // flat histogram → keep 440

  // Circular smoothing then parabolic peak.
  const smooth = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    for (let d = -2; d <= 2; d++) smooth[i] += histogram[(i + d + n) % n] * (3 - Math.abs(d))
  }
  let peak = 0
  for (let i = 1; i < n; i++) if (smooth[i] > smooth[peak]) peak = i
  const prev = smooth[(peak - 1 + n) % n]
  const next = smooth[(peak + 1) % n]
  const denom = prev - 2 * smooth[peak] + next
  const off = Math.abs(denom) > 1e-12 ? Math.min(0.5, Math.max(-0.5, 0.5 * (prev - next) / denom)) : 0
  let cents = (peak + off) - 50
  if (cents >= 50) cents -= 100
  return cents
}

// ─── HPCP accumulation for one frame ─────────────────────────────────────────
function accumulateHPCP (peaks, tuningRef, hpcp) {
  hpcp.fill(0)
  for (const { freq, power } of peaks) {
    for (let h = 0; h < HARMONIC_WEIGHTS.length; h++) {
      const f0 = freq / (h + 1)
      if (f0 < MIN_FREQ * 0.9) break
      const pcFrac = ((12 * Math.log2(f0 / tuningRef) + 69) % 12 + 12) % 12
      const center = pcFrac * (HPCP_BINS / 12)
      // cos² spreading over ±1.5 bins (±½ semitone)
      const lo = Math.ceil(center - 1.5)
      for (let b = lo; b <= center + 1.5; b++) {
        const d = (b - center) / 1.5
        const w = Math.cos((Math.PI / 2) * d)
        hpcp[((b % HPCP_BINS) + HPCP_BINS) % HPCP_BINS] += power * HARMONIC_WEIGHTS[h] * w * w
      }
    }
  }
}

function foldTo12 (h36) {
  const pc = new Float64Array(12)
  for (let p = 0; p < 12; p++) {
    const c = 3 * p
    pc[p] = 0.5 * h36[(c - 1 + HPCP_BINS) % HPCP_BINS] + h36[c] + 0.5 * h36[(c + 1) % HPCP_BINS]
  }
  return pc
}

// Ensemble profile match: summed weighted Pearson over all profiles.
// Returns scores for all 24 keys (index = root + (mode === minor ? 12 : 0)).
function ensembleScores (chroma12) {
  const scores = new Float64Array(24)
  const rotated = new Array(12)
  for (let root = 0; root < 12; root++) {
    for (let i = 0; i < 12; i++) rotated[i] = chroma12[(i + root) % 12]
    for (const prof of KEY_PROFILES) {
      scores[root] += prof.weight * pearson(rotated, prof.major)
      scores[root + 12] += prof.weight * pearson(rotated, prof.minor)
    }
  }
  const totalW = KEY_PROFILES.reduce((s, p) => s + p.weight, 0)
  for (let i = 0; i < 24; i++) scores[i] /= totalW
  return scores
}

function argmax24 (scores, skip = -1) {
  let best = -1
  for (let i = 0; i < 24; i++) {
    if (i === skip) continue
    if (best < 0 || scores[i] > scores[best]) best = i
  }
  return best
}

const idxToKey = (i) => ({ pitchClass: i % 12, mode: i < 12 ? MODE_MAJOR : MODE_MINOR })

// ─── Public API ──────────────────────────────────────────────────────────────
export function estimateKey (pcm, sr, { onProgress } = {}) {
  const report = (p) => { if (onProgress) onProgress(p) }

  // Central window, up to 4 minutes — enough harmonic evidence for any track.
  const maxSamples = Math.floor(240 * sr)
  let segment = pcm
  if (pcm.length > maxSamples) {
    const start = Math.floor((pcm.length - maxSamples) / 2)
    segment = pcm.subarray(start, start + maxSamples)
  }

  let fftSize = 1
  while (fftSize < sr * 0.34) fftSize <<= 1 // 8192 @ 22 050 Hz → 2.7 Hz/bin
  const hop = fftSize >> 1
  const nFrames = Math.max(0, Math.floor((segment.length - fftSize) / hop) + 1)

  const empty = {
    pitchClass: -1, mode: MODE_MINOR, note: '—', camelot: null, openKey: null,
    confidence: 0, tuningHz: 440, tuningCents: 0, alternative: null, chroma: null,
  }
  if (nFrames < 4) return empty

  const win = hannWindow(fftSize)
  const re = new Float64Array(fftSize)
  const im = new Float64Array(fftSize)
  const mag = new Float64Array(fftSize >> 1)

  // Pass 1 — spectral peaks per frame + global tuning histogram.
  const allPeaks = new Array(nFrames)
  const framePower = new Float64Array(nFrames)
  const tuningHist = new Float64Array(100)
  for (let f = 0; f < nFrames; f++) {
    const off = f * hop
    for (let i = 0; i < fftSize; i++) { re[i] = segment[off + i] * win[i]; im[i] = 0 }
    fft(re, im)
    for (let k = 0; k < mag.length; k++) mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k])

    const peaks = []
    framePower[f] = framePeaks(mag, sr, fftSize, peaks)
    allPeaks[f] = peaks

    for (const { freq, power } of peaks) {
      if (freq < 110 || freq > 3520) continue
      const cents = 1200 * Math.log2(freq / 440)
      const dev = ((cents % 100) + 150) % 100 // 0..100, 50 = in tune
      tuningHist[Math.min(99, Math.max(0, Math.round(dev)))] += Math.sqrt(power)
    }
    if ((f & 63) === 0) report(0.05 + 0.55 * (f / nFrames))
  }

  const tuningCents = estimateTuningCents(tuningHist)
  const tuningRef = 440 * Math.pow(2, tuningCents / 1200)
  report(0.65)

  // Silence gate: drop frames far below the median harmonic power.
  const powers = Array.from(framePower).filter(p => p > 0).sort((a, b) => a - b)
  if (powers.length < 4) return empty
  const medianPower = powers[Math.floor(powers.length / 2)]
  const gate = medianPower * 0.02

  // Pass 2 — HPCP per frame → full-track average + ~20 s chunk averages.
  const CHUNK_SEC = 20
  const framesPerChunk = Math.max(1, Math.round((CHUNK_SEC * sr) / hop))
  const nChunks = Math.ceil(nFrames / framesPerChunk)
  const hpcpFrame = new Float64Array(HPCP_BINS)
  const hpcpFull = new Float64Array(HPCP_BINS)
  const hpcpChunks = Array.from({ length: nChunks }, () => new Float64Array(HPCP_BINS))
  const chunkFrames = new Int32Array(nChunks)
  let keptFrames = 0

  for (let f = 0; f < nFrames; f++) {
    if (framePower[f] < gate || allPeaks[f].length === 0) continue
    accumulateHPCP(allPeaks[f], tuningRef, hpcpFrame)
    let fMax = 0
    for (let i = 0; i < HPCP_BINS; i++) if (hpcpFrame[i] > fMax) fMax = hpcpFrame[i]
    if (fMax <= 0) continue
    const chunk = Math.min(nChunks - 1, Math.floor(f / framesPerChunk))
    for (let i = 0; i < HPCP_BINS; i++) {
      const v = hpcpFrame[i] / fMax
      hpcpFull[i] += v
      hpcpChunks[chunk][i] += v
    }
    chunkFrames[chunk]++
    keptFrames++
  }
  if (keptFrames < 4) return empty
  report(0.8)

  // Global candidate scores.
  const chroma12 = foldTo12(hpcpFull)
  const globalScores = ensembleScores(chroma12)

  // Temporal voting: each usable chunk votes for its own best key,
  // weighted by how decisive that chunk was.
  const chunkVotes = new Float64Array(24)
  let chunkTotal = 0
  let usedChunks = 0
  for (let c = 0; c < nChunks; c++) {
    if (chunkFrames[c] < framesPerChunk * 0.15) continue
    const scores = ensembleScores(foldTo12(hpcpChunks[c]))
    const best = argmax24(scores)
    const second = argmax24(scores, best)
    const margin = Math.max(0, scores[best] - scores[second])
    const w = Math.max(0, scores[best]) * (0.4 + 0.6 * Math.min(1, margin * 8))
    chunkVotes[best] += w
    chunkTotal += w
    usedChunks++
  }
  report(0.92)

  // Combine global fit with temporal consistency.
  let gMin = Infinity
  let gMax = -Infinity
  for (let i = 0; i < 24; i++) {
    if (globalScores[i] < gMin) gMin = globalScores[i]
    if (globalScores[i] > gMax) gMax = globalScores[i]
  }
  const gSpan = gMax - gMin || 1
  const finalScores = new Float64Array(24)
  for (let i = 0; i < 24; i++) {
    const globalN = (globalScores[i] - gMin) / gSpan
    const voteShare = chunkTotal > 0 ? chunkVotes[i] / chunkTotal : 0
    finalScores[i] = 0.55 * globalN + 0.45 * voteShare
  }

  const bestIdx = argmax24(finalScores)
  const secondIdx = argmax24(finalScores, bestIdx)
  const winner = idxToKey(bestIdx)
  const second = idxToKey(secondIdx)

  // Confidence: absolute profile fit, margin over the runner-up, temporal
  // agreement, and cross-profile unanimity.
  const winnerCorr = globalScores[bestIdx] // weighted mean Pearson, ≲ 0.95
  const margin = finalScores[bestIdx] - finalScores[secondIdx]
  const voteShareWinner = chunkTotal > 0 ? chunkVotes[bestIdx] / chunkTotal : 0
  let profileAgree = 0
  for (const prof of KEY_PROFILES) {
    const own = ensembleScoresSingle(chroma12, prof)
    if (argmax24(own) === bestIdx) profileAgree++
  }
  const corrN = Math.min(1, Math.max(0, (winnerCorr - 0.1) / 0.75))
  const confidence = Math.round(Math.min(98, Math.max(5, 100 * (
    0.34 * corrN +
    0.27 * voteShareWinner +
    0.21 * (profileAgree / KEY_PROFILES.length) +
    0.18 * Math.min(1, margin * 5)
  ))))

  const showAlt = margin < 0.18
  const relationship = keyRelationship(winner, second)

  const { note, mode } = keyLabel(winner.pitchClass, winner.mode)
  return {
    pitchClass: winner.pitchClass,
    mode,
    note,
    camelot: toCamelot(winner.pitchClass, winner.mode),
    openKey: toOpenKey(winner.pitchClass, winner.mode),
    confidence,
    tuningHz: Math.round(tuningRef * 10) / 10,
    tuningCents: Math.round(tuningCents),
    alternative: showAlt
      ? {
          ...keyLabel(second.pitchClass, second.mode),
          pitchClass: second.pitchClass,
          camelot: toCamelot(second.pitchClass, second.mode),
          relationship,
        }
      : null,
    chroma: Array.from(chroma12),
    details: { usedChunks, keptFrames, profileAgree },
  }
}

function ensembleScoresSingle (chroma12, prof) {
  const scores = new Float64Array(24)
  const rotated = new Array(12)
  for (let root = 0; root < 12; root++) {
    for (let i = 0; i < 12; i++) rotated[i] = chroma12[(i + root) % 12]
    scores[root] = pearson(rotated, prof.major)
    scores[root + 12] = pearson(rotated, prof.minor)
  }
  return scores
}
