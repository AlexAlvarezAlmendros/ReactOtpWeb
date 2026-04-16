const Studio = require('../models/Studio');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');
const { isUserAdmin } = require('../utils/authHelpers');
const { buildFilter, buildQueryOptions, validateFilters, FILTER_CONFIGS } = require('../utils/filterHelpers');

// GET all studios with filtering
const getStudios = async (req, res) => {
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
		const filter = buildFilter(req.query, FILTER_CONFIGS.studios);
		const options = buildQueryOptions(req.query);

		// Studios don't have a 'date' field, so we'll sort by createdAt
		if (options.sort.date) {
			options.sort = { createdAt: options.sort.date };
		}

		// Execute query with filters
		const studios = await Studio.find(filter)
			.sort(options.sort)
			.limit(options.limit)
			.skip(options.skip);

		// Get total count for pagination info
		const totalCount = await Studio.countDocuments(filter);

		// Response with pagination metadata
		res.status(200).json({
			data: studios,
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

// GET a single studio
const getStudio = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: 'ID de estudio no válido' });
	}
	try {
		const studio = await Studio.findById(id);
		if (!studio) {
			return res.status(404).json({ error: 'Estudio no encontrado' });
		}
		res.status(200).json(studio);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// CREATE a new studio
const createStudio = async (req, res) => {
	try {
		// Obtener userId del token JWT
		const user = req.auth || req.user;
		const userId = user.sub;
		
		const studioData = {
			...req.body,
			userId: userId // Asegurar que el userId viene del token
		};
		
		const studio = await Studio.create(studioData);
		res.status(201).json(studio);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// UPDATE a studio
const updateStudio = async (req, res) => {
	const { id } = req.params;
	console.log('PUT/PATCH /studios/:id - req.body:', JSON.stringify(req.body, null, 2));
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: 'ID de estudio no válido' });
	}
	
	try {
		const user = req.auth || req.user;
		const userId = user.sub;
		
		
		// Si no es admin, verificar que sea el dueño del recurso
		if (!isUserAdmin(user)) {
			const existingStudio = await Studio.findById(id);
			if (!existingStudio) {
				return res.status(404).json({ error: 'Estudio no encontrado' });
			}
			if (existingStudio.userId !== userId) {
				return res.status(403).json({ error: 'No tienes permisos para modificar este estudio' });
			}
		}
		
		const studio = await Studio.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
		if (!studio) {
			return res.status(404).json({ error: 'Estudio no encontrado' });
		}
		res.status(200).json(studio);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// DELETE a studio
const deleteStudio = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: 'ID de estudio no válido' });
	}
	
	try {
		const user = req.auth || req.user;
		const userId = user.sub;
		
		
		// Si no es admin, verificar que sea el dueño del recurso
		if (!isUserAdmin(user)) {
			const existingStudio = await Studio.findById(id);
			if (!existingStudio) {
				return res.status(404).json({ error: 'Estudio no encontrado' });
			}
			if (existingStudio.userId !== userId) {
				return res.status(403).json({ error: 'No tienes permisos para eliminar este estudio' });
			}
		}
		
		const studio = await Studio.findByIdAndDelete(id);
		if (!studio) {
			return res.status(404).json({ error: 'Estudio no encontrado' });
		}
		res.status(200).json({ message: 'Estudio eliminado correctamente' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getStudios,
	getStudio,
	createStudio,
	updateStudio,
	deleteStudio
};
