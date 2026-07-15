// Debug harness: prints per-candidate metrical-level metrics.
//   node scripts/debug-tempo.mjs
globalThis.__TEMPO_DEBUG = true

const { estimateTempo } = await import('../src/utils/tempoEngine.js')
const { SR, synthTrack } = await import('./synth-tracks.mjs')
const { MODE_MINOR, MODE_MAJOR } = await import('../src/utils/musicTheory.js')

const CASES = [
  { name: 'Techno 140', bpm: 140, keyPc: 9, mode: MODE_MINOR, pattern: 'fourFloor', seed: 22 },
  { name: 'Hip-hop 95', bpm: 95, keyPc: 7, mode: MODE_MINOR, pattern: 'hiphop', seed: 33 },
  { name: 'Halftime 87.5', bpm: 87.5, keyPc: 1, mode: MODE_MINOR, pattern: 'hiphop', seed: 44 },
  { name: 'Downtempo 70', bpm: 70, keyPc: 10, mode: MODE_MAJOR, pattern: 'hiphop', seed: 88 },
  { name: 'Dance 110', bpm: 110, keyPc: 3, mode: MODE_MAJOR, pattern: 'fourFloor', seed: 66 },
]

for (const c of CASES) {
  console.log(`\n=== ${c.name} (esperado ${c.bpm}) ===`)
  const pcm = synthTrack(c)
  const r = estimateTempo(pcm, SR)
  console.log(`  → bpm=${r.bpm.toFixed(2)} conf=${r.confidence} alt=${r.alt ? r.alt.toFixed(1) : '—'}`)
}
