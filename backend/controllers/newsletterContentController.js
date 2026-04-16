const Newsletter = require('../models/Newsletter');
const connectDB = require('../utils/dbConnection');
const emailService = require('../services/emailService');

// Create a draft newsletter
exports.createNewsletter = async (req, res) => {
    try {
        // Ensure database connection
        await connectDB();
        
        console.log('📝 Creating newsletter - Request body:', JSON.stringify(req.body, null, 2));
        const { title, slug, scheduledAt, content, status } = req.body;
        
        const existingNewsletter = await Newsletter.findOne({ slug });
        if (existingNewsletter) {
            return res.status(400).json({ message: 'A newsletter with this slug already exists' });
        }

        // Mapear los campos del frontend al modelo
        const mappedContent = {
            uniqueBeats: content?.beats || [],
            upcomingReleases: content?.releases || [],
            events: content?.events || [],
            discounts: (content?.discounts || []).map(discount => ({
                code: discount.code,
                description: discount.description,
                discountAmount: discount.amount // Mapear 'amount' a 'discountAmount'
            }))
        };

        const newNewsletter = new Newsletter({
            title,
            slug,
            scheduledAt,
            content: mappedContent,
            status: status || 'draft' // Usar el status recibido o 'draft' por defecto
        });

        await newNewsletter.save();
        res.status(201).json(newNewsletter);
    } catch (error) {
        console.error('Error creating newsletter:', error);
        res.status(500).json({ message: 'Error creating newsletter', error: error.message });
    }
};

// Update existing newsletter
exports.updateNewsletter = async (req, res) => {
    try {
        console.log('✏️ Updating newsletter - ID:', req.params.id);
        console.log('📝 Update data:', JSON.stringify(req.body, null, 2));
        const { id } = req.params;
        const updates = { ...req.body };

        // Si se envía content, mapear los campos del frontend al modelo
        if (updates.content) {
            updates.content = {
                uniqueBeats: updates.content.beats || updates.content.uniqueBeats || [],
                upcomingReleases: updates.content.releases || updates.content.upcomingReleases || [],
                events: updates.content.events || [],
                discounts: (updates.content.discounts || []).map(discount => ({
                    code: discount.code,
                    description: discount.description,
                    discountAmount: discount.amount || discount.discountAmount
                }))
            };
        }

        const newsletter = await Newsletter.findByIdAndUpdate(id, updates, { new: true });
        
        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        res.json(newsletter);
    } catch (error) {
        console.error('Error updating newsletter:', error);
        res.status(500).json({ message: 'Error updating newsletter', error: error.message });
    }
};

// Delete a newsletter
exports.deleteNewsletter = async (req, res) => {
    try {
        const { id } = req.params;
        const newsletter = await Newsletter.findByIdAndDelete(id);

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        res.json({ message: 'Newsletter deleted successfully' });
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        res.status(500).json({ message: 'Error deleting newsletter', error: error.message });
    }
};

// Get public newsletter (populated)
exports.getNewsletterBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const newsletter = await Newsletter.findOne({ slug })
            .populate('content.uniqueBeats')
            .populate('content.upcomingReleases') 
            .populate('content.events');

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        res.json(newsletter);
    } catch (error) {
        console.error('Error fetching newsletter:', error);
        res.status(500).json({ message: 'Error fetching newsletter', error: error.message });
    }
};

// Get all newsletters (for admin panel)
exports.getAllNewsletters = async (req, res) => {
    try {
        const newsletters = await Newsletter.find().sort({ createdAt: -1 });
        res.json(newsletters);
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        res.status(500).json({ message: 'Error fetching newsletters', error: error.message });
    }
};

// Force send newsletter
exports.sendNewsletter = async (req, res) => {
    try {
        const { id } = req.params;
        const newsletter = await Newsletter.findById(id)
            .populate('content.uniqueBeats')
            .populate('content.upcomingReleases')
            .populate('content.events');

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        await emailService.sendNewsletter(newsletter);

        newsletter.status = 'sent';
        newsletter.sentAt = new Date();
        await newsletter.save();

        res.json({ message: 'Newsletter sent successfully', newsletter });
    } catch (error) {
        console.error('Error sending newsletter:', error);
        res.status(500).json({ message: 'Error sending newsletter', error: error.message });
    }
};
