/**
 * Test de generación de licencia PDF
 * 
 * Este script genera una licencia de prueba con datos de ejemplo
 * y guarda el PDF en disco para revisión manual.
 * 
 * Ejecutar: node tests/test-license-generation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const licenseService = require('../services/licenseService');
const Beat = require('../models/Beat');
const Purchase = require('../models/Purchase');
const IssuedLicense = require('../models/IssuedLicense');

// Datos de ejemplo para el test
const testData = {
    beat: {
        title: "Dark Trap Beat",
        bpm: 140,
        key: "Am",
        genre: "Trap",
        tags: ["dark", "trap", "aggressive", "808"],
        price: 29.99,
        audioUrl: "https://example.com/preview/dark-trap-beat.mp3",
        coverUrl: "https://example.com/covers/dark-trap-beat.jpg",
        active: true,
        licenses: [{
            id: "premium-001",
            name: "Licencia Premium",
            price: 99.99,
            description: "Para artistas profesionales",
            formats: ["MP3", "WAV"],
            files: {
                mp3Url: "https://example.com/files/beat-mp3.zip",
                wavUrl: "https://example.com/files/beat-wav.zip"
            },
            terms: {
                usedForRecording: true,
                distributionLimit: 10000,
                audioStreams: 500000,
                musicVideos: 1,
                forProfitPerformances: true,
                radioBroadcasting: 1
            }
        }]
    },
    buyer: {
        legalName: "Juan Pérez García",
        email: "juan.perez@example.com"
    },
    purchase: {
        amount: 99.99,
        currency: "EUR",
        stripeSessionId: "cs_test_" + Date.now()
    }
};

async function testLicenseGeneration() {
    let beat = null;
    let purchase = null;
    let issuedLicense = null;

    try {
        console.log('🧪 ═══════════════════════════════════════════════════════');
        console.log('🧪 TEST DE GENERACIÓN DE LICENCIA PDF');
        console.log('🧪 ═══════════════════════════════════════════════════════\n');

        // 1. Conectar a MongoDB
        console.log('📦 [1/6] Conectando a MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI no configurada en .env');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Conexión exitosa\n');

        // 2. Crear beat de prueba
        console.log('🎵 [2/6] Creando beat de prueba...');
        beat = await Beat.create(testData.beat);
        console.log('✅ Beat creado:', beat._id);
        console.log('   Título:', beat.title);
        console.log('   BPM:', beat.bpm);
        console.log('   Key:', beat.key);
        console.log('');

        // 3. Crear purchase de prueba
        console.log('💳 [3/6] Creando purchase de prueba...');
        purchase = await Purchase.create({
            beatId: beat._id,
            licenseId: beat.licenses[0].id,
            customerEmail: testData.buyer.email,
            customerName: testData.buyer.legalName,
            amount: testData.purchase.amount,
            stripeSessionId: testData.purchase.stripeSessionId,
            status: 'completed',
            purchasedAt: new Date()
        });
        console.log('✅ Purchase creado:', purchase._id);
        console.log('   Comprador:', purchase.customerName);
        console.log('   Email:', purchase.customerEmail);
        console.log('   Monto:', purchase.amount, 'EUR');
        console.log('');

        // 4. Emitir licencia
        console.log('📝 [4/6] Emitiendo licencia...');
        issuedLicense = await licenseService.issueLicense({
            orderId: purchase._id,
            stripeSessionId: testData.purchase.stripeSessionId,
            beatId: beat._id,
            beatTitle: beat.title,
            beatBpm: beat.bpm,
            beatKey: beat.key,
            tier: 'Premium', // Puede ser: Basic, Premium, Unlimited
            buyerLegalName: testData.buyer.legalName,
            buyerEmail: testData.buyer.email,
            amount: testData.purchase.amount,
            currency: testData.purchase.currency
        });
        console.log('✅ Licencia emitida exitosamente');
        console.log('   License ID:', issuedLicense.licenseId);
        console.log('   License Number:', issuedLicense.licenseNumber);
        console.log('   Tier:', issuedLicense.tier);
        console.log('   Document Hash:', issuedLicense.documentHash.substring(0, 32) + '...');
        console.log('   Verify URL:', issuedLicense.verifyUrl);
        console.log('');

        // 5. Generar PDF
        console.log('📄 [5/6] Generando PDF...');
        const pdfBuffer = await licenseService.generateLicensePDF(issuedLicense);
        console.log('✅ PDF generado exitosamente');
        console.log('   Tamaño:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
        console.log('');

        // 6. Guardar PDF en disco
        console.log('💾 [6/6] Guardando PDF en disco...');
        const outputDir = path.join(__dirname, '../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `Licencia-${issuedLicense.licenseNumber}.pdf`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, pdfBuffer);
        console.log('✅ PDF guardado en:', filepath);
        console.log('');

        // Resumen
        console.log('🎉 ═══════════════════════════════════════════════════════');
        console.log('🎉 TEST COMPLETADO EXITOSAMENTE');
        console.log('🎉 ═══════════════════════════════════════════════════════\n');
        
        console.log('📊 RESUMEN:');
        console.log('├─ Beat ID:', beat._id);
        console.log('├─ Purchase ID:', purchase._id);
        console.log('├─ License Number:', issuedLicense.licenseNumber);
        console.log('├─ License ID:', issuedLicense.licenseId);
        console.log('├─ Tier:', issuedLicense.tier);
        console.log('├─ PDF Size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
        console.log('└─ PDF Path:', filepath);
        console.log('');

        console.log('📋 DETALLES DE LA LICENCIA:');
        console.log('├─ Productor:', issuedLicense.producerName);
        console.log('├─ Beat:', issuedLicense.beatTitle);
        console.log('├─ BPM:', issuedLicense.beatBpm);
        console.log('├─ Key:', issuedLicense.beatKey);
        console.log('├─ Comprador:', issuedLicense.buyerLegalName);
        console.log('├─ Email:', issuedLicense.buyerEmail);
        console.log('├─ Monto:', issuedLicense.amount, issuedLicense.currency);
        console.log('└─ Fecha:', issuedLicense.issuedAt.toLocaleString('es-ES'));
        console.log('');

        console.log('🔐 LÍMITES Y TÉRMINOS:');
        const limits = issuedLicense.limitsSnapshot;
        const formatLimit = (value) => value === 0 ? 'Ilimitado' : value.toLocaleString('es-ES');
        console.log('├─ Streams:', formatLimit(limits.maxStreams));
        console.log('├─ Videos Monetizados:', formatLimit(limits.maxMonetizedVideos));
        console.log('├─ Copias Físicas:', formatLimit(limits.maxPhysicalCopies));
        console.log('├─ Content ID:', limits.contentIdAllowed ? 'Permitido' : 'No permitido');
        console.log('├─ Actuaciones con lucro:', limits.forProfitPerformances ? 'Sí' : 'No');
        console.log('└─ Radiodifusión:', limits.radioBroadcasting ? 'Sí' : 'No');
        console.log('');

        console.log('🎨 PUBLISHING SPLIT:');
        const split = issuedLicense.publishingSplitSnapshot;
        console.log('├─ Productor:', split.producer + '%');
        console.log('└─ Licenciatario:', split.licensee + '%');
        console.log('');

        console.log('✨ PRÓXIMOS PASOS:');
        console.log('1. Abre el PDF:', filepath);
        console.log('2. Revisa el contenido y diseño');
        console.log('3. Verifica el QR code con tu móvil');
        console.log('4. Prueba la verificación: GET /api/licenses/verify/' + issuedLicense.licenseNumber);
        console.log('');

        console.log('🧹 Para limpiar los datos de prueba, ejecuta:');
        console.log('   node tests/cleanup-test-data.js ' + beat._id);
        console.log('');

    } catch (error) {
        console.error('\n❌ ═══════════════════════════════════════════════════════');
        console.error('❌ ERROR EN EL TEST');
        console.error('❌ ═══════════════════════════════════════════════════════\n');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        // Limpiar datos en caso de error
        console.log('\n🧹 Limpiando datos de prueba...');
        if (issuedLicense) {
            await IssuedLicense.deleteOne({ _id: issuedLicense._id });
            console.log('   ✅ Licencia eliminada');
        }
        if (purchase) {
            await Purchase.deleteOne({ _id: purchase._id });
            console.log('   ✅ Purchase eliminado');
        }
        if (beat) {
            await Beat.deleteOne({ _id: beat._id });
            console.log('   ✅ Beat eliminado');
        }
        
        process.exit(1);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('👋 Conexión a MongoDB cerrada\n');
    }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
    testLicenseGeneration();
}

module.exports = { testLicenseGeneration, testData };
