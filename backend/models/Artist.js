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
	}]
}, {
	timestamps: true // Esto añade createdAt y updatedAt automáticamente
});

artistSchema.index({ linksSlug: 1 }, { unique: true, sparse: true });

// Nota sobre el campo 'id':
// Mongoose por defecto crea un campo virtual 'id' que es una representación en string del '_id' de MongoDB.
// Así que no necesitamos definirlo explícitamente en el schema.

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;

