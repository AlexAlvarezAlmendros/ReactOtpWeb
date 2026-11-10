/**
 * Pone slug a los artistas, eventos, beats y lanzamientos que aún no lo
 * tienen (los creados antes de la Fase 3 del plan SEO).
 *
 *   npm run migrate:slugs            # aplica los cambios
 *   npm run migrate:slugs -- --dry   # solo muestra qué haría
 *
 * Es idempotente: no toca los documentos que ya tienen slug. Las fichas
 * también se rellenan solas la primera vez que alguien las abre, pero el
 * sitemap y los enlaces de los listados necesitan el slug desde el principio.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { slugFor } = require('../utils/slug');

const MODELS = ['Artist', 'Event', 'Beat', 'Release'].map((name) => require(`../models/${name}`));
const dryRun = process.argv.includes('--dry');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    for (const Model of MODELS) {
        // createIndexes y no syncIndexes: este borra los índices de la base que
        // no estén en el esquema. En la simulación solo se enseña la diferencia.
        if (dryRun) {
            const { toCreate, toDrop } = await Model.diffIndexes();
            console.log(`\n${Model.modelName}: índices por crear ${JSON.stringify(toCreate)}; fuera del esquema (no se tocan) ${JSON.stringify(toDrop)}`);
        } else {
            await Model.createIndexes();
        }
        const docs = await Model.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
        console.log(`\n${Model.modelName}: ${docs.length} sin slug`);
        for (const doc of docs) {
            const slug = await slugFor(Model, doc);
            console.log(`  ${doc._id} → ${slug}`);
            if (!dryRun) await Model.updateOne({ _id: doc._id }, { $set: { slug } });
        }
    }
    await mongoose.connection.close();
    console.log(dryRun ? '\n(simulación: no se ha guardado nada)' : '\nListo.');
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.connection.close();
    process.exit(1);
});
