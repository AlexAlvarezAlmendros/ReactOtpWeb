import { analyzeAudioData, ENGINE_SAMPLE_RATE } from '../utils/audioEngine.js'

const SR = ENGINE_SAMPLE_RATE

// Minimal deterministic synth: kick + bass on every beat, cadential minor
// chord pads (i–iv–V–i) — enough signal for both engines in a short clip.
function synthTrack (bpm, rootPc, durSec) {
  const n = Math.floor(durSec * SR)
  const buf = new Float32Array(n)
  const beat = 60 / bpm
  const bar = beat * 4
  const rootMidi = 48 + rootPc
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12)
  const prog = [[0, [0, 3, 7]], [5, [0, 3, 7]], [7, [0, 4, 7]], [0, [0, 3, 7]]]

  const nBars = Math.floor(durSec / bar)
  for (let b = 0; b < nBars; b++) {
    const t0 = b * bar
    const [deg, triad] = prog[b % 4]
    const chordRoot = rootMidi + deg

    for (const iv of triad) {
      const f = hz(chordRoot + iv)
      const n0 = Math.floor(t0 * SR)
      const len = Math.floor(bar * SR)
      for (let i = 0; i < len && n0 + i < n; i++) {
        const t = i / SR
        const env = Math.min(1, t / 0.02) * (i < len - 500 ? 1 : (len - i) / 500)
        buf[n0 + i] += 0.12 * env * (
          Math.sin(2 * Math.PI * f * t) +
          0.5 * Math.sin(4 * Math.PI * f * t) +
          0.25 * Math.sin(6 * Math.PI * f * t)
        )
      }
    }

    for (let q = 0; q < 4; q++) {
      const tb = t0 + q * beat
      const n0 = Math.floor(tb * SR)
      // Kick: 100→45 Hz sweep
      const kLen = Math.floor(0.3 * SR)
      for (let i = 0; i < kLen && n0 + i < n; i++) {
        const t = i / SR
        const phase = 2 * Math.PI * (45 * t + 100 * 0.04 * (1 - Math.exp(-t / 0.04)))
        buf[n0 + i] += Math.sin(phase) * Math.exp(-t / 0.12)
      }
      // Bass pluck on the chord root
      const bLen = Math.floor(0.5 * beat * SR)
      const bf = hz(chordRoot - 24)
      for (let i = 0; i < bLen && n0 + i < n; i++) {
        const t = i / SR
        buf[n0 + i] += 0.8 * Math.exp(-t / 0.15) * Math.sin(2 * Math.PI * bf * t)
      }
    }
  }
  return buf
}

describe('audioEngine (end-to-end on synthetic ground truth)', () => {
  it('detects 120 BPM / A minor on a clean synthetic loop', () => {
    const pcm = synthTrack(120, 9, 25)
    const r = analyzeAudioData(pcm, SR, { duration: 25 })
    expect(Math.abs(r.bpm - 120)).toBeLessThanOrEqual(0.6)
    expect(r.key).toBe('A')
    expect(r.mode).toBe('minor')
    expect(r.camelot).toBe('8A')
    expect(r.bpmConfidence).toBeGreaterThanOrEqual(60)
    expect(r.keyConfidence).toBeGreaterThanOrEqual(55)
  })

  it('rejects silent audio with a typed error', () => {
    expect(() => analyzeAudioData(new Float32Array(SR * 10), SR, {}))
      .toThrow('AUDIO_SILENT')
  })

  it('rejects too-short audio with a typed error', () => {
    expect(() => analyzeAudioData(new Float32Array(SR * 2).fill(0.1), SR, {}))
      .toThrow('AUDIO_TOO_SHORT')
  })
})
