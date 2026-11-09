/**
 * IndexNow: avisa a Bing, Yandex y compañía (Bing alimenta a varios
 * buscadores con IA) en cuanto se crea, edita o borra una ficha pública, en
 * vez de esperar a que la vuelvan a rastrear. Google no usa IndexNow.
 *
 * La clave es pública por diseño: el buscador la comprueba en
 * https://www.otherpeople.es/<clave>.txt (frontend/public). Para cambiarla,
 * crea el nuevo .txt y define INDEXNOW_KEY en el backend.
 *
 * Desactivado en tests y con INDEXNOW_DISABLED=true.
 */
const SITE_URL = 'https://www.otherpeople.es';
const HOST = 'www.otherpeople.es';
const KEY = process.env.INDEXNOW_KEY || 'd48e5d37f374c357498fb3325989885b';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const TIMEOUT_MS = 4000;

/** URL pública de cada ficha (con slug si lo tiene). */
const PATHS = {
    Artist: (doc) => `/artistas/${doc.slug || doc._id}`,
    Event: (doc) => `/eventos/${doc.slug || doc._id}`,
    // Los beats sin descripción van con noindex: no tiene sentido avisar.
    Beat: (doc) => (doc.description && doc.active !== false ? `/beats/${doc.slug || doc._id}` : null),
    Release: (doc) => `/discografia/${doc.slug || doc._id}`,
    Post: (doc) => (doc.status === 'published' ? `/revista/${doc.slug}` : null)
};

/** Listados que cambian cuando cambia una ficha. */
const LISTS = {
    Artist: '/artistas',
    Event: '/eventos',
    Beat: '/beats',
    Release: '/discografia',
    Post: '/revista'
};

function isEnabled() {
    return process.env.NODE_ENV !== 'test' && process.env.INDEXNOW_DISABLED !== 'true' && typeof fetch === 'function';
}

/** Envía una lista de URLs. Nunca lanza: un fallo aquí no debe romper el guardado. */
async function submit(urls) {
    const urlList = [...new Set(urls.filter(Boolean))];
    if (!urlList.length || !isEnabled()) return false;
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (!res.ok && res.status !== 202) console.error(`[indexnow] HTTP ${res.status}`);
        return res.ok;
    } catch (err) {
        console.error(`[indexnow] ${err.message}`);
        return false;
    }
}

/** URLs afectadas por un cambio en un documento de `modelName`. */
function urlsFor(modelName, doc) {
    const path = PATHS[modelName]?.(doc);
    return [path && SITE_URL + path, LISTS[modelName] && SITE_URL + LISTS[modelName]].filter(Boolean);
}

/**
 * Plugin de Mongoose: avisa tras crear, editar o borrar. Se espera a la
 * respuesta (con tope de 4 s) porque en Vercel la función se congela al
 * responder y un aviso en segundo plano se perdería.
 */
/** Campos internos: si una edición solo toca estos, la página pública no cambia. */
const INTERNAL_FIELDS = new Set(['availableTickets', 'ticketsSold', 'slug', 'updatedAt', 'spotifySyncedAt', 'spotifySyncError'])

/** ¿La actualización cambia algo visible? (p. ej. vender una entrada, no). */
function touchesPublicFields(update) {
    if (!update) return true;
    const fields = [];
    for (const [key, value] of Object.entries(update)) {
        if (key === '$inc') continue; // contadores
        if (key.startsWith('$') && value && typeof value === 'object') fields.push(...Object.keys(value));
        else fields.push(key);
    }
    return fields.some((field) => !INTERNAL_FIELDS.has(field));
}

function indexNowPlugin(schema) {
    const notify = async (doc) => {
        const modelName = doc?.constructor?.modelName;
        if (modelName) await submit(urlsFor(modelName, doc));
    };
    schema.post('save', async function (doc) { await notify(doc); });
    schema.post('findOneAndUpdate', async function (doc) {
        if (touchesPublicFields(this.getUpdate())) await notify(doc);
    });
    schema.post('findOneAndDelete', async function (doc) { await notify(doc); });
}

module.exports = { submit, urlsFor, touchesPublicFields, indexNowPlugin, KEY };
