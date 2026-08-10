/**
 * Carga inicial de la discografía desde Spotify.
 *
 * El cron diario (/api/cron/sync-discography) trabaja por lotes con un
 * presupuesto de ~8s para no exceder el límite de las funciones serverless de
 * Vercel. Este script hace lo mismo sin límite de tiempo, pensado para la
 * primera importación de todo el catálogo o para forzar un resync completo.
 *
 * Uso:
 *   npm run sync:discography            # importa de verdad
 *   npm run sync:discography -- --dry   # solo informa, no escribe en BD
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { syncAllDiscographies } = require('../services/discographySyncService');

async function backfill() {
  const dryRun = process.argv.includes('--dry');

  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    if (dryRun) {
      console.log('🧪 Modo dry-run: no se escribirá nada en la base de datos');
    }

    const result = await syncAllDiscographies({
      maxArtists: 1000,
      timeBudgetMs: Number.MAX_SAFE_INTEGER,
      dryRun
    });

    console.log('\n📊 Resumen:');
    console.log(`   Artistas procesados: ${result.artistsProcessed}/${result.artistsInBatch}`);
    console.log(`   Releases creados:    ${result.totals.created}`);
    console.log(`   Releases actualizados: ${result.totals.updated}`);
    console.log(`   Releases enlazados:  ${result.totals.linked}`);
    console.log(`   Álbumes omitidos:    ${result.totals.skipped}`);

    if (result.rateLimited) {
      console.warn('\n⚠️  Se alcanzó el rate limit de Spotify: vuelve a ejecutar el script en unos minutos para terminar.');
    }

    const failed = result.results.filter(r => r.error);
    if (failed.length > 0) {
      console.warn(`\n⚠️  ${failed.length} artista(s) con errores:`);
      failed.forEach(r => console.warn(`   - ${r.artistName}: ${r.error}`));
    }

    const withoutId = result.results.filter(r => r.skippedReason === 'NO_SPOTIFY_ARTIST_ID');
    if (withoutId.length > 0) {
      console.warn(`\nℹ️  ${withoutId.length} artista(s) sin URL de artista de Spotify válida:`);
      withoutId.forEach(r => console.warn(`   - ${r.artistName}`));
    }

    await mongoose.connection.close();
    console.log('\n✅ Listo');
  } catch (error) {
    console.error('❌ Error en el backfill:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

backfill();
