const Event = require('../models/Event');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');
const { isUserAdmin } = require('../utils/authHelpers');
const { buildFilter, buildQueryOptions, validateFilters, FILTER_CONFIGS } = require('../utils/filterHelpers');
const { uploadImageToImgBB } = require('../utils/imageUpload');

// GET all events with filtering
const getEvents = async (req, res) => {
    try {
        // Ensure database connection
        await connectDB();
        
        // Validate filter parameters
        const validation = validateFilters(req.query);
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Invalid filter parameters', 
                details: validation.errors 
            });
        }

        // Build filter and options
        const filter = buildFilter(req.query, FILTER_CONFIGS.events);
        const options = buildQueryOptions(req.query);

        // Execute query with filters
        const events = await Event.find(filter)
            .sort(options.sort)
            .limit(options.limit)
            .skip(options.skip);

        // Get total count for pagination info
        const totalCount = await Event.countDocuments(filter);

        // Response with pagination metadata
        res.status(200).json({
            data: events,
            pagination: {
                page: parseInt(req.query.page) || 1,
                count: options.limit,
                total: totalCount,
                pages: Math.ceil(totalCount / options.limit)
            },
            filters: filter
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// GET a single event
const getEvent = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID de evento no válido' });
    }
    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE a new event
const createEvent = async (req, res) => {
    try {
        // Obtener userId del token JWT
        const user = req.auth || req.user;
        const userId = user.sub;
        
        let imageUrl = req.body.img;
        
        // Si se subió una imagen, comprimirla y subirla a ImgBB
        if (req.file) {
            imageUrl = await uploadImageToImgBB(req.file.buffer, req.body.name, req.file.mimetype);
        }
        
        const eventData = {
            ...req.body,
            img: imageUrl,
            userId: userId // Asegurar que el userId viene del token
        };
        
        // Validación condicional: si ticketsEnabled y NO hay URL externa
        if (eventData.ticketsEnabled && !eventData.externalTicketUrl) {
            // Para entradas internas (Stripe), validar campos requeridos
            if (!eventData.ticketPrice || eventData.ticketPrice <= 0) {
                return res.status(400).json({ 
                    error: 'Para entradas internas, ticketPrice debe ser mayor a 0' 
                });
            }
            if (!eventData.totalTickets || eventData.totalTickets <= 0) {
                return res.status(400).json({ 
                    error: 'Para entradas internas, totalTickets debe ser mayor a 0' 
                });
            }
            // Inicializar availableTickets si no está definido
            if (eventData.availableTickets === undefined) {
                eventData.availableTickets = eventData.totalTickets;
            }
        }
        
        const event = await Event.create(eventData);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// UPDATE a event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    console.log('PUT/PATCH /events/:id - req.body:', JSON.stringify(req.body, null, 2));
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID de evento no válido' });
    }
    
    try {
        const user = req.auth || req.user;
        const userId = user.sub;
        
        let updateData = { ...req.body };
        
        // Si se subió una nueva imagen, comprimirla y subirla a ImgBB
        if (req.file) {
            updateData.img = await uploadImageToImgBB(req.file.buffer, req.body.name, req.file.mimetype);
        }
        
        // Si no es admin, verificar que sea el dueño del recurso
        if (!isUserAdmin(user)) {
            const existingEvent = await Event.findById(id);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Evento no encontrado' });
            }
            if (existingEvent.userId !== userId) {
                return res.status(403).json({ error: 'No tienes permisos para modificar este evento' });
            }
        }
        
        // Validación condicional: si ticketsEnabled y NO hay URL externa
        if (req.body.ticketsEnabled && !req.body.externalTicketUrl) {
            // Para entradas internas (Stripe), validar campos requeridos si se están actualizando
            if (req.body.ticketPrice !== undefined && req.body.ticketPrice <= 0) {
                return res.status(400).json({ 
                    error: 'Para entradas internas, ticketPrice debe ser mayor a 0' 
                });
            }
            if (req.body.totalTickets !== undefined && req.body.totalTickets <= 0) {
                return res.status(400).json({ 
                    error: 'Para entradas internas, totalTickets debe ser mayor a 0' 
                });
            }
        }
        
        const event = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE a event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID de evento no válido' });
    }
    
    try {
        const user = req.auth || req.user;
        const userId = user.sub;
        
        
        // Si no es admin, verificar que sea el dueño del recurso
        if (!isUserAdmin(user)) {
            const existingEvent = await Event.findById(id);
            if (!existingEvent) {
                return res.status(404).json({ error: 'Evento no encontrado' });
            }
            if (existingEvent.userId !== userId) {
                return res.status(403).json({ error: 'No tienes permisos para eliminar este evento' });
            }
        }
        
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        res.status(200).json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};
