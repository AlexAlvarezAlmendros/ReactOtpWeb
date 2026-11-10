/**
 * Carga los textos SEO de migrations/data/seo-texts.json: biografía, ciudad
 * y año de inicio de los artistas, y descripción de los beats. Limpia de paso
 * las etiquetas de beat guardadas como trozos de JSON (["jerk", "latin"]…).
 *
 *   npm run migrate:textos -- --dry   # solo muestra qué haría
 *   npm run migrate:textos            # aplica los cambios
 *
 * Ejecutar después de migrate:slugs (los avisos de IndexNow usan el slug).
 *
 * Nunca pisa un texto que ya exista: si alguien ha escrito ya la biografía o
 * la descripción desde el panel, se queda la suya. Se puede repetir sin
 * riesgo. Al terminar avisa a IndexNow de las fichas cambiadas, en un solo
 * envío (updateOne no dispara los hooks del modelo).
 */
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Artist = require('../models/Artist');
const Beat = require('../models/Beat');
const { submit, urlsFor } = require('../services/indexNowService');

const DATA = require(path.join(__dirname, 'data', 'seo-texts.json'));
const dryRun = process.argv.includes('--dry');

const isEmpty = (value) => value == null || (typeof value === 'string' && value.trim() === '');

/** Une los trozos de JSON y deja una lista limpia, en minúsculas y sin repetir. */
function normalizeTags(tags) {
    const raw = (Array.isArray(tags) ? tags : [tags]).filter((t) => t != null).join(',');
    const out = [];
    for (const piece of raw.replace(/[[\]"\\]/g, '').split(',')) {
        const tag = piece.trim().toLowerCase();
        if (tag && !out.includes(tag)) out.push(tag);
    }
    return out;
}

const sameList = (a = [], b = []) => a.length === b.length && a.every((x, i) => x === b[i]);

async function applyAll(Model, entries, fieldsFor) {
    const changed = [];
    for (const entry of entries) {
        const doc = await Model.findById(entry.id);
        if (!doc) {
            console.log(`  ✗ ${entry.name || entry.title}: no existe (${entry.id})`);
            continue;
        }
        const set = fieldsFor(doc, entry);
        const keys = Object.keys(set);
        if (!keys.length) continue;
        console.log(`  ${doc.name || doc.title}: ${keys.join(', ')}`);
        if (!dryRun) {
            await Model.updateOne({ _id: doc._id }, { $set: set });
            changed.push(Object.assign(doc, set));
        }
    }
    return changed;
}

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    console.log(`\nArtistas (${DATA.artists.length} en el archivo):`);
    const artists = await applyAll(Artist, DATA.artists, (doc, entry) => {
        const set = {};
        if (isEmpty(doc.bio) && entry.bio) set.bio = entry.bio;
        if (isEmpty(doc.city) && entry.city) set.city = entry.city;
        if (doc.activeSince == null && entry.activeSince) set.activeSince = entry.activeSince;
        // Texto de relleno que se quedó en la página de enlaces (/links/aina3).
        if (/^lorem ipsum/i.test(doc.linksBio || '')) set.linksBio = '';
        return set;
    });

    console.log(`\nBeats (${DATA.beats.length} en el archivo):`);
    const beats = await applyAll(Beat, DATA.beats, (doc, entry) => {
        const set = {};
        if (isEmpty(doc.description) && entry.description) set.description = entry.description;
        const tags = normalizeTags(doc.tags);
        if (!sameList(tags, doc.tags)) set.tags = tags;
        return set;
    });

    if (!dryRun) {
        const urls = [
            ...artists.flatMap((doc) => urlsFor('Artist', doc)),
            ...beats.flatMap((doc) => urlsFor('Beat', doc))
        ];
        if (urls.length) {
            const sent = await submit(urls);
            console.log(`\nIndexNow: ${sent ? 'avisado' : 'no se ha podido avisar'} (${new Set(urls).size} URLs)`);
        }
    }

    await mongoose.connection.close();
    console.log(dryRun ? '\n(simulación: no se ha guardado nada)' : `\nListo: ${artists.length} artistas y ${beats.length} beats actualizados.`);
}

if (require.main === module) {
    main().catch(async (err) => {
        console.error(err);
        await mongoose.connection.close();
        process.exit(1);
    });
}

module.exports = { normalizeTags };
