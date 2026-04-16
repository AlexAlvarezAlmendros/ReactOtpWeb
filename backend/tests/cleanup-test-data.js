/**
 * Script para limpiar datos de prueba
 * 
 * Ejecutar: node tests/cleanup-test-data.js [beatId]
 * 
 * Este script elimina:
 * - Licencias emitidas relacionadas con el beat
 * - Purchases relacionadas con el beat
 * - El beat de prueba
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Beat = require('../models/Beat');
const Purchase = require('../models/Purchase');
const IssuedLicense = require('../models/IssuedLicense');

async function cleanupTestData(beatId) {
    try {
        console.log('🧹 Iniciando limpieza de datos de prueba...\n');

        // Conectar a MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB\n');

        if (!beatId) {
            throw new Error('Debes proporcionar un beatId como argumento');
        }

        if (!mongoose.Types.ObjectId.isValid(beatId)) {
            throw new Error('El beatId proporcionado no es válido');
        }

        // Buscar el beat
        const beat = await Beat.findById(beatId);
        if (!beat) {
            console.log('⚠️  Beat no encontrado, puede que ya esté eliminado');
        } else {
            console.log('📋 Beat encontrado:', beat.title);
        }

        // Buscar purchases relacionadas
        const purchases = await Purchase.find({ beatId });
        console.log(`\n📦 Purchases encontradas: ${purchases.length}`);

        // Buscar licencias relacionadas con las purchases
        const purchaseIds = purchases.map(p => p._id);
        const licenses = await IssuedLicense.find({ orderId: { $in: purchaseIds } });
        console.log(`📄 Licencias encontradas: ${licenses.length}\n`);

        // Confirmar eliminación
        console.log('⚠️  PRECAUCIÓN: Esto eliminará:');
        console.log(`   - ${licenses.length} licencia(s)`);
        console.log(`   - ${purchases.length} purchase(s)`);
        console.log(`   - 1 beat`);
        console.log('');

        // Eliminar licencias
        if (licenses.length > 0) {
            await IssuedLicense.deleteMany({ orderId: { $in: purchaseIds } });
            console.log(`✅ ${licenses.length} licencia(s) eliminada(s)`);
            licenses.forEach(lic => {
                console.log(`   └─ ${lic.licenseNumber}`);
            });
        }

        // Eliminar purchases
        if (purchases.length > 0) {
            await Purchase.deleteMany({ beatId });
            console.log(`✅ ${purchases.length} purchase(s) eliminado(s)`);
        }

        // Eliminar beat
        if (beat) {
            await Beat.deleteOne({ _id: beatId });
            console.log(`✅ Beat eliminado: ${beat.title}`);
        }

        console.log('\n🎉 Limpieza completada exitosamente\n');

    } catch (error) {
        console.error('\n❌ Error en la limpieza:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Conexión cerrada\n');
    }
}

// Obtener beatId de los argumentos de línea de comandos
const beatId = process.argv[2];

if (require.main === module) {
    if (!beatId) {
        console.error('❌ Error: Debes proporcionar un beatId');
        console.log('\nUso:');
        console.log('  node tests/cleanup-test-data.js <beatId>');
        console.log('\nEjemplo:');
        console.log('  node tests/cleanup-test-data.js 507f1f77bcf86cd799439011');
        process.exit(1);
    }
    cleanupTestData(beatId);
}

module.exports = { cleanupTestData };
