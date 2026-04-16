const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Ej: "Lanzamientos de Octubre"
  slug: { type: String, unique: true }, // Para la url: [tuweb.com/news/lanzamientos-octubre]
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledAt: { type: Date }, // Fecha de envío programado
  sentAt: { type: Date },
  
  // Contenido Dinámico (Solo guardamos IDs)
  content: {
    uniqueBeats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beat' }],
    upcomingReleases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Release' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    discounts: [{ 
        code: String, 
        description: String, 
        discountAmount: String 
    }]
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
