const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: { 
        type: String, 
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: { 
        type: String, 
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    errorMessage: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Index for performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
