/**
 * Slugs para las URLs públicas (/artistas/lilbru, /beats/come-back-reggaeton-93-bpm…).
 *
 * El slug se genera una sola vez y no cambia aunque se edite el nombre: así
 * una URL que Google ya conoce no se rompe. Las URLs antiguas con ObjectId
 * siguen funcionando y el frontend las redirige (301 para los bots).
 */
const MAX_LENGTH = 80;

/** ¿Es un ObjectId de verdad (24 hex)? isValid() también acepta cualquier texto de 12 caracteres. */
function isObjectId(value) {
    return /^[a-f0-9]{24}$/i.test(String(value));
}

/** «Sexología (feat. Pinkdolly)» → «sexologia-feat-pinkdolly». */
function slugify(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/ø/g, 'o')
        .replace(/æ/g, 'ae')
        .replace(/ß/g, 'ss')
        .replace(/&/g, ' y ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, MAX_LENGTH)
        .replace(/-+$/g, '');
}

/** Primer elemento de una lista separada por comas («Hoodtrap, Reggaeton» → «Hoodtrap»). */
function firstOf(list) {
    return String(list || '').split(',')[0].trim();
}

/** Texto base del slug de cada colección. */
const SOURCES = {
    Artist: (doc) => doc.name,
    // Hay varios eventos llamados igual («OTP!»): lugar y año los distinguen.
    Event: (doc) => [doc.name, firstOf(doc.location), doc.date ? new Date(doc.date).getFullYear() : ''].join(' '),
    Beat: (doc) => [doc.title, firstOf(doc.genre), doc.bpm ? `${doc.bpm} bpm` : ''].join(' '),
    Release: (doc) => [doc.title, firstOf(doc.subtitle)].join(' '),
    Post: (doc) => doc.title
};

/**
 * Slugs que no se pueden usar porque chocan con rutas fijas. En /beats viven
 * las categorías (/beats/trap); en /herramientas, las herramientas.
 */
const RESERVED = {
    Beat: ['trap', 'hoodtrap', 'reggaeton', 'jerk', 'drill', 'rap', 'boom-bap', 'rnb', 'afro', 'dancehall', 'genero', 'categoria'],
    Artist: [],
    Event: [],
    Release: [],
    Post: ['rss', 'rss-xml', 'categoria']
};

/**
 * Devuelve un slug libre en la colección: si «otp-club-p62-2026» ya existe,
 * prueba «otp-club-p62-2026-2», «-3»…
 */
async function uniqueSlug(Model, base, excludeId) {
    const root = base || 'item';
    const reserved = RESERVED[Model.modelName] || [];
    for (let n = 1; n < 1000; n++) {
        const candidate = n === 1 ? root : `${root}-${n}`;
        if (reserved.includes(candidate) || isObjectId(candidate)) continue;
        const clash = await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
        if (!clash) return candidate;
    }
    return `${root}-${Date.now()}`;
}

/** Slug nuevo para un documento según su colección. */
async function slugFor(Model, doc) {
    const source = SOURCES[Model.modelName];
    return uniqueSlug(Model, slugify(source ? source(doc) : doc.name || doc.title), doc._id);
}

/** Busca por ObjectId o, si no lo es, por slug. */
function findByIdOrSlug(Model, param) {
    if (isObjectId(param)) {
        return Model.findById(param);
    }
    return Model.findOne({ slug: String(param).toLowerCase() });
}

/**
 * Si el documento aún no tiene slug (datos anteriores a los slugs), se lo
 * pone y lo guarda. Es idempotente: si dos peticiones compiten, la segunda
 * choca con el índice único y se ignora.
 */
async function ensureSlug(Model, doc) {
    if (!doc || doc.slug) return doc;
    try {
        const slug = await slugFor(Model, doc);
        await Model.updateOne({ _id: doc._id, slug: { $in: [null, ''] } }, { $set: { slug } });
        doc.slug = slug;
    } catch (err) {
        console.error(`[slug] No se pudo asignar slug a ${Model.modelName} ${doc._id}: ${err.message}`);
    }
    return doc;
}

module.exports = { isObjectId, slugify, uniqueSlug, slugFor, findByIdOrSlug, ensureSlug, RESERVED };
