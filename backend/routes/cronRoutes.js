const express = require('express');
const router = express.Router();
const connectDB = require('../utils/dbConnection');
const { processScheduledNewsletters } = require('../services/cronService');

// Endpoint protegido para Vercel Cron Jobs
// Solo puede ser llamado por Vercel usando el secret token
router.post('/process-newsletters', async (req, res) => {
  try {
    console.log('🔐 Vercel Cron Job triggered - Processing newsletters');
    
    // Verificar el token de autorización de Vercel Cron
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.CRON_SECRET;
    
    if (!expectedToken) {
      console.error('❌ CRON_SECRET not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'CRON_SECRET not set' 
      });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.error('❌ Unauthorized cron request');
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or missing authorization token' 
      });
    }
    
    // Asegurar conexión a la base de datos
    await connectDB();
    
    // Procesar newsletters programados
    const result = await processScheduledNewsletters();
    
    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in cron endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
