const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issuedLicenseSchema = new Schema({
    licenseId: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    templateId: { type: String, required: true },
    templateVersion: { type: String, required: true },
    tier: {
        type: String,
        enum: ['Basic', 'Premium', 'Unlimited'],
        required: true
    },
    // Order/Purchase information
    orderId: { type: Schema.Types.ObjectId, ref: 'Purchase', required: true },
    stripeSessionId: { type: String, required: true },
    // Beat information
    beatId: { type: Schema.Types.ObjectId, ref: 'Beat', required: true },
    beatTitle: { type: String, required: true },
    beatBpm: { type: Number },
    beatKey: { type: String },
    beatFormats: [{ type: String }],
    // Producer information (supports multiple producers)
    producers: [{
        name: { type: String },
        publisherShare: { type: Number }
    }],
    // Buyer/Licensee information
    buyerLegalName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerAddress: { type: String, default: '' },
    // License snapshot (immutable at time of purchase)
    limitsSnapshot: {
        distributionLimit: { type: Number },
        audioStreams: { type: Number },
        musicVideos: { type: Number },
        forProfitPerformances: { type: Boolean },
        radioBroadcasting: { type: Number },
        contentIdAllowed: { type: Boolean }
    },
    publishingSplitSnapshot: {
        producers: [{
            name: { type: String },
            share: { type: Number }
        }],
        licenseeShare: { type: Number }
    },
    creditsRequired: { type: String },
    jurisdiction: { type: String },
    // Document integrity
    documentHash: { type: String, required: true },
    // Payment information
    amount: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    // Status
    status: {
        type: String,
        enum: ['Issued', 'Revoked', 'Expired'],
        default: 'Issued'
    },
    issuedAt: { type: Date, default: Date.now },
    pdfPath: { type: String },
    verifyUrl: { type: String }
}, {
    timestamps: true
});

issuedLicenseSchema.index({ buyerEmail: 1, issuedAt: -1 });
issuedLicenseSchema.index({ beatId: 1 });
issuedLicenseSchema.index({ orderId: 1 });
issuedLicenseSchema.index({ stripeSessionId: 1 });

const IssuedLicense = mongoose.model('IssuedLicense', issuedLicenseSchema);

module.exports = IssuedLicense;
