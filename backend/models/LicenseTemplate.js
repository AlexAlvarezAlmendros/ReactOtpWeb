const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const licenseTemplateSchema = new Schema({
    templateId: { type: String, required: true, unique: true },
    tier: {
        type: String,
        enum: ['Basic', 'Premium', 'Unlimited'],
        required: true
    },
    displayName: { type: String, required: true },
    version: { type: String, required: true, default: '2026-04-17' },
    body: { type: String, required: true },
    limits: {
        distributionLimit: { type: Number, default: 0 },   // 0 = unlimited
        audioStreams: { type: Number, default: 0 },         // 0 = unlimited
        musicVideos: { type: Number, default: 1 },
        forProfitPerformances: { type: Boolean, default: false },
        radioBroadcasting: { type: Number, default: 0 },   // 0 = not allowed, N = up to N stations
        contentIdAllowed: { type: Boolean, default: false }
    },
    publishingSplit: {
        producerTotalShare: { type: Number, default: 50 }, // split equally among all producers
        licenseeShare: { type: Number, default: 50 }
    },
    creditsRequired: { type: String, default: 'Produced by OTP Records' },
    jurisdiction: { type: String, default: 'Spain' },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

licenseTemplateSchema.index({ tier: 1, active: 1, version: -1 });

const LicenseTemplate = mongoose.model('LicenseTemplate', licenseTemplateSchema);

module.exports = LicenseTemplate;
