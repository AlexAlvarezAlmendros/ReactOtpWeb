const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beatSchema = new Schema({
    title: { type: String, required: true },
    bpm: { type: Number },
    key: { type: String },
    genre: { type: String },
    tags: [{ type: String }],
    price: { type: Number, required: true },
    audioUrl: { type: String },
    coverUrl: { type: String },
    // If beats are related to artists/producers
    producer: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    colaboradores: [{ type: String }],
    active: { type: Boolean, default: true },
    
    // Licenses for beat purchases
    licenses: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        formats: [{ 
            type: String, 
            enum: ['MP3', 'WAV', 'STEMS'],
            required: true 
        }],
        files: {
            mp3Url: { type: String },
            wavUrl: { type: String },
            stemsUrl: { type: String }
        },
        terms: {
            usedForRecording: { type: Boolean, default: true },
            distributionLimit: { type: Number, default: 0 }, // 0 = unlimited
            audioStreams: { type: Number, default: 0 }, // 0 = unlimited
            musicVideos: { type: Number, default: 0 }, // 0 = unlimited
            forProfitPerformances: { type: Boolean, default: false },
            radioBroadcasting: { type: Number, default: 0 } // 0 = unlimited
        }
    }]
}, {
    timestamps: true
});

const Beat = mongoose.model('Beat', beatSchema);

module.exports = Beat;