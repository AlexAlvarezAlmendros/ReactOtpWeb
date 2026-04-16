const Release = require('../models/Release');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');
const { isUserAdmin } = require('../utils/authHelpers');
const { buildFilter, buildQueryOptions, validateFilters, FILTER_CONFIGS } = require('../utils/filterHelpers');
const axios = require('axios');
const FormData = require('form-data');

// Helper function para subir imagen a ImgBB
const uploadImageToImgBB = async (imageBuffer, imageName) => {
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    
    if (!IMGBB_API_KEY) {
        throw new Error('API Key de ImgBB no configurada');
    }

    const base64Image = imageBuffer.toString('base64');
    const formData = new FormData();
    formData.append('image', base64Image);
    
    if (imageName) {
        formData.append('name', imageName);
    }

    const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );

    if (response.data.success) {
        return response.data.data.url;
    } else {
        throw new Error('Error al subir imagen a ImgBB');
    }
};

// GET all releases with filtering
const getReleases = async (req, res) => {
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
        const filter = buildFilter(req.query, FILTER_CONFIGS.releases);
        const options = buildQueryOptions(req.query);

        // Execute query with filters
        const releases = await Release.find(filter)
            .sort(options.sort)
            .limit(options.limit)
            .skip(options.skip);

        // Get total count for pagination info
        const totalCount = await Release.countDocuments(filter);

        // Response with pagination metadata
        res.status(200).json({
            data: releases,
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

// GET a single release
const getRelease = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID de release no válido' });
    }
    try {
        const release = await Release.findById(id);
        if (!release) {
            return res.status(404).json({ error: 'Release no encontrado' });
        }
        res.status(200).json(release);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE a new release
const createRelease = async (req, res) => {
    try {
        // Obtener userId del token JWT (express-jwt v8+ usa req.auth)
        const user = req.auth || req.user;
        const userId = user.sub;
        
        let imageUrl = req.body.img;
        
        // Si se subió una imagen, subirla a ImgBB
        if (req.file) {
            imageUrl = await uploadImageToImgBB(req.file.buffer, req.body.title);
        }
        
        const releaseData = {
            ...req.body,
            img: imageUrl,
            userId: userId // Asegurar que el userId viene del token
        };
        
        const release = await Release.create(releaseData);
        res.status(201).json(release);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// UPDATE a release
const updateRelease = async (req, res) => {
    const { id } = req.params;
    console.log('PUT/PATCH /releases/:id - req.body:', JSON.stringify(req.body, null, 2));
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('ID de release no válido', id);
        return res.status(404).json({ error: 'ID de release no válido' });
    }
    
    try {
        const user = req.auth || req.user;
        const userId = user.sub;

        // Si no es admin, verificar que sea el dueño del recurso
        if (!isUserAdmin(user)) {
            const existingRelease = await Release.findById(id);
            if (!existingRelease) {
                return res.status(404).json({ error: 'Release no encontrado' });
            }
            if (existingRelease.userId !== userId) {
                return res.status(403).json({ error: 'No tienes permisos para modificar este release' });
            }
        }
        
        let updateData = { ...req.body };
        
        // Si se subió una nueva imagen, subirla a ImgBB
        if (req.file) {
            updateData.img = await uploadImageToImgBB(req.file.buffer, req.body.title);
        }
        
        const release = await Release.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!release) {
            return res.status(404).json({ error: 'Release no encontrado' });
        }
        res.status(200).json(release);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET releases by artist name in subtitle
const getReleasesByArtist = async (req, res) => {
    try {
        const { artist } = req.params;
        
        if (!artist) {
            return res.status(400).json({ error: 'Nombre del artista es requerido' });
        }

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter to search for artist name in subtitle (case insensitive)
        // This will match artist names even when separated by commas
        const filter = {
            subtitle: { 
                $regex: new RegExp(artist.trim(), 'i') 
            }
        };

        // Execute query with pagination
        const releases = await Release.find(filter)
            .sort({ date: -1 }) // Sort by date descending (newest first)
            .limit(limit)
            .skip(skip);

        // Get total count for pagination info
        const totalCount = await Release.countDocuments(filter);

        // Response with pagination metadata
        res.status(200).json({
            data: releases,
            pagination: {
                page: page,
                limit: limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            },
            artist: artist,
            message: totalCount === 0 ? `No se encontraron releases para el artista: ${artist}` : `Se encontraron ${totalCount} releases para el artista: ${artist}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE a release
const deleteRelease = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'ID de release no válido' });
    }
    
    try {
        const user = req.auth || req.user;
        const userId = user.sub;

        // Si no es admin, verificar que sea el dueño del recurso
        if (!isUserAdmin(user)) {
            const existingRelease = await Release.findById(id);
            if (!existingRelease) {
                return res.status(404).json({ error: 'Release no encontrado' });
            }
            if (existingRelease.userId !== userId) {
                return res.status(403).json({ error: 'No tienes permisos para eliminar este release' });
            }
        }
        
        const release = await Release.findByIdAndDelete(id);
        if (!release) {
            return res.status(404).json({ error: 'Release no encontrado' });
        }
        res.status(200).json({ message: 'Release eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getReleases,
    getRelease,
    createRelease,
    updateRelease,
    deleteRelease,
    getReleasesByArtist
};

