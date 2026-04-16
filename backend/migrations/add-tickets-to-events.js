/**
 * Script de migración para añadir campos de tickets a eventos existentes
 * 
 * Este script actualiza todos los eventos existentes en la base de datos
 * para añadir los nuevos campos del sistema de tickets con valores por defecto.
 * 
 * IMPORTANTE: Ejecutar solo UNA VEZ después de implementar el sistema de tickets
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function migrateEvents() {
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los eventos
    const events = await Event.find({});
    console.log(`📊 Encontrados ${events.length} eventos`);

    if (events.length === 0) {
      console.log('ℹ️  No hay eventos para migrar');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let alreadyMigratedCount = 0;

    // Actualizar cada evento
    for (const event of events) {
      // Verificar si ya tiene los campos de tickets
      if (event.ticketsEnabled !== undefined) {
        console.log(`⏭️  Evento "${event.name}" ya tiene campos de tickets`);
        alreadyMigratedCount++;
        continue;
      }

      // Añadir campos de tickets con valores por defecto
      event.ticketsEnabled = false;
      event.ticketPrice = 0;
      event.totalTickets = 0;
      event.availableTickets = 0;
      event.ticketsSold = 0;
      event.ticketCurrency = 'EUR';
      event.saleStartDate = null;
      event.saleEndDate = null;

      await event.save();
      console.log(`✅ Evento "${event.name}" actualizado`);
      updatedCount++;
    }

    // Resumen
    console.log('\n📈 RESUMEN DE MIGRACIÓN:');
    console.log(`   Total de eventos: ${events.length}`);
    console.log(`   Eventos actualizados: ${updatedCount}`);
    console.log(`   Eventos ya migrados: ${alreadyMigratedCount}`);
    console.log('\n✅ Migración completada exitosamente');

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
console.log('🚀 Iniciando migración de eventos...\n');
migrateEvents();
