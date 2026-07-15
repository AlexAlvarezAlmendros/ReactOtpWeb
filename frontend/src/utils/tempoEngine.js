// ─────────────────────────────────────────────────────────────────────────────
// Tempo engine — professional-grade BPM estimation.
//
// Method (faithful to published, benchmark-validated designs):
//   1. Onset Strength Signal (OSS), full band + low band: log-compressed
//      spectral flux, low-passed and detrended       (Percival & Tzanetakis 2014)
//   2. Beat period: generalized autocorrelation with harmonic enhancement,
//      estimated on overlapping ~12 s windows and accumulated into a kernel
//      density over BPM → track-wide consistency vote (Percival & Tzanetakis 2014)
//   3. Metrical level (octave) decision: pulse-train combs on the kick/bass
//      band — fastest level with every beat anchored wins; composite
//      on/off-beat structure × a wide log-tempo prior as fallback
//   4. Verification & refinement: dynamic-programming beat tracking
//      (Ellis 2007, as in librosa) → inlier-mean inter-beat interval, beat
//      salience and regularity feed an honest confidence score.
// ─────────────────────────────────────────────────────────────────────────────

import { fft, hannWindow, generalizedACF, lowpassFIR, movingMean, parabolicPeak, sampleAt } from './dsp.js'

const MIN_BPM = 50
const MAX_BPM = 210

// ─── 1. Onset Strength Signal (full band + low band) ────────────────────────
// The low band (< 160 Hz — kick and bass fundamentals) is computed alongside:
// the tactus that commercial tools report is the one every kick/bass event
// marks, which is what disambiguates 128 vs 64 BPM.
const LOW_BAND_HZ = 160

function postProcessOSS (raw, ossSr) {
  const smoothed = lowpassFIR(raw, 8 / ossSr, 21)
  const trend = movingMean(smoothed, Math.round(ossSr * 0.75))
  const out = new Float32Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = Math.max(0, smoothed[i] - trend[i])
  return out
}

export function computeOSS (pcm, sr) {
  // Frame ≈ 46 ms, hop = frame/8 → OSS rate ≈ 172 Hz at 22 050 Hz input.
  let frame = 1
  while (frame < sr * 0.0464) frame <<= 1
  const hop = frame >> 3
  const half = frame >> 1
  const n = pcm.length
  const nFrames = Math.max(0, Math.floor((n - frame) / hop) + 1)
  const ossSr = sr / hop

  const win = hannWindow(frame)
  const re = new Float64Array(frame)
  const im = new Float64Array(frame)
  const prev = new Float32Array(half)
  const oss = new Float32Array(nFrames)
  const ossLow = new Float32Array(nFrames)
  const lowBins = Math.max(2, Math.ceil((LOW_BAND_HZ * frame) / sr))

  for (let f = 0; f < nFrames; f++) {
    const off = f * hop
    for (let i = 0; i < frame; i++) { re[i] = pcm[off + i] * win[i]; im[i] = 0 }
    fft(re, im)

    let flux = 0
    let fluxLow = 0
    for (let k = 1; k < half; k++) {
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k])
      const lm = Math.log1p(100 * mag)
      const d = lm - prev[k]
      if (d > 0 && f > 0) {
        flux += d
        if (k <= lowBins) fluxLow += d
      }
      prev[k] = lm
    }
    oss[f] = flux
    ossLow[f] = fluxLow
  }

  if (nFrames === 0) return { oss, ossLow, ossSr }
  return { oss: postProcessOSS(oss, ossSr), ossLow: postProcessOSS(ossLow, ossSr), ossSr }
}

// ─── 2. Per-window beat period via enhanced generalized ACF ─────────────────
function windowPeriodEstimate (ossWin, ossSr) {
  const acf = generalizedACF(ossWin, 1)
  const minLag = Math.max(2, Math.floor((60 / MAX_BPM) * ossSr))
  const maxLag = Math.min(ossWin.length - 1, Math.ceil((60 / MIN_BPM) * ossSr))
  if (maxLag - minLag < 4) return null

  // Harmonic enhancement: a true beat lag is supported by peaks at its
  // multiples; search each multiple within a small tolerance window.
  const HARMONICS = [[1, 1.0], [2, 0.75], [3, 0.3], [4, 0.5]]
  const score = new Float64Array(maxLag + 1)
  const nAcf = acf.length
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    let wSum = 0
    for (const [m, w] of HARMONICS) {
      const center = m * lag
      if (center >= nAcf) break
      const tol = Math.max(1, Math.round(0.015 * center))
      let best = -Infinity
      const lo = Math.max(0, center - tol)
      const hi = Math.min(nAcf - 1, center + tol)
      for (let i = lo; i <= hi; i++) if (acf[i] > best) best = acf[i]
      s += w * best
      wSum += w
    }
    score[lag] = wSum > 0 ? s / wSum : 0
  }

  let bestLag = minLag
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    if (score[lag] > score[bestLag]) bestLag = lag
  }
  const { pos, val } = parabolicPeak(score, bestLag)
  if (!(val > 0)) return null
  return { bpm: (60 * ossSr) / pos, strength: val }
}

// Accumulate window estimates into a kernel density over BPM.
function tempoKDE (estimates) {
  const step = 0.25
  const nBins = Math.floor((MAX_BPM - MIN_BPM) / step) + 1
  const kde = new Float64Array(nBins)
  for (const { bpm, strength } of estimates) {
    const sigma = Math.max(0.75, 0.02 * bpm)
    const lo = Math.max(0, Math.floor((bpm - 4 * sigma - MIN_BPM) / step))
    const hi = Math.min(nBins - 1, Math.ceil((bpm + 4 * sigma - MIN_BPM) / step))
    for (let i = lo; i <= hi; i++) {
      const b = MIN_BPM + i * step
      const z = (b - bpm) / sigma
      kde[i] += strength * Math.exp(-0.5 * z * z)
    }
  }
  return { kde, step }
}

// ─── 3. Pulse-train level metrics (metrical level decision) ─────────────────
// A band is a usable beat anchor when it is *impulsive*: sparse strong events
// over near-silence (kicks/bass), not a dense wash (hats fill every eighth in
// the full band, which is exactly why it cannot decide the metrical level).
export function bandIsImpulsive (x) {
  const n = x.length
  if (n < 16) return false
  const sorted = Float32Array.from(x).sort()
  const median = sorted[n >> 1]
  const p90 = sorted[Math.floor(n * 0.9)]
  let mean = 0
  for (let i = 0; i < n; i++) mean += x[i]
  mean /= n
  return mean > 1e-9 && p90 > 4 * Math.max(median, mean * 0.02)
}

// Samples the anchor signal on a comb at the candidate period, at the phase
// with the strongest on-beat mean, and measures:
//   · support  — weakest ~30 % of comb slots vs their median. ≈1 when every
//     beat is marked, ≈0 when the comb has empty slots (the candidate
//     subdivides the real pulse).
//   · offRatio — energy at half-period offsets vs on-beat energy. ≈1 means
//     the off positions are real beats too → the true tactus is faster.
//   · onCV — variation across on-beat samples; high alternation means the
//     true tactus is slower.
function pulseSpanMetrics (sig, ossSr, bpm) {
  const period = (60 / bpm) * ossSr
  const n = sig.length
  const nBeats = Math.floor((n - 1) / period)
  if (nBeats < 4) return null

  let globalMean = 0
  for (let i = 0; i < n; i++) globalMean += sig[i]
  globalMean /= n
  if (globalMean <= 1e-9) return null

  const N_PHASES = 24
  let best = null
  const samples = []
  for (let p = 0; p < N_PHASES; p++) {
    const phase = (p * period) / N_PHASES
    let on = 0
    let on2 = 0
    let off = 0
    let count = 0
    samples.length = 0
    for (let k = 0; k * period + phase < n - 1; k++) {
      const pos = phase + k * period
      const v = sampleAt(sig, pos)
      on += v
      on2 += v * v
      samples.push(v)
      off += sampleAt(sig, Math.min(n - 1, pos + 0.5 * period))
      count++
    }
    if (count < 4) continue
    const onMean = on / count
    if (best && onMean <= best.onMean) continue

    off /= count
    const variance = Math.max(0, on2 / count - onMean * onMean)
    const onCV = onMean > 1e-9 ? Math.sqrt(variance) / onMean : 1
    const offRatio = Math.min(1, off / Math.max(onMean, 1e-9))

    samples.sort((a, b) => a - b)
    const kWeak = Math.max(1, Math.floor(samples.length * 0.3))
    let weak = 0
    for (let i = 0; i < kWeak; i++) weak += samples[i]
    weak /= kWeak
    const median = samples[Math.floor(samples.length / 2)]
    const support = median > 1e-9 ? Math.min(1, weak / median) : 0

    best = {
      onMean,
      onMeanN: onMean / globalMean,
      offRatio,
      onCV,
      support,
      composite: (onMean / globalMean) * (1 - 0.45 * offRatio) * (1 - 0.3 * Math.min(1, onCV)),
    }
  }
  return best
}

// The comb dephases over long excerpts (a 0.3 % tempo error drifts a full
// beat in ~30 s), so metrics are measured on up to three short spans and
// combined by median — robust to one span landing on a breakdown.
function pulseLevelMetrics (sig, ossSr, bpm) {
  const spanLen = Math.min(sig.length, Math.round(15 * ossSr))
  const starts = sig.length <= spanLen
    ? [0]
    : [0, Math.floor((sig.length - spanLen) / 2), sig.length - spanLen]
  const spans = []
  for (const s of starts) {
    const m = pulseSpanMetrics(sig.subarray(s, s + spanLen), ossSr, bpm)
    if (m) spans.push(m)
  }
  if (spans.length === 0) return null
  const med = (key) => {
    const v = spans.map(s => s[key]).sort((a, b) => a - b)
    return v[Math.floor(v.length / 2)]
  }
  return {
    onMeanN: med('onMeanN'),
    offRatio: med('offRatio'),
    onCV: med('onCV'),
    support: med('support'),
    composite: med('composite'),
  }
}

// Wide log-normal prior over tempo (σ = 0.9 octaves around 120 BPM): breaks
// exact ties toward perceptually common tempos without vetoing extremes.
function tempoPrior (bpm) {
  const z = Math.log2(bpm / 120) / 0.9
  return Math.exp(-0.5 * z * z)
}

// ─── 4. Dynamic-programming beat tracking (Ellis 2007) ──────────────────────
export function trackBeats (oss, ossSr, bpm, tightness = 100) {
  const n = oss.length
  const tau = (60 / bpm) * ossSr
  if (n < tau * 3) return null

  // Normalize local score to mean 1 so the tightness penalty is scale-free.
  let mean = 0
  for (let i = 0; i < n; i++) mean += oss[i]
  mean /= n
  if (mean <= 1e-9) return null
  const O = new Float64Array(n)
  for (let i = 0; i < n; i++) O[i] = oss[i] / mean

  const minD = Math.max(1, Math.round(0.5 * tau))
  const maxD = Math.min(n - 1, Math.round(2 * tau))
  const C = new Float64Array(n)
  const ptr = new Int32Array(n).fill(-1)

  for (let t = 0; t < n; t++) {
    let bestScore = 0
    let bestPrev = -1
    if (t >= minD) {
      const dHi = Math.min(maxD, t)
      for (let d = minD; d <= dHi; d++) {
        const logRatio = Math.log(d / tau)
        const s = C[t - d] - tightness * logRatio * logRatio
        if (s > bestScore) { bestScore = s; bestPrev = t - d }
      }
    }
    C[t] = O[t] + bestScore
    ptr[t] = bestPrev
  }

  // Best chain ending near the end of the signal.
  let end = n - 1
  const searchFrom = Math.max(0, n - Math.round(tau * 1.5))
  for (let t = searchFrom; t < n; t++) if (C[t] > C[end]) end = t

  const beats = []
  for (let t = end; t >= 0; t = ptr[t]) {
    beats.push(t)
    if (ptr[t] < 0) break
  }
  beats.reverse()
  if (beats.length < 4) return null

  const ibis = []
  for (let i = 1; i < beats.length; i++) ibis.push(beats[i] - beats[i - 1])
  const sorted = [...ibis].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqrCV = median > 0 ? (q3 - q1) / median : 1

  // Beat times are integer OSS frames; the median IBI inherits that
  // quantization (~0.6 % at 128 BPM). The mean over inlier IBIs recovers
  // sub-frame precision.
  let ibiSum = 0
  let ibiCount = 0
  for (const d of ibis) {
    if (Math.abs(d - median) <= Math.max(2, median * 0.04)) { ibiSum += d; ibiCount++ }
  }
  const refined = ibiCount > 0 ? ibiSum / ibiCount : median

  let onBeat = 0
  for (const b of beats) onBeat += O[b]
  onBeat /= beats.length

  return {
    bpm: (60 * ossSr) / refined,
    nBeats: beats.length,
    ibiCV: iqrCV,
    beatSalience: onBeat, // vs mean 1
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function estimateTempo (pcm, sr, { onProgress } = {}) {
  const report = (p) => { if (onProgress) onProgress(p) }

  // Cap analysis to the central 3 minutes: plenty of evidence, bounded CPU.
  const maxSamples = Math.floor(180 * sr)
  let segment = pcm
  if (pcm.length > maxSamples) {
    const start = Math.floor((pcm.length - maxSamples) / 2)
    segment = pcm.subarray(start, start + maxSamples)
  }

  const { oss, ossLow, ossSr } = computeOSS(segment, sr)
  report(0.45)

  const empty = { bpm: 0, confidence: 0, alt: null, metrics: null }
  if (oss.length < ossSr * 3) return empty
  let energy = 0
  for (let i = 0; i < oss.length; i++) energy += oss[i]
  if (energy / oss.length < 1e-6) return empty

  // Windowed period estimates → KDE vote across the whole excerpt.
  const WIN = 2048
  const HOP = 512
  const estimates = []
  if (oss.length <= WIN) {
    const e = windowPeriodEstimate(oss, ossSr)
    if (e) estimates.push(e)
  } else {
    for (let start = 0; start + WIN <= oss.length; start += HOP) {
      const e = windowPeriodEstimate(oss.subarray(start, start + WIN), ossSr)
      if (e) estimates.push(e)
    }
  }
  if (estimates.length === 0) return empty
  report(0.65)

  const kdeObj = tempoKDE(estimates)
  const { kde, step } = kdeObj
  let peakIdx = 0
  for (let i = 1; i < kde.length; i++) if (kde[i] > kde[peakIdx]) peakIdx = i
  const { pos } = parabolicPeak(kde, peakIdx)
  let baseBpm = MIN_BPM + pos * step

  // Micro-refine the base period (±1.2 % grid) by maximizing comb alignment
  // on a central span: the KDE quantization (~0.3 %) would otherwise dephase
  // the pulse combs used for the level decision below.
  {
    const spanLen = Math.min(oss.length, Math.round(15 * ossSr))
    const mid = oss.subarray(
      Math.floor((oss.length - spanLen) / 2),
      Math.floor((oss.length - spanLen) / 2) + spanLen
    )
    let bestOn = -1
    let bestBpm = baseBpm
    for (let s = -4; s <= 4; s++) {
      const b = baseBpm * (1 + 0.003 * s)
      const m = pulseSpanMetrics(mid, ossSr, b)
      if (m && m.onMean > bestOn) { bestOn = m.onMean; bestBpm = b }
    }
    baseBpm = bestBpm
  }

  // Candidate metrical levels of the base tempo. The KDE already fixed the
  // period *family*; the level itself is decided by pulse-train structure on
  // the most informative band: kick/bass when impulsive low-band content
  // exists (hats fill every eighth in the full band and would mask the level).
  const hasLow = bandIsImpulsive(ossLow)
  const anchorSig = hasLow ? ossLow : oss
  const RATIOS = [[0.5, 1.0], [2 / 3, 0.85], [1, 1.0], [1.5, 0.85], [2, 1.0]]
  const candidates = []
  for (const [ratio, penalty] of RATIOS) {
    const bpm = baseBpm * ratio
    if (bpm < MIN_BPM || bpm > MAX_BPM) continue
    if (candidates.some(c => Math.abs(c.bpm - bpm) / bpm < 0.02)) continue
    const m = pulseLevelMetrics(anchorSig, ossSr, bpm)
    if (!m) continue
    candidates.push({
      bpm,
      lvl: m,
      score: penalty * m.composite * (0.4 + 0.6 * tempoPrior(bpm)),
    })
  }
  if (candidates.length === 0) return empty

  // Hierarchical decision: prefer the fastest level whose every beat is
  // anchored by kick/bass events — that is the tactus DJs and commercial
  // tools label. Without solid low-band evidence, fall back to the composite
  // pulse score × prior.
  const supported = hasLow
    ? candidates.filter(c => c.lvl.support >= 0.45 && c.lvl.onCV <= 0.6)
    : []
  const byScore = [...candidates].sort((a, b) => b.score - a.score)
  if (globalThis.__TEMPO_DEBUG) {
    console.log(`  base=${baseBpm.toFixed(1)} hasLow=${hasLow}`)
    for (const c of candidates) {
      console.log(`  cand ${c.bpm.toFixed(1).padStart(6)}  sup=${c.lvl.support.toFixed(2)} onCV=${c.lvl.onCV.toFixed(2)} offR=${c.lvl.offRatio.toFixed(2)} onN=${c.lvl.onMeanN.toFixed(2)} comp=${c.lvl.composite.toFixed(3)} score=${c.score.toFixed(3)}`)
    }
  }
  const supportDecided = supported.length > 0
  const winner = supportDecided
    ? supported.reduce((a, b) => (b.bpm > a.bpm ? b : a))
    : byScore[0]
  const runnerUp = byScore.find(c => c !== winner) || null
  report(0.8)

  // Verify and refine with DP beat tracking.
  let bpm = winner.bpm
  const dpSpan = oss.length > ossSr * 120 ? oss.subarray(0, Math.floor(ossSr * 120)) : oss
  const beat = trackBeats(dpSpan, ossSr, bpm)
  let beatSalience = 0
  let ibiCV = 1
  if (beat) {
    if (Math.abs(beat.bpm - bpm) / bpm < 0.035) bpm = beat.bpm
    beatSalience = beat.beatSalience
    ibiCV = beat.ibiCV
  }
  report(0.95)

  // Honest confidence from independent evidence:
  //  · periodicity — absolute strength of the enhanced ACF peaks; gates the
  //    whole score so aperiodic material can never look confident
  //  · agreement — share of window votes metrically consistent with the result
  //  · salience  — how much onset energy concentrates on the tracked beats
  //  · stability — inter-beat regularity
  //  · levelCert — margin of the metrical-level decision
  let agreeW = 0
  let totalW = 0
  for (const { bpm: b, strength } of estimates) {
    totalW += strength
    for (const r of [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 4 / 3, 1.5, 2, 3, 4]) {
      if (Math.abs(b * r - bpm) / bpm < 0.045) { agreeW += strength; break }
    }
  }
  const agreement = totalW > 0 ? agreeW / totalW : 0
  const strengths = estimates.map(e => e.strength).sort((a, b) => a - b)
  const medStrength = strengths[Math.floor(strengths.length / 2)]
  const periodicity = Math.min(1, Math.max(0.1, (medStrength - 0.05) / 0.22))
  const salienceN = Math.min(1, Math.max(0, (beatSalience - 1) / 2.2))
  const stability = 1 - Math.min(1, ibiCV * 7)
  const levelCert = supportDecided
    ? 0.5 + 0.5 * Math.min(1, (winner.lvl.support - 0.45) / 0.35)
    : (runnerUp && runnerUp.score > 0 ? winner.score / (winner.score + runnerUp.score) : 1)
  const confidence = Math.round(Math.min(98, Math.max(5,
    100 * periodicity * (0.34 * agreement + 0.30 * salienceN + 0.20 * stability + 0.16 * levelCert)
  )))

  // Surface the runner-up level when the decision was genuinely close.
  const alt = !supportDecided && runnerUp && runnerUp.score > winner.score * 0.72
    ? runnerUp.bpm
    : null

  return {
    bpm,
    confidence,
    alt,
    metrics: { agreement, beatSalience, ibiCV, levelCert, medStrength, windows: estimates.length },
  }
}
