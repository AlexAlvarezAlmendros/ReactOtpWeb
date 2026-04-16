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
    userId: { type: String, required: true } // Podría ser un ObjectId si tienes una colección de Users
}, {
    timestamps: true // Esto añade createdAt y updatedAt automáticamente
});

// Nota sobre el campo 'id':
// Mongoose por defecto crea un campo virtual 'id' que es una representación en string del '_id' de MongoDB.
// Así que no necesitamos definirlo explícitamente en el schema.

const Release = mongoose.model('Release', releaseSchema);

module.exports = Release;
