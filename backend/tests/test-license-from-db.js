/**
 * Test de generación de licencia con un beat REAL de la base de datos
 * 
 * Busca un beat existente con licencias configuradas y genera una licencia
 * usando datos de comprador hardcoded. No crea beats de prueba.
 * 
 * Ejecutar: node tests/test-license-from-db.js
 * 
 * Opciones:
 *   --tier Basic|Premium|Unlimited   (default: Premium)
 *   --keep                           No borrar datos de prueba al final
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const licenseService = require('../services/licenseService');
const Beat = require('../models/Beat');
const Artist = require('../models/Artist');
const Purchase = require('../models/Purchase');
const IssuedLicense = require('../models/IssuedLicense');

// ── CLI args ────────────────────────────────────────────────
const args = process.argv.slice(2);
const tierArg = args.find((_, i) => args[i - 1] === '--tier') || 'Premium';
const keepData = args.includes('--keep');

// ── Datos hardcoded del comprador ───────────────────────────
const BUYER = {
    legalName: 'Carlos Test Martínez',
    email: 'carlos.test@example.com',
    address: 'Calle Falsa 123, Madrid, España'
};

async function run() {
    let purchase = null;
    let issuedLicense = null;

    try {
        console.log('🧪 ═══════════════════════════════════════════════════════');
        console.log('🧪 TEST: LICENCIA CON BEAT REAL DE LA BASE DE DATOS');
        console.log('🧪 ═══════════════════════════════════════════════════════\n');

        // 1. Conectar a MongoDB
        console.log('📦 [1/6] Conectando a MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI no configurada en .env');
        await mongoose.connect(mongoUri);
        console.log('✅ Conexión exitosa\n');

        // 2. Buscar un beat real que tenga licencias configuradas
        console.log('🎵 [2/6] Buscando beat con licencias en la BD...');
        const beat = await Beat.findOne({
            'licenses.0': { $exists: true },
            active: true
        }).populate('producer');

        if (!beat) {
            throw new Error('No se encontró ningún beat activo con licencias en la base de datos');
        }

        console.log('✅ Beat encontrado:', beat._id);
        console.log('   Título:', beat.title);
        console.log('   BPM:', beat.bpm || 'N/A');
        console.log('   Key:', beat.key || 'N/A');
        console.log('   Género:', beat.genre || 'N/A');
        console.log('   Licencias disponibles:', beat.licenses.length);
        beat.licenses.forEach((lic, i) => {
            console.log(`     [${i}] ${lic.name} — ${lic.price}€ (${lic.formats?.join(', ') || 'sin formatos'})`);
        });

        // Determinar la licencia del beat que coincida con el tier solicitado
        let beatLicense = beat.licenses.find(l =>
            l.name.toLowerCase().includes(tierArg.toLowerCase())
        );
        if (!beatLicense) {
            console.log(`⚠️  No se encontró licencia "${tierArg}" en el beat, usando la primera disponible`);
            beatLicense = beat.licenses[0];
        }
        console.log(`   Usando licencia: ${beatLicense.name} (${beatLicense.price}€)`);

        // Resolver productores
        const producers = [];
        if (beat.producer) {
            const artist = beat.producer.name ? beat.producer : await Artist.findById(beat.producer);
            if (artist) producers.push({ name: artist.name });
        }
        if (beat.colaboradores?.length) {
            beat.colaboradores.forEach(c => producers.push({ name: c }));
        }
        if (producers.length === 0) {
            producers.push({ name: 'OTP Records' });
        }
        console.log('   Productores:', producers.map(p => p.name).join(', '));
        console.log('');

        // 3. Crear purchase temporal (requerido por IssuedLicense.orderId)
        console.log('💳 [3/6] Creando purchase temporal de prueba...');
        const stripeSessionId = `cs_test_license_${Date.now()}`;
        purchase = await Purchase.create({
            beatId: beat._id,
            licenseId: beatLicense.id,
            customerEmail: BUYER.email,
            customerName: BUYER.legalName,
            amount: beatLicense.price,
            stripeSessionId,
            status: 'completed',
            purchasedAt: new Date()
        });
        console.log('✅ Purchase temporal:', purchase._id, '\n');

        // 4. Emitir licencia
        console.log('📝 [4/6] Emitiendo licencia (' + tierArg + ')...');
        issuedLicense = await licenseService.issueLicense({
            orderId: purchase._id,
            stripeSessionId,
            beatId: beat._id,
            beatTitle: beat.title,
            beatBpm: beat.bpm,
            beatKey: beat.key,
            tier: tierArg,
            buyerLegalName: BUYER.legalName,
            buyerEmail: BUYER.email,
            buyerAddress: BUYER.address,
            producers,
            beatFormats: beatLicense.formats || ['MP3', 'WAV'],
            beatTerms: beatLicense.terms || {},
            amount: beatLicense.price,
            currency: 'EUR'
        });

        console.log('✅ Licencia emitida');
        console.log('   License Number:', issuedLicense.licenseNumber);
        console.log('   License ID:', issuedLicense.licenseId);
        console.log('   Tier:', issuedLicense.tier);
        console.log('   Hash:', issuedLicense.documentHash.substring(0, 32) + '...');
        console.log('   Verify URL:', issuedLicense.verifyUrl);
        console.log('');

        // 5. Generar PDF
        console.log('📄 [5/6] Generando PDF...');
        const pdfBuffer = await licenseService.generateLicensePDF(issuedLicense);
        console.log('✅ PDF generado:', (pdfBuffer.length / 1024).toFixed(2), 'KB\n');

        // 6. Guardar PDF
        console.log('💾 [6/6] Guardando PDF...');
        const outputDir = path.join(__dirname, '../output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filename = `Licencia-${issuedLicense.licenseNumber}.pdf`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, pdfBuffer);
        console.log('✅ PDF guardado en:', filepath, '\n');

        // ── Resumen ──────────────────────────────────────────────
        console.log('🎉 ═══════════════════════════════════════════════════════');
        console.log('🎉 TEST COMPLETADO');
        console.log('🎉 ═══════════════════════════════════════════════════════\n');

        console.log('📊 RESUMEN:');
        console.log('├─ Beat (real):', beat.title, `(${beat._id})`);
        console.log('├─ Licencia beat:', beatLicense.name, `(${beatLicense.price}€)`);
        console.log('├─ Productores:', producers.map(p => p.name).join(', '));
        console.log('├─ Comprador:', BUYER.legalName);
        console.log('├─ License Number:', issuedLicense.licenseNumber);
        console.log('├─ Tier:', issuedLicense.tier);
        console.log('├─ PDF:', filepath);
        console.log('└─ PDF Size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
        console.log('');

        const limits = issuedLicense.limitsSnapshot || {};
        const fmtLimit = v => (v === 0 || v === undefined) ? 'Ilimitado' : v.toLocaleString('es-ES');
        console.log('🔐 LÍMITES:');
        console.log('├─ Distribución:', fmtLimit(limits.distributionLimit));
        console.log('├─ Streams:', fmtLimit(limits.audioStreams));
        console.log('├─ Music Videos:', fmtLimit(limits.musicVideos));
        console.log('├─ Performances:', limits.forProfitPerformances ? 'Sí' : 'No');
        console.log('├─ Radio:', fmtLimit(limits.radioBroadcasting));
        console.log('└─ Content ID:', limits.contentIdAllowed ? 'Sí' : 'No');
        console.log('');

        const split = issuedLicense.publishingSplitSnapshot || {};
        console.log('🎨 PUBLISHING SPLIT:');
        (split.producers || []).forEach(p => {
            console.log(`├─ ${p.name}: ${p.share}%`);
        });
        console.log(`└─ Licensee: ${split.licenseeShare ?? 50}%`);
        console.log('');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exitCode = 1;
    } finally {
        // Limpieza de datos de prueba (solo purchase e issuedLicense)
        if (!keepData) {
            console.log('🧹 Limpiando datos de prueba...');
            if (issuedLicense) {
                await IssuedLicense.deleteOne({ _id: issuedLicense._id });
                console.log('   ✅ Licencia eliminada');
            }
            if (purchase) {
                await Purchase.deleteOne({ _id: purchase._id });
                console.log('   ✅ Purchase eliminado');
            }
            console.log('   (El beat real NO se toca)\n');
        } else {
            console.log('⚠️  --keep: datos de prueba conservados');
            if (purchase) console.log('   Purchase ID:', purchase._id);
            if (issuedLicense) console.log('   License Number:', issuedLicense.licenseNumber);
            console.log('');
        }

        await mongoose.connection.close();
        console.log('👋 Conexión cerrada');
    }
}

run();
