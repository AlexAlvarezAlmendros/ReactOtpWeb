const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
    beatId: { type: Schema.Types.ObjectId, ref: 'Beat', required: true },
    licenseId: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    purchasedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Índices para consultas rápidas
purchaseSchema.index({ beatId: 1, purchasedAt: -1 });
purchaseSchema.index({ customerEmail: 1 });
// stripeSessionId index removed - already defined as unique in schema

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
