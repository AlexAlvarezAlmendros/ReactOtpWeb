const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

async function removePurchaseIdIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('tickets');

    // Listar todos los índices actuales
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Intentar eliminar el índice único de purchaseId
    try {
      await collection.dropIndex('purchaseId_1');
      console.log('\n✅ Successfully dropped purchaseId_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  Index purchaseId_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Listar índices después de la eliminación
    const indexesAfter = await collection.indexes();
    console.log('\n📋 Indexes after removal:');
    indexesAfter.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

removePurchaseIdIndex();
