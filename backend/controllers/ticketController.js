const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const EmailService = require('../services/emailService');
const connectDB = require('../utils/dbConnection');
const { 
	generateTicketData, 
	generateTicketPDF,
	generateMultipleTickets,
	generateCombinedTicketsPDF 
} = require('../services/ticketGenerator');

// Inicializar el servicio de email
const emailService = new EmailService();

/**
 * Genera un código único de ticket
 */
function generateUniqueTicketCode() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substr(2, 9).toUpperCase();
	return `TICKET-${timestamp}-${random}`;
}

/**
 * Genera un código QR en formato base64
 */
async function generateQRCode(ticketCode) {
	try {
		return await QRCode.toDataURL(ticketCode);
	} catch (error) {
		console.error('Error generando QR Code:', error);
		throw error;
	}
}

/**
 * POST /api/tickets/create-checkout-session
 * Crea una sesión de Stripe Checkout para comprar tickets
 */
const createCheckoutSession = async (req, res) => {
	try {
		// Ensure database connection
		await connectDB();
		
		const { eventId, quantity, customerEmail, customerName } = req.body;

		// Validar datos de entrada
		if (!eventId || !quantity || !customerEmail || !customerName) {
			return res.status(400).json({ 
				error: 'Faltan datos requeridos: eventId, quantity, customerEmail, customerName' 
			});
		}

		// 1. Verificar que el evento existe y tiene tickets disponibles
		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ error: 'Evento no encontrado' });
		}

		if (!event.ticketsEnabled) {
			return res.status(400).json({ error: 'Este evento no tiene venta de entradas habilitada' });
		}

		// 2. Verificar disponibilidad de tickets
		if (event.availableTickets < quantity) {
			return res.status(400).json({ 
				error: `Solo quedan ${event.availableTickets} entradas disponibles` 
			});
		}

		// 3. Verificar fechas de venta
		const now = new Date();
		if (event.saleStartDate && now < new Date(event.saleStartDate)) {
			return res.status(400).json({ 
				error: 'La venta de entradas aún no ha comenzado' 
			});
		}
		if (event.saleEndDate && now > new Date(event.saleEndDate)) {
			return res.status(400).json({ 
				error: 'La venta de entradas ha finalizado' 
			});
		}

		// 3.1. Validar precio mínimo de Stripe
		const totalAmount = event.ticketPrice * quantity;
		const currency = event.ticketCurrency || 'EUR';
		
		// Mínimos de Stripe por moneda
		const stripeMinimums = {
			'EUR': 0.50,
			'USD': 0.50,
			'GBP': 0.30,
			'MXN': 10,
			'JPY': 50
		};

		const minimumAmount = stripeMinimums[currency.toUpperCase()] || 0.50;

		if (totalAmount < minimumAmount) {
			return res.status(400).json({ 
				error: `El monto total debe ser al menos ${minimumAmount} ${currency}. Total actual: ${totalAmount.toFixed(2)} ${currency}`,
				details: {
					ticketPrice: event.ticketPrice,
					quantity: quantity,
					total: totalAmount,
					minimum: minimumAmount,
					currency: currency
				}
			});
		}

		// 4. Crear sesión de Stripe Checkout
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [{
				price_data: {
					currency: event.ticketCurrency.toLowerCase(),
					product_data: {
						name: `Entrada - ${event.name}`,
						description: `${quantity} entrada(s) para ${event.name}`,
						images: event.img ? [event.img] : []
					},
					unit_amount: Math.round(event.ticketPrice * 100) // Stripe usa centavos
				},
				quantity: quantity
			}],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/eventos/${eventId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL}/eventos/${eventId}?canceled=true`,
			customer_email: customerEmail,
			metadata: {
				eventId: eventId.toString(),
				eventName: event.name,
				customerName: customerName,
				quantity: quantity.toString()
			}
		});

		res.json({
			sessionId: session.id,
			url: session.url
		});

	} catch (error) {
		console.error('Error creating checkout session:', error);
		res.status(500).json({ 
			error: 'Error al crear sesión de pago',
			details: error.message 
		});
	}
};

/**
 * POST /api/tickets/webhook
 * Recibe notificaciones de Stripe sobre el estado del pago
 */
const handleWebhook = async (req, res) => {
	console.log('🔔 Webhook received from Stripe');
	
	// Ensure MongoDB connection before processing
	try {
		await connectDB();
	} catch (dbError) {
		console.error('❌ Database connection failed:', dbError.message);
		return res.status(503).send('Database connection error');
	}
	
	const sig = req.headers['stripe-signature'];
	let event;

	try {
		// Verificar la firma del webhook
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		);
		console.log('✅ Webhook signature verified successfully');
	} catch (err) {
		console.error('❌ Webhook signature verification failed:', err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	console.log('📋 Event type:', event.type);

	// Manejar el evento
	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		console.log('💳 Checkout session completed:', session.id);
		console.log('📧 Customer email:', session.customer_email);
		console.log('📦 Metadata:', session.metadata);
		
		try {
			// 1. Obtener el evento
			const eventData = await Event.findById(session.metadata.eventId);
			if (!eventData) {
				console.error('❌ Event not found:', session.metadata.eventId);
				throw new Error('Event not found');
			}
			console.log('🎫 Event found:', eventData.name);

			const quantity = parseInt(session.metadata.quantity);

			// 2. Generar múltiples tickets individuales (uno por entrada)
			console.log(`🔄 Generating ${quantity} individual tickets...`);
			const ticketsData = await generateMultipleTickets(eventData, {
				sessionId: session.id,
				customerEmail: session.customer_email,
				customerName: session.metadata.customerName,
				quantity: quantity,
				totalAmount: session.amount_total / 100,
				currency: session.currency.toUpperCase()
			});
			console.log(`✅ Generated ${ticketsData.length} tickets`);
			
			// 3. Crear todos los tickets en la base de datos
			console.log('💾 Creating tickets in database...');
			const createdTickets = await Ticket.insertMany(ticketsData);
			console.log(`✅ ${createdTickets.length} tickets created in DB`);
			
			// 4. Actualizar el evento (reducir tickets disponibles)
			console.log('🔄 Updating event inventory...');
			const updatedEvent = await Event.findByIdAndUpdate(
				session.metadata.eventId,
				{
					$inc: {
						availableTickets: -quantity,
						ticketsSold: quantity
					}
				},
				{ new: true }
			);
			console.log('✅ Event inventory updated. Available:', updatedEvent.availableTickets);

			// 5. Generar PDF combinado con todas las entradas
			console.log('📄 Generating combined PDF with all tickets...');
			const pdfBuffer = await generateCombinedTicketsPDF(createdTickets, updatedEvent);
			console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');
			
			// 6. Enviar email con el PDF de todas las entradas
			console.log('📧 Sending email to:', session.customer_email);
			
			// Convertir el documento de Mongoose a objeto plano
			const firstTicket = createdTickets[0].toObject ? createdTickets[0].toObject() : createdTickets[0];
			
			await emailService.sendTicketEmailWithPDF(
				{
					...firstTicket,
					customerEmail: session.customer_email, // Asegurar que el email esté presente
					customerName: session.metadata.customerName,
					purchaseQuantity: quantity,
					totalAmount: session.amount_total / 100, // Total de la compra completa
					currency: session.currency.toUpperCase(),
					ticketCodes: createdTickets.map(t => t.ticketCode).join(', ')
				}, 
				updatedEvent, 
				pdfBuffer
			);
			console.log('✅ Email sent successfully');
			
			console.log(`🎉 WEBHOOK COMPLETED: ${quantity} tickets created and sent to ${session.customer_email}`);
			console.log(`📋 Ticket codes: ${createdTickets.map(t => t.ticketCode).join(', ')}`);
			
		} catch (error) {
			console.error('❌ Error processing webhook:', error);
			console.error('Stack trace:', error.stack);
			// Registrar el error pero no fallar el webhook
			// Stripe reintentará si falla
		}
	} else {
		console.log('ℹ️ Ignored event type:', event.type);
	}

	res.json({ received: true });
};

/**
 * GET /api/tickets/info/:validationCode
 * Obtener información pública del ticket (NO requiere autenticación)
 */
const getTicketInfo = async (req, res) => {
	try {
		const { validationCode } = req.params;

		const ticket = await Ticket.findOne({ validationCode }).populate('eventId');
		
		if (!ticket) {
			return res.status(404).json({ 
				error: 'Ticket no encontrado' 
			});
		}

		// Información pública del ticket
		res.json({
			event: {
				name: ticket.eventId.name,
				date: ticket.eventId.date,
				location: ticket.eventId.location,
				img: ticket.eventId.img
			},
			ticket: {
				code: ticket.ticketCode,
				validated: ticket.validated,
				validatedAt: ticket.validatedAt,
				quantity: ticket.quantity,
				// NO devolver información sensible como email del comprador en endpoint público
			}
		});

	} catch (error) {
		console.error('Error fetching ticket info:', error);
		res.status(500).json({ 
			error: 'Error al obtener información del ticket' 
		});
	}
};

/**
 * POST /api/tickets/validate/:validationCode
 * Marcar un ticket como validado (REQUIERE autenticación + rol staff/admin)
 */
const validateTicketByCode = async (req, res) => {
	try {
		const { validationCode } = req.params;

		// Incrementar contador de intentos
		await Ticket.findOneAndUpdate(
			{ validationCode },
			{ 
				$inc: { validationAttempts: 1 },
				lastAttemptAt: new Date()
			}
		);

		const ticket = await Ticket.findOne({ validationCode }).populate('eventId');
		
		if (!ticket) {
			return res.status(404).json({ 
				error: 'Ticket no encontrado' 
			});
		}

		if (ticket.validated) {
			return res.status(409).json({ 
				error: 'Este ticket ya fue validado anteriormente',
				validatedAt: ticket.validatedAt,
				validatedBy: ticket.validatedBy
			});
		}

		if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
			return res.status(400).json({ 
				error: 'El ticket no está en estado válido para ser usado',
				status: ticket.status
			});
		}

		// Marcar como validado
		ticket.validated = true;
		ticket.validatedAt = new Date();
		ticket.validatedBy = req.userId; // Del middleware requireStaffOrAdmin
		ticket.status = 'validated';
		await ticket.save();

		res.json({
			success: true,
			message: 'Ticket validado correctamente',
			ticket: {
				code: ticket.ticketCode,
				customerName: ticket.customerName,
				customerEmail: ticket.customerEmail,
				quantity: ticket.quantity,
				eventName: ticket.eventId.name,
				validatedAt: ticket.validatedAt
			}
		});

	} catch (error) {
		console.error('Error validating ticket:', error);
		res.status(500).json({ 
			error: 'Error al validar el ticket' 
		});
	}
};

/**
 * GET /api/tickets/download/:ticketId
 * Regenerar y descargar el PDF del ticket (solo el comprador)
 */
const downloadTicket = async (req, res) => {
	try {
		const { ticketId } = req.params;
		const user = req.auth || req.user;
		
		// El email puede estar en diferentes lugares según la configuración de Auth0
		const userEmail = user?.email 
			|| user?.['https://otp-records.com/email'] 
			|| user?.['http://otp-records.com/email'];

		if (!userEmail) {
			return res.status(401).json({ error: 'Usuario no autenticado - email no encontrado' });
		}

		const ticket = await Ticket.findById(ticketId).populate('eventId');

		if (!ticket) {
			return res.status(404).json({ error: 'Ticket no encontrado' });
		}

		// Verificar que el ticket pertenece al usuario
		if (ticket.customerEmail !== userEmail) {
			return res.status(403).json({ 
				error: 'No tienes permisos para descargar este ticket' 
			});
		}

		// Generar PDF
		const pdfBuffer = await generateTicketPDF(ticket, ticket.eventId);

		// Enviar como descarga
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketCode}.pdf"`);
		res.send(pdfBuffer);

	} catch (error) {
		console.error('Error downloading ticket:', error);
		res.status(500).json({ 
			error: 'Error al descargar el ticket' 
		});
	}
};

/**
 * GET /api/tickets/verify/:ticketCode
 * Verificar validez de un ticket por su código
 */
const verifyTicket = async (req, res) => {
	try {
		const { ticketCode } = req.params;

		const ticket = await Ticket.findOne({ ticketCode }).populate('eventId');
		
		if (!ticket) {
			return res.status(404).json({ 
				valid: false,
				error: 'Ticket no encontrado' 
			});
		}

		if (ticket.status !== 'completed') {
			return res.status(400).json({ 
				valid: false,
				error: 'El ticket no está activo',
				status: ticket.status
			});
		}

		if (ticket.validated) {
			return res.status(200).json({
				valid: true,
				alreadyUsed: true,
				message: 'Este ticket ya fue validado anteriormente',
				validatedAt: ticket.validatedAt,
				ticket: {
					code: ticket.ticketCode,
					customerName: ticket.customerName,
					quantity: ticket.quantity,
					eventName: ticket.eventId.name,
					eventDate: ticket.eventId.date
				}
			});
		}

		res.json({
			valid: true,
			alreadyUsed: false,
			ticket: {
				code: ticket.ticketCode,
				customerName: ticket.customerName,
				customerEmail: ticket.customerEmail,
				quantity: ticket.quantity,
				eventName: ticket.eventId.name,
				eventDate: ticket.eventId.date,
				eventLocation: ticket.eventId.location
			}
		});

	} catch (error) {
		console.error('Error verifying ticket:', error);
		res.status(500).json({ 
			error: 'Error al verificar el ticket' 
		});
	}
};

/**
 * POST /api/tickets/validate/:ticketCode
 * Marcar un ticket como validado (usado en el evento)
 */
const validateTicket = async (req, res) => {
	try {
		const { ticketCode } = req.params;

		const ticket = await Ticket.findOne({ ticketCode }).populate('eventId');
		
		if (!ticket) {
			return res.status(404).json({ 
				error: 'Ticket no encontrado' 
			});
		}

		if (ticket.validated) {
			return res.status(400).json({ 
				error: 'Este ticket ya fue validado anteriormente',
				validatedAt: ticket.validatedAt
			});
		}

		if (ticket.status !== 'completed') {
			return res.status(400).json({ 
				error: 'El ticket no está en estado válido para ser usado',
				status: ticket.status
			});
		}

		// Marcar como validado
		ticket.validated = true;
		ticket.validatedAt = new Date();
		await ticket.save();

		res.json({
			success: true,
			message: 'Ticket validado correctamente',
			ticket: {
				code: ticket.ticketCode,
				customerName: ticket.customerName,
				quantity: ticket.quantity,
				eventName: ticket.eventId.name,
				validatedAt: ticket.validatedAt
			}
		});

	} catch (error) {
		console.error('Error validating ticket:', error);
		res.status(500).json({ 
			error: 'Error al validar el ticket' 
		});
	}
};

/**
 * GET /api/tickets/my-tickets
 * Obtener tickets del usuario actual (requiere autenticación)
 */
const getMyTickets = async (req, res) => {
	try {
		// express-jwt v8+ usa req.auth en lugar de req.user
		const user = req.auth || req.user;
		
		console.log('🔍 getMyTickets - User object:', JSON.stringify(user, null, 2));
		
		// El email puede estar en diferentes lugares según la configuración de Auth0
		const userEmail = user?.email 
			|| user?.['https://otp-records.com/email'] 
			|| user?.['http://otp-records.com/email'];

		console.log('📧 Extracted email:', userEmail);

		if (!userEmail) {
			console.error('❌ No email found in token');
			return res.status(401).json({ 
				error: 'Usuario no autenticado - email no encontrado en el token',
				debug: {
					hasAuth: !!req.auth,
					hasUser: !!req.user,
					authKeys: req.auth ? Object.keys(req.auth) : [],
					userKeys: req.user ? Object.keys(req.user) : []
				}
			});
		}

		const tickets = await Ticket.find({ 
			customerEmail: userEmail,
			status: { $in: ['active', 'validated'] }
		})
		.populate('eventId')
		.sort({ createdAt: -1 });

		// Agrupar tickets por purchaseId para mostrar compras
		const purchasesMap = new Map();
		
		tickets.forEach(ticket => {
			if (!purchasesMap.has(ticket.purchaseId)) {
				purchasesMap.set(ticket.purchaseId, {
					purchaseId: ticket.purchaseId,
					purchaseDate: ticket.createdAt,
					totalAmount: ticket.totalAmount,
					currency: ticket.currency,
					event: {
						id: ticket.eventId._id,
						name: ticket.eventId.name,
						date: ticket.eventId.date,
						location: ticket.eventId.location,
						img: ticket.eventId.img
					},
					tickets: []
				});
			}
			
			purchasesMap.get(ticket.purchaseId).tickets.push({
				id: ticket._id,
				ticketCode: ticket.ticketCode,
				validationCode: ticket.validationCode,
				ticketNumber: ticket.ticketNumber,
				validated: ticket.validated,
				validatedAt: ticket.validatedAt
			});
		});

		res.json({
			purchases: Array.from(purchasesMap.values()),
			totalTickets: tickets.length
		});

	} catch (error) {
		console.error('Error fetching user tickets:', error);
		res.status(500).json({ 
			error: 'Error al obtener los tickets' 
		});
	}
};

/**
 * GET /api/tickets/event/:eventId/sales
 * Obtener estadísticas de ventas de un evento (solo admin)
 */
const getEventSales = async (req, res) => {
	try {
		const { eventId } = req.params;

		const event = await Event.findById(eventId);
		if (!event) {
			return res.status(404).json({ error: 'Evento no encontrado' });
		}

		const tickets = await Ticket.find({ 
			eventId,
			status: 'completed'
		}).sort({ createdAt: -1 });

		const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);

		res.json({
			event: {
				id: event._id,
				name: event.name,
				date: event.date
			},
			sales: {
				totalTickets: event.totalTickets,
				ticketsSold: event.ticketsSold,
				availableTickets: event.availableTickets,
				totalRevenue: totalRevenue,
				currency: event.ticketCurrency
			},
			tickets: tickets.map(ticket => ({
				id: ticket._id,
				ticketCode: ticket.ticketCode,
				customerName: ticket.customerName,
				customerEmail: ticket.customerEmail,
				quantity: ticket.quantity,
				totalAmount: ticket.totalAmount,
				validated: ticket.validated,
				purchaseDate: ticket.createdAt
			}))
		});

	} catch (error) {
		console.error('Error fetching event sales:', error);
		res.status(500).json({ 
			error: 'Error al obtener estadísticas de ventas' 
		});
	}
};

/**
 * GET /api/tickets/debug/all
 * Ver TODOS los tickets en la base de datos (solo para debugging)
 */
const debugGetAllTickets = async (req, res) => {
	try {
		const tickets = await Ticket.find()
			.populate('eventId', 'name date location')
			.sort({ createdAt: -1 })
			.limit(50);

		res.json({
			total: tickets.length,
			tickets: tickets.map(ticket => ({
				id: ticket._id,
				ticketCode: ticket.ticketCode,
				validationCode: ticket.validationCode,
				customerName: ticket.customerName,
				customerEmail: ticket.customerEmail,
				purchaseQuantity: ticket.purchaseQuantity,
				ticketNumber: ticket.ticketNumber,
				totalAmount: ticket.totalAmount,
				currency: ticket.currency,
				validated: ticket.validated,
				status: ticket.status,
				purchaseDate: ticket.createdAt,
				purchaseId: ticket.purchaseId,
				event: ticket.eventId ? {
					name: ticket.eventId.name,
					date: ticket.eventId.date
				} : null
			}))
		});

	} catch (error) {
		console.error('Error fetching all tickets:', error);
		res.status(500).json({ 
			error: 'Error al obtener tickets',
			details: error.message 
		});
	}
};

module.exports = {
	createCheckoutSession,
	handleWebhook,
	getTicketInfo,
	validateTicketByCode,
	downloadTicket,
	verifyTicket,
	validateTicket,
	getMyTickets,
	getEventSales,
	debugGetAllTickets
};
