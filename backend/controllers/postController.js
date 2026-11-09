const Post = require('../models/Post');
const connectDB = require('../utils/dbConnection');
const { findByIdOrSlug } = require('../utils/slug');
const { isUserAdmin, getUserPermissionsAndRoles } = require('../utils/authHelpers');

const PUBLIC_FIELDS = '-userId';

/** ¿Puede ver borradores? (staff o admin autenticado, como requireStaffOrAdmin). */
function canSeeDrafts(req) {
    const user = req.auth || req.user;
    if (!user) return false;
    if (isUserAdmin(user)) return true;
    const { roles } = getUserPermissionsAndRoles(user);
    return Array.isArray(roles) && roles.some((r) => ['staff', 'admin'].includes(String(r).toLowerCase()));
}

// GET /api/posts — publicados (los borradores, solo para el panel)
const getPosts = async (req, res) => {
    try {
        await connectDB();
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const count = Math.min(100, Math.max(1, parseInt(req.query.count, 10) || 12));
        const filter = {};
        if (req.query.status === 'all' && canSeeDrafts(req)) {
            // Panel: publicados y borradores.
        } else if (req.query.status === 'draft' && canSeeDrafts(req)) {
            filter.status = 'draft';
        } else {
            filter.status = 'published';
        }
        if (req.query.category) filter.category = req.query.category;
        if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();

        const sort = filter.status === 'published' ? { publishedAt: -1 } : { updatedAt: -1 };
        // En los listados no hace falta el cuerpo entero.
        const projection = req.query.full === '1' ? PUBLIC_FIELDS : `${PUBLIC_FIELDS} -content`;
        const [data, total] = await Promise.all([
            Post.find(filter).select(projection).sort(sort).skip((page - 1) * count).limit(count),
            Post.countDocuments(filter)
        ]);
        res.json({ data, pagination: { page, count, total, pages: Math.ceil(total / count) } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/posts/:idOrSlug
const getPost = async (req, res) => {
    try {
        await connectDB();
        const post = await findByIdOrSlug(Post, req.params.id).select(PUBLIC_FIELDS);
        if (!post || (post.status !== 'published' && !canSeeDrafts(req))) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const EDITABLE = ['title', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'author', 'status'];

function pick(body) {
    const data = {};
    for (const key of EDITABLE) if (body[key] !== undefined) data[key] = body[key];
    if (typeof data.tags === 'string') data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    return data;
}

// POST /api/posts — staff
const createPost = async (req, res) => {
    try {
        await connectDB();
        const user = req.auth || req.user;
        const post = await Post.create({ ...pick(req.body), userId: user.sub });
        res.status(201).json(post);
    } catch (error) {
        res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
    }
};

// PATCH /api/posts/:id — staff
const updatePost = async (req, res) => {
    try {
        await connectDB();
        const post = await findByIdOrSlug(Post, req.params.id);
        if (!post) return res.status(404).json({ error: 'Artículo no encontrado' });
        Object.assign(post, pick(req.body));
        await post.save(); // save (no findOneAndUpdate): ejecuta publishedAt y el aviso de IndexNow
        res.json(post);
    } catch (error) {
        res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
    }
};

// DELETE /api/posts/:id — staff
const deletePost = async (req, res) => {
    try {
        await connectDB();
        const post = await findByIdOrSlug(Post, req.params.id);
        if (!post) return res.status(404).json({ error: 'Artículo no encontrado' });
        await Post.findOneAndDelete({ _id: post._id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
