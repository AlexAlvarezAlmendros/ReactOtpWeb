import {
  toCamelot,
  toOpenKey,
  snapBpm,
  relativeKey,
  keyRelationship,
  foldBpm,
  keyLabel,
  MODE_MAJOR,
  MODE_MINOR,
} from '../utils/musicTheory.js'

describe('musicTheory', () => {
  describe('toCamelot', () => {
    it('maps the canonical anchors of the Camelot wheel', () => {
      expect(toCamelot(9, MODE_MINOR)).toBe('8A')   // A minor
      expect(toCamelot(0, MODE_MAJOR)).toBe('8B')   // C major
      expect(toCamelot(8, MODE_MINOR)).toBe('1A')   // Ab minor
      expect(toCamelot(11, MODE_MAJOR)).toBe('1B')  // B major
      expect(toCamelot(4, MODE_MAJOR)).toBe('12B')  // E major
      expect(toCamelot(1, MODE_MINOR)).toBe('12A')  // Db minor
      expect(toCamelot(7, MODE_MAJOR)).toBe('9B')   // G major (fifth up = +1)
    })

    it('relative keys share the same wheel number', () => {
      for (let pc = 0; pc < 12; pc++) {
        const rel = relativeKey(pc, MODE_MAJOR)
        const major = toCamelot(pc, MODE_MAJOR)
        const minor = toCamelot(rel.pitchClass, rel.mode)
        expect(parseInt(minor, 10)).toBe(parseInt(major, 10))
      }
    })
  })

  it('toOpenKey matches the Traktor convention', () => {
    expect(toOpenKey(0, MODE_MAJOR)).toBe('1d') // C major
    expect(toOpenKey(9, MODE_MINOR)).toBe('1m') // A minor
  })

  describe('snapBpm', () => {
    it('snaps near-integers', () => {
      expect(snapBpm(127.98)).toEqual({ value: 128, display: '128' })
      expect(snapBpm(140.2)).toEqual({ value: 140, display: '140' })
    })
    it('keeps musically-real half BPMs', () => {
      expect(snapBpm(87.46)).toEqual({ value: 87.5, display: '87.5' })
    })
    it('keeps one decimal for odd tempos', () => {
      expect(snapBpm(93.27)).toEqual({ value: 93.3, display: '93.3' })
    })
    it('handles invalid input', () => {
      expect(snapBpm(0).display).toBe('—')
      expect(snapBpm(NaN).display).toBe('—')
    })
  })

  it('relativeKey is a proper involution', () => {
    expect(relativeKey(0, MODE_MAJOR)).toEqual({ pitchClass: 9, mode: MODE_MINOR })
    expect(relativeKey(9, MODE_MINOR)).toEqual({ pitchClass: 0, mode: MODE_MAJOR })
    for (let pc = 0; pc < 12; pc++) {
      const back = relativeKey(relativeKey(pc, MODE_MINOR).pitchClass, MODE_MAJOR)
      expect(back).toEqual({ pitchClass: pc, mode: MODE_MINOR })
    }
  })

  it('keyRelationship names the classic confusions', () => {
    const am = { pitchClass: 9, mode: MODE_MINOR }
    const c = { pitchClass: 0, mode: MODE_MAJOR }
    const g = { pitchClass: 7, mode: MODE_MAJOR }
    const cm = { pitchClass: 0, mode: MODE_MINOR }
    expect(keyRelationship(am, c)).toBe('relative')
    expect(keyRelationship(c, g)).toBe('fifth')
    expect(keyRelationship(c, cm)).toBe('parallel')
    expect(keyRelationship(c, c)).toBe('same')
  })

  it('foldBpm folds by octaves into range', () => {
    expect(foldBpm(64)).toBe(128)
    expect(foldBpm(200)).toBe(100)
    expect(foldBpm(120)).toBe(120)
  })

  it('keyLabel uses conventional spellings', () => {
    expect(keyLabel(1, MODE_MINOR).note).toBe('Db')
    expect(keyLabel(6, MODE_MAJOR).note).toBe('F#')
  })
})
