const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ticketSchema = new Schema({
	eventId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event',
		required: true
	},
	purchaseId: {
		type: String,  // ID de la compra (Stripe Session ID)
		required: true
	},
	// Código único de validación (UUID v4) - ÚNICO POR ENTRADA
	validationCode: {
		type: String,
		required: true,
		unique: true
		// index: true eliminado - ya se crea con unique: true
	},
	customerEmail: {
		type: String,
		required: true
	},
	customerName: {
		type: String,
		required: true
	},
	// Cantidad total de la compra (para referencia)
	purchaseQuantity: {
		type: Number,
		required: true,
		min: 1
	},
	// Número de esta entrada específica (ej: 1 de 3)
	ticketNumber: {
		type: Number,
		required: true,
		min: 1
	},
	totalAmount: {
		type: Number,
		required: true
	},
	currency: {
		type: String,
		default: 'EUR'
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'cancelled', 'refunded', 'active', 'validated'],
		default: 'pending'
	},
	ticketCode: {
		type: String,
		unique: true,
		required: true
	},
	qrCode: {
		type: String  // Base64 del QR
	},
	validated: {
		type: Boolean,
		default: false
	},
	validatedAt: {
		type: Date,
		default: null
	},
	validatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	// Seguridad y auditoría
	validationAttempts: {
		type: Number,
		default: 0
	},
	lastAttemptAt: {
		type: Date,
		default: null
	}
}, {
	timestamps: true
});

// Índices para optimizar búsquedas
ticketSchema.index({ eventId: 1, status: 1 });
ticketSchema.index({ customerEmail: 1 });
// ticketCode ya tiene índice por unique: true
// validationCode ya tiene índice por unique: true
ticketSchema.index({ eventId: 1, validated: 1 });
ticketSchema.index({ purchaseId: 1, ticketNumber: 1 }); // Nuevo índice para tickets individuales

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
