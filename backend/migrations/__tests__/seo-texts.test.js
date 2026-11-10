const { normalizeTags } = require('../seo-texts');
const DATA = require('../data/seo-texts.json');

describe('normalizeTags', () => {
    it('une los trozos de un JSON partido por comas', () => {
        expect(normalizeTags(['["jerk"', '"reggaeton"', '"latin"]'])).toEqual(['jerk', 'reggaeton', 'latin']);
    });

    it('quita las comillas escapadas, repetidos y mayúsculas', () => {
        expect(normalizeTags(['["[\\"jerk\\""', '"\\"hoodtrap\\"]"]', 'Jerk', ' trap '])).toEqual(['jerk', 'hoodtrap', 'trap']);
    });

    it('deja igual una lista ya limpia', () => {
        expect(normalizeTags(['trap', 'dark'])).toEqual(['trap', 'dark']);
    });

    it('acepta un string suelto y valores vacíos', () => {
        expect(normalizeTags('["trap","jerk"]')).toEqual(['trap', 'jerk']);
        expect(normalizeTags([])).toEqual([]);
        expect(normalizeTags([null, ''])).toEqual([]);
    });
});

describe('data/seo-texts.json', () => {
    const isId = (id) => /^[0-9a-f]{24}$/.test(id);

    it('cada artista tiene id válido y una biografía dentro del límite del modelo', () => {
        for (const a of DATA.artists) {
            expect(isId(a.id)).toBe(true);
            expect(a.bio.length).toBeGreaterThan(80);
            expect(a.bio.length).toBeLessThanOrEqual(5000);
        }
    });

    it('cada beat tiene id válido y una descripción única dentro del límite', () => {
        const seen = new Set();
        for (const b of DATA.beats) {
            expect(isId(b.id)).toBe(true);
            expect(b.description.length).toBeGreaterThan(80);
            expect(b.description.length).toBeLessThanOrEqual(2000);
            expect(seen.has(b.description)).toBe(false);
            seen.add(b.description);
        }
    });
});
