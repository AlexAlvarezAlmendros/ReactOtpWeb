const mongoose = require('mongoose');

/**
 * Maqueta enviada desde /enviar-maqueta (Fase 4.3 del plan SEO).
 * Se revisa en el panel de gestión (/crear → Maquetas).
 */
const demoSubmissionSchema = new mongoose.Schema({
    artistName: { type: String, required: [true, 'El nombre artístico es obligatorio'], trim: true, maxlength: 100 },
    realName: { type: String, trim: true, maxlength: 100, default: '' },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.+-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email no válido']
    },
    city: { type: String, trim: true, maxlength: 100, default: '' },
    genres: [{ type: String, trim: true, maxlength: 40 }],
    // Enlaces a la música (Spotify, SoundCloud, YouTube, Drive…). Al menos uno.
    links: {
        type: [{ type: String, trim: true, maxlength: 500 }],
        validate: [(links) => links.length > 0 && links.length <= 5, 'Añade entre 1 y 5 enlaces a tu música']
    },
    instagram: { type: String, trim: true, maxlength: 200, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    // Consentimiento RGPD (obligatorio para guardar los datos).
    consent: { type: Boolean, required: true, validate: [(v) => v === true, 'Necesitamos tu consentimiento'] },
    status: { type: String, enum: ['nueva', 'escuchada', 'interesa', 'descartada'], default: 'nueva' },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    ipAddress: { type: String, default: '' },
    emailStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
}, {
    timestamps: true
});

demoSubmissionSchema.index({ createdAt: -1 });
demoSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model('DemoSubmission', demoSubmissionSchema);
