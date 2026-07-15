// Web Worker host for the audio analysis engine: keeps the heavy DSP off the
// main thread and streams progress back to the UI.
import { analyzeAudioData } from '../utils/audioEngine.js'

self.onmessage = (e) => {
  const { id, pcm, sampleRate, duration } = e.data
  try {
    const result = analyzeAudioData(pcm, sampleRate, {
      duration,
      onProgress: ({ stage, pct }) => self.postMessage({ id, type: 'progress', stage, pct }),
    })
    self.postMessage({ id, type: 'result', result })
  } catch (err) {
    self.postMessage({ id, type: 'error', message: err && err.message ? err.message : String(err) })
  }
}
