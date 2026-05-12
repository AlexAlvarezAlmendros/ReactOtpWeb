// ─────────────────────────────────────────────────────────────────────────────
// Audio Analysis — High-precision BPM & Key detection (browser, main thread).
//
// Pipeline:
//   1. Decode + mix to mono via Web Audio API.
//   2. Downsample to 11.025 kHz (enough for BPM/key, much faster).
//   3. Pick a 90 s central segment (skip intro/outro).
//   4. Single STFT pass (FFT 2048, hop 256, Hann window) that yields:
//        · log-magnitude spectral flux  → BPM
//        · weighted log-magnitude chromagram → key
//   5. BPM: ACF + comb score + perceptual Rayleigh prior at 120 BPM
//           + parabolic refinement for sub-frame precision.
//   6. Key: Bellman-Budge profile correlation (better than Krumhansl-Schmuckler
//           for pop/electronic). Confidence weighted by margin over runner-up.
// ─────────────────────────────────────────────────────────────────────────────

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

// Bellman-Budge profiles — derived from large pop/rock corpus statistics.
// Significantly better than Krumhansl-Schmuckler for modern music.
const PROFILE_MAJOR = [16.80, 0.86, 12.95, 1.41, 13.49, 11.93, 1.25, 20.28, 1.80, 8.04, 0.62, 10.57]
const PROFILE_MINOR = [18.16, 0.69, 12.99, 13.34, 1.07, 11.15, 1.38, 21.07, 7.49, 1.53, 0.92, 10.21]

// ─── FFT (iterative radix-2 with cached twiddle factors) ────────────────────
const _twiddleCache = new Map()
function getTwiddles (n) {
  let t = _twiddleCache.get(n)
  if (t) return t
  const cos = new Float64Array(n >> 1)
  const sin = new Float64Array(n >> 1)
  for (let i = 0; i < n >> 1; i++) {
    const a = (-2 * Math.PI * i) / n
    cos[i] = Math.cos(a)
    sin[i] = Math.sin(a)
  }
  t = { cos, sin }
  _twiddleCache.set(n, t)
  return t
}

function fft (re, im) {
  const n = re.length
  const { cos, sin } = getTwiddles(n)

  // Bit reversal permutation
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    while (j & bit) { j ^= bit; bit >>= 1 }
    j ^= bit
    if (i < j) {
      let tmp = re[i]; re[i] = re[j]; re[j] = tmp
      tmp = im[i]; im[i] = im[j]; im[j] = tmp
    }
  }

  // Butterflies
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    const step = n / len
    for (let i = 0; i < n; i += len) {
      let kt = 0
      for (let k = 0; k < half; k++) {
        const c = cos[kt]
        const s = sin[kt]
        const tRe = c * re[i + k + half] - s * im[i + k + half]
        const tIm = c * im[i + k + half] + s * re[i + k + half]
        re[i + k + half] = re[i + k] - tRe
        im[i + k + half] = im[i + k] - tIm
        re[i + k] += tRe
        im[i + k] += tIm
        kt += step
      }
    }
  }
}

// ─── Linear-interp downsampler ──────────────────────────────────────────────
function downsample (data, srIn, srOut) {
  if (srIn === srOut) return data
  const ratio = srIn / srOut
  const outLen = Math.floor(data.length / ratio)
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio
    const i0 = Math.floor(idx)
    const i1 = Math.min(i0 + 1, data.length - 1)
    const t = idx - i0
    out[i] = data[i0] * (1 - t) + data[i1] * t
  }
  return out
}

// ─── Pearson correlation ────────────────────────────────────────────────────
function pearson (a, b) {
  const n = a.length
  let sA = 0, sB = 0
  for (let i = 0; i < n; i++) { sA += a[i]; sB += b[i] }
  const mA = sA / n, mB = sB / n
  let num = 0, dA = 0, dB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - mA, db = b[i] - mB
    num += da * db; dA += da * da; dB += db * db
  }
  return num / (Math.sqrt(dA * dB) || 1)
}

// ─── Single STFT pass → onset envelope + chromagram ─────────────────────────
function analyzeSTFT (data, sampleRate, fftSize, hop) {
  const n = data.length
  const half = fftSize >> 1
  const nFrames = Math.max(0, Math.floor((n - fftSize) / hop) + 1)

  // Hann window
  const win = new Float32Array(fftSize)
  for (let i = 0; i < fftSize; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)))
  }

  // Pre-compute per-bin pitch class + perceptual weighting
  // Bass (55-250 Hz): boost — key root usually lives here
  // Mids (250-2000 Hz): nominal
  // Highs (>2000 Hz): attenuate — cymbals/noise
  const binPC = new Int8Array(half)
  const binWeight = new Float32Array(half)
  for (let k = 1; k < half; k++) {
    const freq = (k * sampleRate) / fftSize
    if (freq < 55 || freq > 4500) { binPC[k] = -1; continue }
    const midi = 12 * Math.log2(freq / 440) + 69
    binPC[k] = ((Math.round(midi) % 12) + 12) % 12
    binWeight[k] = freq < 250 ? 1.4
                 : freq < 1000 ? 1.0
                 : freq < 2000 ? 0.7
                 : 0.4
  }

  const re = new Float64Array(fftSize)
  const im = new Float64Array(fftSize)
  const prevLog = new Float32Array(half)
  const onset = new Float32Array(nFrames)
  const chroma = new Float64Array(12)
  let firstFrame = true

  for (let f = 0; f < nFrames; f++) {
    const off = f * hop
    for (let i = 0; i < fftSize; i++) { re[i] = data[off + i] * win[i]; im[i] = 0 }
    fft(re, im)

    let flux = 0
    for (let k = 1; k < half; k++) {
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k])
      const lm = Math.log(1 + mag)

      // Half-wave-rectified log-magnitude spectral flux
      if (!firstFrame) {
        const d = lm - prevLog[k]
        if (d > 0) flux += d
      }
      prevLog[k] = lm

      // Chroma accumulation (log-compressed + perceptually weighted)
      const pc = binPC[k]
      if (pc >= 0) chroma[pc] += lm * binWeight[k]
    }

    onset[f] = flux
    firstFrame = false
  }

  // Normalize chroma to [0, 1]
  let cmax = 0
  for (let i = 0; i < 12; i++) if (chroma[i] > cmax) cmax = chroma[i]
  if (cmax > 0) for (let i = 0; i < 12; i++) chroma[i] /= cmax

  return { onset, chroma }
}

// ─── Tempo estimation ───────────────────────────────────────────────────────
function estimateTempo (onset, hopSec) {
  const n = onset.length
  if (n < 200) return { bpm: 0, confidence: 0 }

  // Adaptive high-pass: subtract local mean to remove slow trends
  const wMean = 40
  const x = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let s = 0, c = 0
    const lo = Math.max(0, i - wMean)
    const hi = Math.min(n - 1, i + wMean)
    for (let k = lo; k <= hi; k++) { s += onset[k]; c++ }
    x[i] = Math.max(0, onset[i] - s / c)
  }

  // Signal energy (for normalization)
  let r0 = 0
  for (let i = 0; i < n; i++) r0 += x[i] * x[i]
  if (r0 < 1e-9) return { bpm: 0, confidence: 0 }

  // BPM range we search
  const minBPM = 55
  const maxBPM = 215
  const minLag = Math.max(1, Math.floor(60 / maxBPM / hopSec))
  const maxLag = Math.min(n - 1, Math.floor(60 / minBPM / hopSec))

  // Autocorrelation
  const acf = new Float32Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    const upper = n - lag
    for (let i = 0; i < upper; i++) s += x[i] * x[i + lag]
    acf[lag] = s / r0
  }

  // Final score: comb (acf at lag, 2·lag, 3·lag, 4·lag) × Rayleigh tempo prior.
  // Comb rewards true beat structure. Prior breaks octave ambiguity in favor
  // of perceptually-natural tempos around 120 BPM (sigma 45 BPM).
  const score = new Float32Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = 60 / (lag * hopSec)

    let comb = acf[lag]
    let totalW = 1
    for (let m = 2; m <= 4; m++) {
      const ml = m * lag
      if (ml > maxLag) break
      const w = 1 / m
      comb += acf[ml] * w
      totalW += w
    }
    comb /= totalW

    const prior = Math.exp(-((bpm - 120) ** 2) / (2 * 45 * 45))
    score[lag] = Math.max(0, comb) * (0.35 + 0.65 * prior)
  }

  // Pick best integer lag
  let bestLag = minLag
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    if (score[lag] > score[bestLag]) bestLag = lag
  }

  // Parabolic interpolation around the peak → sub-frame BPM precision
  let refined = bestLag
  if (bestLag > minLag && bestLag < maxLag) {
    const y1 = score[bestLag - 1]
    const y2 = score[bestLag]
    const y3 = score[bestLag + 1]
    const denom = y1 - 2 * y2 + y3
    if (Math.abs(denom) > 1e-9) {
      const off = (y1 - y3) / (2 * denom)
      if (Math.abs(off) < 1) refined = bestLag + off
    }
  }

  const bpm = Math.round(60 / (refined * hopSec))
  const confidence = Math.round(Math.max(0, Math.min(100, score[bestLag] * 110)))
  return { bpm, confidence }
}

// ─── Key estimation ─────────────────────────────────────────────────────────
function estimateKey (chroma) {
  let best = -Infinity
  let second = -Infinity
  let root = 0
  let mode = 'mayor'
  const rot = new Array(12)

  for (let r = 0; r < 12; r++) {
    for (let i = 0; i < 12; i++) rot[i] = chroma[(i + r) % 12]
    const maj = pearson(rot, PROFILE_MAJOR)
    const min = pearson(rot, PROFILE_MINOR)

    if (maj > best) { second = best; best = maj; root = r; mode = 'mayor' }
    else if (maj > second) second = maj

    if (min > best) { second = best; best = min; root = r; mode = 'menor' }
    else if (min > second) second = min
  }

  // Confidence = correlation strength + margin over runner-up
  const baseConf = ((best + 1) / 2) * 80
  const marginBoost = Math.max(0, best - second) * 120
  const confidence = Math.round(Math.min(100, Math.max(0, baseConf + marginBoost)))

  return { note: NOTES[root], mode, confidence }
}

// ─── Public API ─────────────────────────────────────────────────────────────
export async function analyzeAudio (arrayBuffer) {
  const ctx = new AudioContext()
  const buffer = await ctx.decodeAudioData(arrayBuffer)
  ctx.close()

  // Mix to mono
  const nc = buffer.numberOfChannels
  const len = buffer.length
  const srOriginal = buffer.sampleRate
  const monoOrig = new Float32Array(len)
  for (let c = 0; c < nc; c++) {
    const ch = buffer.getChannelData(c)
    for (let i = 0; i < len; i++) monoOrig[i] += ch[i] / nc
  }

  // Resample → 11.025 kHz (Nyquist 5.5 kHz covers all relevant musical content)
  const TARGET_SR = 11025
  const mono = downsample(monoOrig, srOriginal, TARGET_SR)

  // Pick analysis window: middle of the track, up to 90 s
  const totalDur = buffer.duration
  let startSec, endSec
  if (totalDur > 90) {
    startSec = Math.max(5, totalDur * 0.15)
    endSec = Math.min(startSec + 90, totalDur * 0.85)
  } else if (totalDur > 30) {
    startSec = Math.min(2, totalDur * 0.1)
    endSec = totalDur - Math.min(2, totalDur * 0.05)
  } else {
    startSec = 0
    endSec = totalDur
  }
  const startIdx = Math.floor(startSec * TARGET_SR)
  const endIdx = Math.min(mono.length, Math.floor(endSec * TARGET_SR))
  const segment = mono.subarray(startIdx, endIdx)

  // STFT — 2048-point FFT, 256-sample hop (87.5% overlap, ~23 ms time resolution)
  const FFT_SIZE = 2048
  const HOP = 256
  const hopSec = HOP / TARGET_SR
  const { onset, chroma } = analyzeSTFT(segment, TARGET_SR, FFT_SIZE, HOP)

  const tempo = estimateTempo(onset, hopSec)
  const key = estimateKey(chroma)

  return {
    bpm:           tempo.bpm,
    bpmConfidence: tempo.confidence,
    key:           key.note,
    mode:          key.mode,
    keyConfidence: key.confidence,
    duration:      buffer.duration,
  }
}
