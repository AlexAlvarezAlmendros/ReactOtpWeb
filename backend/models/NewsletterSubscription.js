const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsletterSubscriptionSchema = new Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true, // Evitar duplicados
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    source: {
        type: String,
        default: 'website', // de dónde viene la suscripción
        trim: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date
    },
    confirmationToken: {
        type: String // Para confirmación por email (opcional)
    },
    isConfirmed: {
        type: Boolean,
        default: true // Por ahora sin confirmación, directo activo
    }
}, {
    timestamps: true
});

// Índices para performance
newsletterSubscriptionSchema.index({ status: 1 });
newsletterSubscriptionSchema.index({ subscribedAt: -1 });
newsletterSubscriptionSchema.index({ createdAt: -1 });

// Método para formatear el email antes de guardar
newsletterSubscriptionSchema.pre('save', function(next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

// Método estático para verificar si un email ya existe
newsletterSubscriptionSchema.statics.isEmailSubscribed = async function(email) {
    const subscription = await this.findOne({ 
        email: email.toLowerCase().trim(),
        status: 'active'
    });
    return !!subscription;
};

// Método para desuscribir
newsletterSubscriptionSchema.methods.unsubscribe = function() {
    this.status = 'unsubscribed';
    this.unsubscribedAt = new Date();
    return this.save();
};

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

module.exports = NewsletterSubscription;
