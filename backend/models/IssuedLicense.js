const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issuedLicenseSchema = new Schema({
    licenseId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    licenseNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    templateId: { 
        type: String, 
        required: true 
    },
    templateVersion: { 
        type: String, 
        required: true 
    },
    tier: {
        type: String,
        enum: ['Basic', 'Premium', 'Unlimited'],
        required: true
    },
    // Order/Purchase information
    orderId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Purchase', 
        required: true 
    },
    stripeSessionId: {
        type: String,
        required: true
    },
    // Beat information
    beatId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Beat', 
        required: true 
    },
    beatTitle: { 
        type: String, 
        required: true 
    },
    // Producer information
    producerName: { 
        type: String, 
        default: 'LilBru' 
    },
    beatBpm: { 
        type: Number 
    },
    beatKey: { 
        type: String 
    },
    // Buyer/Licensee information
    buyerLegalName: { 
        type: String, 
        required: true 
    },
    buyerEmail: { 
        type: String, 
        required: true 
    },
    // License snapshot (immutable)
    limitsSnapshot: {
        maxStreams: { type: Number },
        maxMonetizedVideos: { type: Number },
        maxPhysicalCopies: { type: Number },
        contentIdAllowed: { type: Boolean },
        forProfitPerformances: { type: Boolean },
        radioBroadcasting: { type: Boolean }
    },
    publishingSplitSnapshot: {
        producer: { type: Number },
        licensee: { type: Number }
    },
    creditsRequired: { type: String },
    jurisdiction: { type: String },
    // Document hash for verification
    documentHash: { 
        type: String, 
        required: true 
    },
    // Payment information
    amount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: 'EUR' 
    },
    // Status
    status: { 
        type: String, 
        enum: ['Issued', 'Revoked', 'Expired'],
        default: 'Issued' 
    },
    issuedAt: { 
        type: Date, 
        default: Date.now 
    },
    // PDF path or URL (optional, if you store the PDF)
    pdfPath: { 
        type: String 
    },
    // Verification URL
    verifyUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Índices para consultas
issuedLicenseSchema.index({ buyerEmail: 1, issuedAt: -1 });
issuedLicenseSchema.index({ beatId: 1 });
issuedLicenseSchema.index({ orderId: 1 });
issuedLicenseSchema.index({ stripeSessionId: 1 });
// licenseNumber index removed - already defined as unique in schema

const IssuedLicense = mongoose.model('IssuedLicense', issuedLicenseSchema);

module.exports = IssuedLicense;
