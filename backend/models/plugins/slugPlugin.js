/**
 * Plugin de Mongoose: añade `slug` (único) y lo genera al crear el documento.
 * Ver utils/slug.js.
 */
const { slugFor } = require('../../utils/slug');

module.exports = function slugPlugin(schema) {
    schema.add({ slug: { type: String, trim: true, lowercase: true, default: undefined } });
    schema.index({ slug: 1 }, { unique: true, sparse: true });

    schema.pre('validate', async function () {
        if (this.slug) return;
        this.slug = await slugFor(this.constructor, this);
    });
};
