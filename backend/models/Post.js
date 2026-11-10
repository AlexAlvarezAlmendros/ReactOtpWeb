const mongoose = require('mongoose');

/**
 * Artículo de la revista /revista (Fase 4.6 del plan SEO): guías para
 * artistas, escena y producción. El contenido es HTML del editor Tiptap.
 */
const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    excerpt: { type: String, trim: true, maxlength: 320, default: '' }, // entradilla y meta description
    content: { type: String, required: true },                          // HTML de Tiptap
    coverImage: { type: String, trim: true, default: '' },
    category: {
        type: String,
        enum: ['guias', 'escena', 'produccion', 'noticias'],
        default: 'guias'
    },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    // Autor real con nombre: cuenta para la confianza del contenido.
    author: {
        name: { type: String, trim: true, required: true },
        url: { type: String, trim: true, default: '' } // p. ej. su ficha de artista
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
    userId: { type: String, required: true }
}, {
    timestamps: true
});

// Al publicar por primera vez, fija la fecha de publicación.
postSchema.pre('validate', function () {
    if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});

postSchema.index({ status: 1, publishedAt: -1 });

postSchema.plugin(require('./plugins/slugPlugin'));
postSchema.plugin(require('../services/indexNowService').indexNowPlugin);

module.exports = mongoose.model('Post', postSchema);
