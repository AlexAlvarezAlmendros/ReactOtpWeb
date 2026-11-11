const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
	// Usaremos el _id de MongoDB en lugar de un id UUID por simplicidad MERN.
	// Si necesitas el UUID, podemos usar una librería como 'uuid'.
	name: { type: String, required: true },
	genre: { type: String, required: true },
	spotifyLink: { type: String, required: false },
	youtubeLink: { type: String, required: false },
	appleMusicLink: { type: String, required: false },
	instagramLink: { type: String, required: false },
	soundCloudLink: { type: String, required: false },
	beatStarsLink: { type: String, required: false },
	img: { type: String, required: true },
	// Biografía larga para la ficha pública (150–400 palabras). La ficha sin
	// bio es una plantilla y Google no la indexa. linksBio es otra cosa: la
	// frase corta de la página de enlaces /l/:slug.
	bio: { type: String, trim: true, maxlength: 5000, default: '' },
	// Datos de la ficha pública y del JSON-LD MusicGroup (Fase 3.2 del plan SEO).
	city: { type: String, trim: true, default: '' }, // «Igualada (Barcelona)»
	activeSince: { type: Number, min: 1950, max: 2100, default: null },
	pressQuotes: [{
		_id: false,
		quote: { type: String, trim: true, required: true, maxlength: 400 },
		source: { type: String, trim: true, required: true },
		url: { type: String, trim: true, default: '' }
	}],
	videos: [{
		_id: false,
		title: { type: String, trim: true, required: true },
		url: { type: String, trim: true, required: true } // YouTube
	}],
	profileUrl: { type: String, required: false },
	artistType: {
		type: String,
		required: false,
		default: ''
	},
	userId: { type: String, required: true }, // Podría ser un ObjectId si tienes una colección de Users
	// Links page
	linksSlug: { type: String, default: null },
	linksBio: { type: String, default: '' },
	customLinks: [{
		_id: false,
		label: { type: String, required: true },
		url: { type: String, required: true },
		icon: { type: String, default: '' }
	}],
	// Sincronización de discografía desde Spotify
	spotifyArtistId: { type: String, default: null },
	spotifySyncEnabled: { type: Boolean, default: true },
	// true: los lanzamientos nuevos se publican solos. false (por defecto):
	// entran como borradores y hay que aceptarlos en el panel. Ver utils/releaseStatus.js.
	spotifyAutoPublish: { type: Boolean, default: false },
	spotifySyncedAt: { type: Date, default: null },
	spotifySyncError: { type: String, default: null }
}, {
	timestamps: true // Esto añade createdAt y updatedAt automáticamente
});

artistSchema.index({ linksSlug: 1 }, { unique: true, sparse: true });

// Nota sobre el campo 'id':
// Mongoose por defecto crea un campo virtual 'id' que es una representación en string del '_id' de MongoDB.
// Así que no necesitamos definirlo explícitamente en el schema.

artistSchema.plugin(require('./plugins/slugPlugin'));
artistSchema.plugin(require('../services/indexNowService').indexNowPlugin);

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;

