const mongoose = require('mongoose');
const DemoSubmission = require('../models/DemoSubmission');
const EmailService = require('../services/emailService');
const { sendDemoEmails } = require('../services/demoEmails');
const connectDB = require('../utils/dbConnection');

const emailService = new EmailService();

// Límite por IP: 3 maquetas por hora. En serverless es por instancia, así
// que es una barrera contra el spam fácil, no una garantía.
const attempts = new Map();
const MAX_PER_HOUR = 3;
const WINDOW_MS = 60 * 60 * 1000;

const checkDemoRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_HOUR) {
        return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Has enviado varias maquetas seguidas. Prueba dentro de una hora.' });
    }
    recent.push(now);
    attempts.set(ip, recent);
    next();
};

const toList = (value, max) => (Array.isArray(value) ? value : String(value || '').split(','))
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, max);

// POST /api/demos — pública
const createDemo = async (req, res) => {
    try {
        await connectDB();
        const body = req.body || {};

        // Campo trampa: los humanos no lo ven; los bots lo rellenan.
        if (body.website) return res.status(201).json({ success: true });

        const links = toList(body.links, 5).filter((l) => /^https?:\/\//i.test(l));
        const demo = await DemoSubmission.create({
            artistName: body.artistName,
            realName: body.realName,
            email: body.email,
            city: body.city,
            genres: toList(body.genres, 6),
            links,
            instagram: body.instagram,
            message: body.message,
            consent: body.consent === true || body.consent === 'true',
            ipAddress: req.ip || ''
        });

        try {
            const result = await sendDemoEmails(emailService, demo);
            await DemoSubmission.updateOne({ _id: demo._id }, { emailStatus: result.admin ? 'sent' : 'failed' });
        } catch (err) {
            console.error('❌ [demos] Error enviando correos:', err.message);
            await DemoSubmission.updateOne({ _id: demo._id }, { emailStatus: 'failed' });
        }

        res.status(201).json({ success: true, id: demo._id });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: 'Revisa los datos del formulario',
                details: Object.values(error.errors).map((e) => e.message)
            });
        }
        console.error('❌ [demos]', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'No hemos podido guardar tu maqueta. Inténtalo de nuevo.' });
    }
};

// GET /api/demos — admin
const listDemos = async (req, res) => {
    try {
        await connectDB();
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const count = Math.min(100, Math.max(1, parseInt(req.query.count, 10) || 50));
        const filter = req.query.status ? { status: req.query.status } : {};
        const [data, total] = await Promise.all([
            DemoSubmission.find(filter).sort({ createdAt: -1 }).skip((page - 1) * count).limit(count),
            DemoSubmission.countDocuments(filter)
        ]);
        res.json({ data, pagination: { page, count, total, pages: Math.ceil(total / count) } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/demos/:id — admin (estado y notas)
const updateDemo = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: 'Maqueta no encontrada' });
    try {
        await connectDB();
        const update = {};
        if (req.body.status) update.status = req.body.status;
        if (typeof req.body.notes === 'string') update.notes = req.body.notes;
        const demo = await DemoSubmission.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!demo) return res.status(404).json({ error: 'Maqueta no encontrada' });
        res.json(demo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createDemo, listDemos, updateDemo, checkDemoRateLimit };
