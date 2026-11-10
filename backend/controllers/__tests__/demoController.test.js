jest.mock('../../utils/dbConnection', () => jest.fn().mockResolvedValue());
jest.mock('../../services/emailService', () => jest.fn().mockImplementation(() => ({ transporter: { sendMail: jest.fn().mockResolvedValue({}) } })));

const DemoSubmission = require('../../models/DemoSubmission');
const { createDemo } = require('../demoController');
const { adminEmail } = require('../../services/demoEmails');

function mockRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

const VALID = {
    artistName: 'Nuevo Talento',
    email: 'artista@correo.studio',
    city: 'Valencia',
    genres: 'trap, drill',
    links: ['https://open.spotify.com/track/x', 'no-es-un-enlace'],
    consent: true
};

describe('POST /api/demos', () => {
    beforeEach(() => {
        DemoSubmission.create = jest.fn(async (data) => ({ _id: 'd1', ...data, genres: data.genres, links: data.links }));
        DemoSubmission.updateOne = jest.fn().mockResolvedValue({});
    });

    test('guarda la maqueta, filtra enlaces y avisa por correo', async () => {
        const res = mockRes();
        await createDemo({ body: VALID, ip: '1.1.1.1' }, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const saved = DemoSubmission.create.mock.calls[0][0];
        expect(saved.links).toEqual(['https://open.spotify.com/track/x']);
        expect(saved.genres).toEqual(['trap', 'drill']);
        expect(DemoSubmission.updateOne).toHaveBeenCalledWith({ _id: 'd1' }, { emailStatus: 'sent' });
    });

    test('campo trampa relleno: responde OK pero no guarda', async () => {
        const res = mockRes();
        await createDemo({ body: { ...VALID, website: 'http://spam' } }, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(DemoSubmission.create).not.toHaveBeenCalled();
    });

    test('sin consentimiento: 400 de validación del modelo', () => {
        const doc = new DemoSubmission({ ...VALID, links: ['https://x.test'], genres: [], consent: false });
        const err = doc.validateSync();
        expect(err.errors.consent).toBeDefined();
    });

    test('sin enlaces: error de validación', () => {
        const doc = new DemoSubmission({ ...VALID, links: [], genres: [] });
        expect(doc.validateSync().errors.links).toBeDefined();
    });
});

describe('correo al equipo', () => {
    test('escapa el HTML del artista', () => {
        const { html, subject } = adminEmail({ ...VALID, artistName: '<b>x</b>', genres: [], links: ['https://x.test'], message: '<script>' });
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
        expect(subject).toContain('[MAQUETA]');
    });
});
