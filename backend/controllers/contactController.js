const Contact = require('../models/Contact');
const EmailService = require('../services/emailService');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');
const { isUserAdmin } = require('../utils/authHelpers');

// Instanciar el servicio de email
const emailService = new EmailService();

// Middleware para rate limiting por IP (solo para contacto)
const contactAttempts = new Map();
const MAX_ATTEMPTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

const checkContactRateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!contactAttempts.has(clientIP)) {
        contactAttempts.set(clientIP, []);
    }
    
    const attempts = contactAttempts.get(clientIP);
    
    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    contactAttempts.set(clientIP, recentAttempts);
    
    if (recentAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
        return res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many contact attempts. Please try again in an hour.',
            retryAfter: Math.ceil((recentAttempts[0] + RATE_LIMIT_WINDOW - now) / 1000)
        });
    }
    
    // Agregar el intento actual
    recentAttempts.push(now);
    contactAttempts.set(clientIP, recentAttempts);
    
    next();
};

// POST - Enviar mensaje de contacto
const sendContactMessage = async (req, res) => {
    try {
        // Ensure database connection
        await connectDB();
        
        const { name, email, subject, message } = req.body;
        
        // Validación básica
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'All fields are required: name, email, subject, message'
            });
        }
        
        // Sanitizar datos
        const sanitizedData = {
            name: name.trim().substring(0, 100),
            email: email.trim().toLowerCase().substring(0, 100),
            subject: subject.trim().substring(0, 200),
            message: message.trim().substring(0, 2000)
        };
        
        // Información adicional
        const contactData = {
            ...sanitizedData,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown'
        };
        
        console.log('📧 New contact message received:', {
            name: sanitizedData.name,
            email: sanitizedData.email,
            subject: sanitizedData.subject,
            messageLength: sanitizedData.message.length,
            ip: contactData.ipAddress
        });
        
        // Crear registro en la base de datos
        const contact = await Contact.create(contactData);
        
        try {
            // Enviar email
            const emailResult = await emailService.sendContactEmail(sanitizedData);
            
            // Actualizar status a 'sent'
            await Contact.findByIdAndUpdate(contact._id, {
                status: 'sent',
                sentAt: new Date()
            });
            
            console.log('✅ Contact email sent successfully:', contact._id);
            
            res.status(200).json({
                success: true,
                message: 'Message sent successfully',
                id: contact._id,
                emailInfo: {
                    adminSent: !!emailResult.adminEmail,
                    userConfirmationSent: !!emailResult.userEmail
                }
            });
            
        } catch (emailError) {
            console.error('❌ Error sending contact email:', emailError.message);
            
            // Actualizar status a 'failed'
            await Contact.findByIdAndUpdate(contact._id, {
                status: 'failed',
                errorMessage: emailError.message
            });
            
            // Responder con error pero indicar que el mensaje se guardó
            res.status(500).json({
                error: 'EMAIL_SEND_FAILED',
                message: 'Message saved but email delivery failed. We will contact you soon.',
                id: contact._id
            });
        }
        
    } catch (error) {
        console.error('❌ Error in contact form:', error.message);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: 'Invalid data provided',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while processing your message'
        });
    }
};

// GET - Obtener mensajes de contacto (solo admin)
const getContactMessages = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        
        // Construir filtro
        let filter = {};
        
        if (status && ['pending', 'sent', 'failed'].includes(status)) {
            filter.status = status;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Consultar base de datos
        const [contacts, totalCount] = await Promise.all([
            Contact.find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .select('-userAgent -ipAddress'), // Ocultar datos sensibles en la respuesta
            Contact.countDocuments(filter)
        ]);
        
        res.status(200).json({
            data: contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            filters: { status, search }
        });
        
    } catch (error) {
        console.error('❌ Error getting contact messages:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error retrieving contact messages'
        });
    }
};

// GET - Obtener un mensaje específico (solo admin)
const getContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                error: 'INVALID_ID',
                message: 'Invalid contact message ID'
            });
        }
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Contact message not found'
            });
        }
        
        res.status(200).json(contact);
        
    } catch (error) {
        console.error('❌ Error getting contact message:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error retrieving contact message'
        });
    }
};

// DELETE - Eliminar mensaje de contacto (solo admin)
const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                error: 'INVALID_ID',
                message: 'Invalid contact message ID'
            });
        }
        
        const contact = await Contact.findByIdAndDelete(id);
        
        if (!contact) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Contact message not found'
            });
        }
        
        console.log('🗑️ Contact message deleted:', id);
        
        res.status(200).json({
            success: true,
            message: 'Contact message deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting contact message:', error.message);
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error deleting contact message'
        });
    }
};

// GET - Health check del servicio de email
const checkEmailService = async (req, res) => {
    try {
        const result = await emailService.verifyConnection();
        
        res.status(result.success ? 200 : 500).json({
            service: 'email',
            status: result.success ? 'healthy' : 'unhealthy',
            message: result.message,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            service: 'email',
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    sendContactMessage,
    getContactMessages,
    getContactMessage,
    deleteContactMessage,
    checkEmailService,
    checkContactRateLimit
};
