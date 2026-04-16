const express = require('express');
const router = express.Router();
const licenseService = require('../services/licenseService');
const IssuedLicense = require('../models/IssuedLicense');

/**
 * GET /api/licenses/verify/:identifier
 * Verify a license by license number or UUID
 */
router.get('/verify/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        if (!identifier) {
            return res.status(400).json({ 
                error: 'License identifier is required' 
            });
        }

        const result = await licenseService.verifyLicense(identifier);
        
        if (!result.valid) {
            return res.status(404).json(result);
        }

        // Return sanitized license information
        const license = result.license;
        res.json({
            valid: true,
            message: result.message,
            license: {
                licenseNumber: license.licenseNumber,
                tier: license.tier,
                beatTitle: license.beatTitle,
                producerName: license.producerName,
                buyerLegalName: license.buyerLegalName,
                issuedAt: license.issuedAt,
                limits: license.limitsSnapshot,
                status: license.status,
                documentHash: license.documentHash
                // Don't expose sensitive data like email, orderId, etc.
            }
        });

    } catch (error) {
        console.error('❌ Error verifying license:', error);
        res.status(500).json({ 
            error: 'Error verifying license',
            details: error.message 
        });
    }
});

/**
 * GET /api/licenses/stats
 * Get license statistics (admin only - add auth middleware as needed)
 */
router.get('/stats', async (req, res) => {
    try {
        const totalLicenses = await IssuedLicense.countDocuments();
        const licensesByTier = await IssuedLicense.aggregate([
            {
                $group: {
                    _id: '$tier',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);

        const thisYear = new Date().getFullYear();
        const startOfYear = new Date(thisYear, 0, 1);
        const licensesThisYear = await IssuedLicense.countDocuments({
            issuedAt: { $gte: startOfYear }
        });

        res.json({
            total: totalLicenses,
            thisYear: licensesThisYear,
            byTier: licensesByTier,
            currentYear: thisYear
        });

    } catch (error) {
        console.error('❌ Error getting license stats:', error);
        res.status(500).json({ 
            error: 'Error getting license statistics',
            details: error.message 
        });
    }
});

/**
 * GET /api/licenses/user/:email
 * Get all licenses for a user by email
 * (Optional: Add authentication middleware to ensure users can only see their own licenses)
 */
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'Email is required' 
            });
        }

        const licenses = await IssuedLicense.find({ 
            buyerEmail: email,
            status: 'Issued'
        })
        .populate('beatId', 'title bpm key')
        .sort({ issuedAt: -1 });

        res.json({
            count: licenses.length,
            licenses: licenses.map(license => ({
                licenseNumber: license.licenseNumber,
                licenseId: license.licenseId,
                tier: license.tier,
                beatTitle: license.beatTitle,
                issuedAt: license.issuedAt,
                limits: license.limitsSnapshot,
                verifyUrl: license.verifyUrl,
                amount: license.amount,
                currency: license.currency
            }))
        });

    } catch (error) {
        console.error('❌ Error getting user licenses:', error);
        res.status(500).json({ 
            error: 'Error getting user licenses',
            details: error.message 
        });
    }
});

module.exports = router;
