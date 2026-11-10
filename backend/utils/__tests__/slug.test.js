const { slugify, isObjectId, uniqueSlug, slugFor } = require('../slug');
const { urlsFor, touchesPublicFields } = require('../../services/indexNowService');

/** Modelo falso: solo lo que usan uniqueSlug/slugFor. */
function fakeModel(modelName, taken = []) {
    return { modelName, exists: jest.fn(async ({ slug }) => taken.includes(slug)) };
}

describe('slugify', () => {
    test('quita acentos, símbolos y mayúsculas', () => {
        expect(slugify('Sexología (feat. Pinkdolly)')).toBe('sexologia-feat-pinkdolly');
        expect(slugify('Øskar')).toBe('oskar');
        expect(slugify('Aina<3')).toBe('aina-3');
        expect(slugify('  OTP!  ')).toBe('otp');
        expect(slugify('Brunuss & Rizzo')).toBe('brunuss-y-rizzo');
    });

    test('corta a 80 caracteres sin guion final', () => {
        const slug = slugify('palabra '.repeat(30));
        expect(slug.length).toBeLessThanOrEqual(80);
        expect(slug.endsWith('-')).toBe(false);
    });
});

describe('isObjectId', () => {
    test('solo 24 hex', () => {
        expect(isObjectId('687cfc1601b314edbe1f15ba')).toBe(true);
        // isValid() de Mongoose da true con cualquier texto de 12 caracteres.
        expect(isObjectId('otp-p62-2026')).toBe(false);
        expect(isObjectId('lilbru')).toBe(false);
    });
});

describe('uniqueSlug / slugFor', () => {
    test('añade sufijo si ya existe', async () => {
        const Model = fakeModel('Event', ['otp-club-p62-2026'])
        await expect(uniqueSlug(Model, 'otp-club-p62-2026')).resolves.toBe('otp-club-p62-2026-2');
    });

    test('evita los slugs reservados de /beats', async () => {
        await expect(uniqueSlug(fakeModel('Beat'), 'trap')).resolves.toBe('trap-2');
    });

    test('fuentes por colección', async () => {
        await expect(slugFor(fakeModel('Beat'), { title: 'Come Back', genre: 'Reggaeton, Jerk', bpm: 93 }))
            .resolves.toBe('come-back-reggaeton-93-bpm');
        await expect(slugFor(fakeModel('Event'), { name: 'OTP!', location: 'Club P62, Barcelona', date: '2026-07-17' }))
            .resolves.toBe('otp-club-p62-2026');
        await expect(slugFor(fakeModel('Release'), { title: 'Sexología', subtitle: 'LilBru, pinkdolly' }))
            .resolves.toBe('sexologia-lilbru');
        await expect(slugFor(fakeModel('Artist'), { name: 'LilBru' })).resolves.toBe('lilbru');
    });
});

describe('IndexNow', () => {
    test('URLs con slug y listado', () => {
        expect(urlsFor('Artist', { slug: 'lilbru' }))
            .toEqual(['https://www.otherpeople.es/artistas/lilbru', 'https://www.otherpeople.es/artistas']);
    });

    test('beat sin descripción: solo el listado', () => {
        expect(urlsFor('Beat', { slug: 'x', active: true })).toEqual(['https://www.otherpeople.es/beats']);
    });

    test('vender entradas no cuenta como cambio público', () => {
        expect(touchesPublicFields({ $inc: { availableTickets: -1, ticketsSold: 1 } })).toBe(false);
        expect(touchesPublicFields({ name: 'Nuevo' })).toBe(true);
        expect(touchesPublicFields({ $set: { description: 'x' } })).toBe(true);
    });
});
