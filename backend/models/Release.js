const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const releaseSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    spotifyLink: { type: String, required: false },
    youtubeLink: { type: String, required: false },
    appleMusicLink: { type: String, required: false },
    instagramLink: { type: String, required: false },
    soundCloudLink: { type: String, required: false },
    beatStarsLink: { type: String, required: false },
    img: { type: String, required: true },
    releaseType: { 
        type: String, 
        required: true,
        enum: ['Song', 'Album', 'EP', 'Videoclip'] // Puedes definir los tipos permitidos
    },
    date: { type: Date, required: true },
    userId: { type: String, required: true }, // Podría ser un ObjectId si tienes una colección de Users
    // Sincronización con Spotify
    spotifyAlbumId: { type: String, default: null },
    source: {
        type: String,
        enum: ['manual', 'spotify'],
        default: 'manual'
    },
    artistIds: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
    spotifySyncedAt: { type: Date, default: null }
}, {
    timestamps: true // Esto añade createdAt y updatedAt automáticamente
});

// Índice único disperso: garantiza que un álbum de Spotify solo se importe una vez,
// pero permite tantos releases manuales sin spotifyAlbumId como haga falta.
releaseSchema.index({ spotifyAlbumId: 1 }, { unique: true, sparse: true });
releaseSchema.index({ artistIds: 1 });

// Nota sobre el campo 'id':
// Mongoose por defecto crea un campo virtual 'id' que es una representación en string del '_id' de MongoDB.
// Así que no necesitamos definirlo explícitamente en el schema.

const Release = mongoose.model('Release', releaseSchema);

module.exports = Release;
