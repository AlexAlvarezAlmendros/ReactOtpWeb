// ─────────────────────────────────────────────────────────────────────────────
// Audio Analysis — BPM (onset autocorrelation) + Key (chroma + KS profiles)
// Processes the first 30 s of audio on the main thread via Web Audio API.
// ─────────────────────────────────────────────────────────────────────────────

const NOTES     = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const KS_MAJOR  = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const KS_MINOR  = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

// ── Iterative Cooley-Tukey FFT (radix-2 DIT, in-place) ──────────────────────
function fftInPlace (re, im) {
  const n = re.length
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const angle = (-Math.PI * k) / half
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const tRe = cos * re[i + k + half] - sin * im[i + k + half]
        const tIm = sin * re[i + k + half] + cos * im[i + k + half]
        re[i + k + half] = re[i + k] - tRe
        im[i + k + half] = im[i + k] - tIm
        re[i + k]       += tRe
        im[i + k]       += tIm
      }
    }
  }
}

// ── Pearson correlation ──────────────────────────────────────────────────────
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

// ── Chromagram via windowed FFT ──────────────────────────────────────────────
function computeChroma (data, sampleRate) {
  const N    = 4096
  const hop  = N >> 1
  const cap  = Math.min(data.length, sampleRate * 30)
  const win  = new Float64Array(N)
  const re   = new Float64Array(N)
  const im   = new Float64Array(N)
  const chroma = new Float64Array(12)

  // Pre-compute Hann window
  for (let i = 0; i < N; i++) win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)))

  for (let off = 0; off + N <= cap; off += hop) {
    for (let i = 0; i < N; i++) { re[i] = data[off + i] * win[i]; im[i] = 0 }
    fftInPlace(re, im)
    for (let bin = 1; bin < N >> 1; bin++) {
      const freq = (bin * sampleRate) / N
      if (freq < 130 || freq > 4000) continue           // C3 – ~B7
      const midi = 12 * Math.log2(freq / 440) + 69
      const pc   = ((Math.round(midi) % 12) + 12) % 12
      chroma[pc] += re[bin] * re[bin] + im[bin] * im[bin]
    }
  }

  const max = Math.max(...chroma)
  if (max > 0) for (let i = 0; i < 12; i++) chroma[i] /= max
  return chroma
}

// ── Key detection (Krumhansl-Schmuckler) ─────────────────────────────────────
function estimateKey (chroma) {
  let best = -Infinity, root = 0, mode = 'mayor'
  for (let r = 0; r < 12; r++) {
    const rot = Array.from({ length: 12 }, (_, i) => chroma[(i + r) % 12])
    const maj = pearson(rot, KS_MAJOR)
    const min = pearson(rot, KS_MINOR)
    if (maj > best) { best = maj; root = r; mode = 'mayor' }
    if (min > best) { best = min; root = r; mode = 'menor' }
  }
  return { note: NOTES[root], mode, confidence: Math.round(Math.max(0, (best + 1) / 2 * 100)) }
}

// ── BPM detection (onset autocorrelation) ────────────────────────────────────
function estimateBPM (data, sampleRate) {
  const hop    = Math.floor(sampleRate * 0.01)  // 10 ms frames
  const cap    = Math.min(data.length, sampleRate * 30)
  const frames = Math.floor(cap / hop)

  const energy = new Float32Array(frames)
  for (let i = 0; i < frames; i++) {
    let e = 0; const off = i * hop
    for (let j = 0; j < hop; j++) e += data[off + j] ** 2
    energy[i] = Math.sqrt(e / hop)
  }

  // Onset strength: positive first derivative of energy envelope
  const onset = new Float32Array(frames)
  let e0 = 0
  for (let i = 1; i < frames; i++) {
    onset[i] = Math.max(0, energy[i] - energy[i - 1])
    e0 += onset[i] ** 2
  }

  // Autocorrelation search in 60–200 BPM range
  const pMin = Math.floor(sampleRate / (200 / 60) / hop)
  const pMax = Math.floor(sampleRate / (60  / 60) / hop)

  let bestCorr = -1, bestP = pMin
  for (let p = pMin; p <= pMax; p++) {
    let corr = 0
    for (let i = 0; i < frames - p; i++) corr += onset[i] * onset[i + p]
    if (corr > bestCorr) { bestCorr = corr; bestP = p }
  }

  let bpm = Math.round((60 * sampleRate) / (bestP * hop))
  if (bpm < 70)  bpm *= 2
  if (bpm > 180) bpm  = Math.round(bpm / 2)

  const confidence = e0 > 0 ? Math.round(Math.min(100, (bestCorr / e0) * 150)) : 0
  return { bpm, confidence }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function analyzeAudio (arrayBuffer) {
  const ctx    = new AudioContext()
  const buffer = await ctx.decodeAudioData(arrayBuffer)
  ctx.close()

  const nc   = buffer.numberOfChannels
  const len  = buffer.length
  const sr   = buffer.sampleRate
  const mono = new Float32Array(len)

  for (let c = 0; c < nc; c++) {
    const ch = buffer.getChannelData(c)
    for (let i = 0; i < len; i++) mono[i] += ch[i] / nc
  }

  const chroma = computeChroma(mono, sr)
  const key    = estimateKey(chroma)
  const tempo  = estimateBPM(mono, sr)

  return {
    bpm:           tempo.bpm,
    bpmConfidence: tempo.confidence,
    key:           key.note,
    mode:          key.mode,
    keyConfidence: key.confidence,
    duration:      buffer.duration,
  }
}
