const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const licenseTemplateSchema = new Schema({
    templateId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    tier: { 
        type: String, 
        enum: ['Basic', 'Premium', 'Unlimited'],
        required: true 
    },
    displayName: {
        type: String,
        required: true
    },
    version: { 
        type: String, 
        required: true,
        default: '2026-02-06'
    },
    body: { 
        type: String, 
        required: true 
    },
    limits: {
        maxStreams: { 
            type: Number, 
            default: 0 // 0 = unlimited
        },
        maxMonetizedVideos: { 
            type: Number, 
            default: 1
        },
        maxPhysicalCopies: { 
            type: Number, 
            default: 0 // 0 = unlimited
        },
        contentIdAllowed: { 
            type: Boolean, 
            default: false 
        },
        forProfitPerformances: {
            type: Boolean,
            default: false
        },
        radioBroadcasting: {
            type: Boolean,
            default: false
        }
    },
    publishingSplit: {
        producer: { 
            type: Number, 
            default: 50 
        },
        licensee: { 
            type: Number, 
            default: 50 
        }
    },
    creditsRequired: {
        type: String,
        default: "Prod. by LilBru"
    },
    jurisdiction: {
        type: String,
        default: "España"
    },
    active: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

// Índice compuesto para buscar templates activos por tier
licenseTemplateSchema.index({ tier: 1, active: 1, version: -1 });

const LicenseTemplate = mongoose.model('LicenseTemplate', licenseTemplateSchema);

module.exports = LicenseTemplate;
