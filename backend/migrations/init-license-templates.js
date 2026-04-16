/**
 * Migration script to initialize License Templates
 * Run with: node migrations/init-license-templates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LicenseTemplate = require('../models/LicenseTemplate');

const templates = [
    {
        templateId: 'basic-v1-2026',
        tier: 'Basic',
        displayName: 'Licencia Básica',
        version: '2026-02-06',
        body: 'Licencia básica para uso no comercial con limitaciones en reproducciones streaming.',
        limits: {
            maxStreams: 50000,
            maxMonetizedVideos: 1,
            maxPhysicalCopies: 0,
            contentIdAllowed: false,
            forProfitPerformances: false,
            radioBroadcasting: false
        },
        publishingSplit: {
            producer: 50,
            licensee: 50
        },
        creditsRequired: 'Prod. by LilBru',
        jurisdiction: 'España',
        active: true
    },
    {
        templateId: 'premium-v1-2026',
        tier: 'Premium',
        displayName: 'Licencia Premium',
        version: '2026-02-06',
        body: 'Licencia premium para uso comercial con límites extendidos en reproducciones y distribución física.',
        limits: {
            maxStreams: 500000,
            maxMonetizedVideos: 1,
            maxPhysicalCopies: 10000,
            contentIdAllowed: false,
            forProfitPerformances: true,
            radioBroadcasting: true
        },
        publishingSplit: {
            producer: 50,
            licensee: 50
        },
        creditsRequired: 'Prod. by LilBru',
        jurisdiction: 'España',
        active: true
    },
    {
        templateId: 'unlimited-v1-2026',
        tier: 'Unlimited',
        displayName: 'Licencia Unlimited',
        version: '2026-02-06',
        body: 'Licencia ilimitada para uso comercial sin restricciones en reproducciones, distribución y monetización.',
        limits: {
            maxStreams: 0, // 0 = unlimited
            maxMonetizedVideos: 0,
            maxPhysicalCopies: 0,
            contentIdAllowed: false,
            forProfitPerformances: true,
            radioBroadcasting: true
        },
        publishingSplit: {
            producer: 50,
            licensee: 50
        },
        creditsRequired: 'Prod. by LilBru',
        jurisdiction: 'España',
        active: true
    }
];

async function initLicenseTemplates() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI or MONGODB_URI environment variable is not set');
        }
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB');

        console.log('📝 Initializing license templates...');

        for (const template of templates) {
            const existing = await LicenseTemplate.findOne({ templateId: template.templateId });
            
            if (existing) {
                console.log(`   ⚠️  Template ${template.tier} already exists, skipping...`);
            } else {
                await LicenseTemplate.create(template);
                console.log(`   ✅ Created ${template.tier} template`);
            }
        }

        console.log('✅ License templates initialized successfully');
        
        // Display summary
        const count = await LicenseTemplate.countDocuments({ active: true });
        console.log(`\n📊 Summary: ${count} active license templates`);

        await mongoose.connection.close();
        console.log('👋 Database connection closed');

    } catch (error) {
        console.error('❌ Error initializing license templates:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initLicenseTemplates();
}

module.exports = { initLicenseTemplates };
