const NewsletterSubscription = require('../models/NewsletterSubscription');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');
const { isUserAdmin } = require('../utils/authHelpers');

// Rate limiting para suscripciones (más permisivo que contacto)
const subscriptionAttempts = new Map();
const MAX_SUBSCRIPTION_ATTEMPTS_PER_HOUR = 10;
const SUBSCRIPTION_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

const checkSubscriptionRateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!subscriptionAttempts.has(clientIP)) {
        subscriptionAttempts.set(clientIP, []);
    }
    
    const attempts = subscriptionAttempts.get(clientIP);
    
    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(timestamp => now - timestamp < SUBSCRIPTION_RATE_LIMIT_WINDOW);
    subscriptionAttempts.set(clientIP, recentAttempts);
    
    if (recentAttempts.length >= MAX_SUBSCRIPTION_ATTEMPTS_PER_HOUR) {
        return res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many subscription attempts. Please try again in an hour.',
            retryAfter: Math.ceil((recentAttempts[0] + SUBSCRIPTION_RATE_LIMIT_WINDOW - now) / 1000)
        });
    }
    
    // Agregar el intento actual
    recentAttempts.push(now);
    subscriptionAttempts.set(clientIP, recentAttempts);
    
    next();
};

// POST - Suscribirse a la newsletter
const subscribeToNewsletter = async (req, res) => {
    try {
        // Ensure database connection
        await connectDB();
        
        const { email, source } = req.body;
        
        // Validación básica
        if (!email) {
            return res.status(400).json({
                error: 'EMAIL_REQUIRED',
                message: 'Email address is required'
            });
        }
        
        // Sanitizar email
        const sanitizedEmail = email.trim().toLowerCase();
        
        // Validar formato de email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({
                error: 'INVALID_EMAIL',
                message: 'Please provide a valid email address'
            });
        }
        
        // Verificar si el email ya está suscrito
        const existingSubscription = await NewsletterSubscription.findOne({ 
            email: sanitizedEmail 
        });
        
        if (existingSubscription) {
            if (existingSubscription.status === 'active') {
                return res.status(409).json({
                    error: 'ALREADY_SUBSCRIBED',
                    message: 'This email is already subscribed to our newsletter',
                    subscribedAt: existingSubscription.subscribedAt
                });
            } else if (existingSubscription.status === 'unsubscribed') {
                // Reactivar suscripción con nuevo token
                const crypto = require('crypto');
                const newToken = crypto.randomBytes(32).toString('hex');
                
                existingSubscription.status = 'active';
                existingSubscription.subscribedAt = new Date();
                existingSubscription.unsubscribedAt = undefined;
                existingSubscription.confirmationToken = newToken;
                await existingSubscription.save();
                
                console.log('📬 Newsletter subscription reactivated:', sanitizedEmail);
                
                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! Your newsletter subscription has been reactivated',
                    email: sanitizedEmail,
                    status: 'reactivated',
                    subscribedAt: existingSubscription.subscribedAt
                });
            }
        }
        
        // Generar token único para desuscripción
        const crypto = require('crypto');
        const unsubscribeToken = crypto.randomBytes(32).toString('hex');
        
        // Crear nueva suscripción
        const subscriptionData = {
            email: sanitizedEmail,
            source: source || 'website',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            subscribedAt: new Date(),
            isConfirmed: true,
            confirmationToken: unsubscribeToken
        };
        
        const subscription = await NewsletterSubscription.create(subscriptionData);
        
        console.log('📬 New newsletter subscription:', {
            email: sanitizedEmail,
            source: subscriptionData.source,
            ip: subscriptionData.ipAddress,
            id: subscription._id
        });
        
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            email: sanitizedEmail,
            subscribedAt: subscription.subscribedAt,
            id: subscription._id
        });
        
    } catch (error) {
        console.error('❌ Error in newsletter subscription:', error.message);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: 'Invalid data provided',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({
                error: 'ALREADY_SUBSCRIBED',
                message: 'This email is already subscribed to our newsletter'
            });
        }
        
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while processing your subscription'
        });
    }
};

// POST - Desuscribirse de la newsletter
const unsubscribeFromNewsletter = async (req, res) => {
    try {
        const { email, token } = req.body;
        
        // Validación de datos
        if (!email) {
            return res.status(400).json({
                error: 'EMAIL_REQUIRED',
                message: 'Email address is required'
            });
        }
        
        const sanitizedEmail = email.trim().toLowerCase();
        
        // Validar formato de email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({
                error: 'INVALID_EMAIL',
                message: 'Please provide a valid email address'
            });
        }
        
        // Buscar la suscripción (sin filtrar por estado)
        const subscription = await NewsletterSubscription.findOne({ 
            email: sanitizedEmail
        });
        
        // Email no encontrado en la base de datos
        if (!subscription) {
            return res.status(404).json({
                error: 'EMAIL_NOT_FOUND',
                message: 'Email not found in our newsletter subscribers'
            });
        }
        
        // Ya estaba desuscrito - tratado como éxito (410 Gone)
        if (subscription.status === 'unsubscribed') {
            console.log('📭 Already unsubscribed:', sanitizedEmail);
            return res.status(410).json({
                success: true,
                message: 'This email was already unsubscribed from newsletter',
                email: sanitizedEmail,
                unsubscribedAt: subscription.unsubscribedAt,
                status: 'already_unsubscribed'
            });
        }
        
        // Validar token si se proporciona (para desuscripción desde email)
        if (token && subscription.confirmationToken && subscription.confirmationToken !== token) {
            return res.status(400).json({
                error: 'INVALID_TOKEN',
                message: 'Invalid unsubscription token'
            });
        }
        
        // Desuscribir
        await subscription.unsubscribe();
        
        console.log('📭 Newsletter unsubscription:', sanitizedEmail);
        
        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter',
            email: sanitizedEmail,
            unsubscribedAt: subscription.unsubscribedAt
        });
        
    } catch (error) {
        console.error('❌ Error in newsletter unsubscription:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while processing your unsubscription'
        });
    }
};

// GET - Obtener todas las suscripciones (solo admin)
const getNewsletterSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 50, status, search } = req.query;
        
        // Construir filtro
        let filter = {};
        
        if (status && ['active', 'unsubscribed', 'bounced'].includes(status)) {
            filter.status = status;
        }
        
        if (search) {
            filter.email = { $regex: search, $options: 'i' };
        }
        
        // Paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Consultar base de datos
        const [subscriptions, totalCount] = await Promise.all([
            NewsletterSubscription.find(filter)
                .sort({ subscribedAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .select('-userAgent -ipAddress'), // Ocultar datos sensibles
            NewsletterSubscription.countDocuments(filter)
        ]);
        
        // Estadísticas adicionales
        const stats = await NewsletterSubscription.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const statsFormatted = {
            active: stats.find(s => s._id === 'active')?.count || 0,
            unsubscribed: stats.find(s => s._id === 'unsubscribed')?.count || 0,
            bounced: stats.find(s => s._id === 'bounced')?.count || 0
        };
        
        res.status(200).json({
            data: subscriptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            stats: statsFormatted,
            filters: { status, search }
        });
        
    } catch (error) {
        console.error('❌ Error getting newsletter subscriptions:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error retrieving newsletter subscriptions'
        });
    }
};

// GET - Verificar estado de suscripción
const checkSubscriptionStatus = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                error: 'EMAIL_REQUIRED',
                message: 'Email parameter is required'
            });
        }
        
        const sanitizedEmail = email.trim().toLowerCase();
        const subscription = await NewsletterSubscription.findOne({ 
            email: sanitizedEmail 
        });
        
        if (!subscription) {
            return res.status(200).json({
                email: sanitizedEmail,
                subscribed: false,
                status: 'not_found'
            });
        }
        
        res.status(200).json({
            email: sanitizedEmail,
            subscribed: subscription.status === 'active',
            status: subscription.status,
            subscribedAt: subscription.subscribedAt,
            unsubscribedAt: subscription.unsubscribedAt
        });
        
    } catch (error) {
        console.error('❌ Error checking subscription status:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error checking subscription status'
        });
    }
};

// DELETE - Eliminar suscripción permanentemente (solo admin)
const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                error: 'INVALID_ID',
                message: 'Invalid subscription ID'
            });
        }
        
        const subscription = await NewsletterSubscription.findByIdAndDelete(id);
        
        if (!subscription) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Subscription not found'
            });
        }
        
        console.log('🗑️ Newsletter subscription deleted:', subscription.email);
        
        res.status(200).json({
            success: true,
            message: 'Newsletter subscription deleted successfully',
            email: subscription.email
        });
        
    } catch (error) {
        console.error('❌ Error deleting subscription:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error deleting subscription'
        });
    }
};

// POST - Enviar newsletters programadas (endpoint para cron)
const sendScheduledNewsletters = async (req, res) => {
    try {
        console.log('🔔 Manual newsletter send triggered');
        
        // Validar token de seguridad si existe en variables de entorno
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
            // Vercel Cron envía el secret como Authorization Bearer header
            const authHeader = req.headers['authorization'];
            const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
            const providedSecret = bearerToken || req.headers['x-cron-secret'] || req.query.secret;
            
            if (providedSecret !== cronSecret) {
                console.warn('⚠️ Unauthorized cron job attempt');
                console.warn('   Expected:', cronSecret);
                console.warn('   Received:', providedSecret);
                return res.status(401).json({
                    error: 'UNAUTHORIZED',
                    message: 'Invalid or missing cron secret'
                });
            }
        }
        
        const Newsletter = require('../models/Newsletter');
        const EmailService = require('../services/emailService');
        const emailService = new EmailService();
        
        const now = new Date();
        console.log('⏰ Checking for scheduled newsletters at:', now.toISOString());
        
        const newslettersToSend = await Newsletter.find({
            status: 'scheduled',
            scheduledAt: { $lte: now }
        }).populate('content.uniqueBeats content.upcomingReleases content.events');
        
        console.log(`📊 Found ${newslettersToSend.length} scheduled newsletter(s) to send.`);
        
        const results = [];
        
        for (const news of newslettersToSend) {
            try {
                console.log(`📤 Processing newsletter: ${news.title} (${news._id})`);
                
                // Send email
                const sendResult = await emailService.sendNewsletter(news);
                
                // Update status
                news.status = 'sent';
                news.sentAt = new Date();
                await news.save();
                
                console.log(`✅ Newsletter sent and updated: ${news.title}`);
                
                results.push({
                    id: news._id,
                    title: news.title,
                    status: 'success',
                    sendResult
                });
            } catch (newsletterError) {
                console.error(`❌ Error processing newsletter ${news.title}:`, newsletterError);
                results.push({
                    id: news._id,
                    title: news.title,
                    status: 'error',
                    error: newsletterError.message
                });
            }
        }
        
        res.status(200).json({
            success: true,
            message: `Processed ${newslettersToSend.length} newsletter(s)`,
            results
        });
        
    } catch (error) {
        console.error('❌ Error in manual newsletter send:', error);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error sending scheduled newsletters',
            details: error.message
        });
    }
};

module.exports = {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getNewsletterSubscriptions,
    checkSubscriptionStatus,
    deleteSubscription,
    checkSubscriptionRateLimit,
    sendScheduledNewsletters
};
