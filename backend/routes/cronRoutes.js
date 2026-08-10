const express = require('express');
const router = express.Router();
const connectDB = require('../utils/dbConnection');
const { processScheduledNewsletters } = require('../services/cronService');
const { syncAllDiscographies } = require('../services/discographySyncService');

// Verifica el token de autorización de Vercel Cron.
// Devuelve true si la petición puede continuar; si no, ya ha respondido.
const authorizeCron = (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    console.error('❌ CRON_SECRET not configured');
    res.status(500).json({
      error: 'Server configuration error',
      message: 'CRON_SECRET not set'
    });
    return false;
  }

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    console.error('❌ Unauthorized cron request');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authorization token'
    });
    return false;
  }

  return true;
};

// Endpoint protegido para Vercel Cron Jobs
// Solo puede ser llamado por Vercel usando el secret token
const processNewslettersHandler = async (req, res) => {
  try {
    console.log('🔐 Vercel Cron Job triggered - Processing newsletters');

    if (!authorizeCron(req, res)) return;

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
};

// Vercel Cron dispara peticiones GET; mantenemos POST para poder lanzarla a mano.
router.get('/process-newsletters', processNewslettersHandler);
router.post('/process-newsletters', processNewslettersHandler);

// Sincroniza la discografía de los artistas registrados desde Spotify.
// Procesa por lotes (los artistas menos actualizados primero) para no agotar
// el tiempo de ejecución de la función serverless.
// Vercel Cron dispara peticiones GET; aceptamos también POST para poder
// lanzarla a mano con parámetros (maxArtists, timeBudgetMs, dryRun).
const syncDiscographyHandler = async (req, res) => {
  try {
    console.log('🔐 Vercel Cron Job triggered - Syncing Spotify discography');

    if (!authorizeCron(req, res)) return;

    const result = await syncAllDiscographies({
      ...(req.body?.maxArtists ? { maxArtists: parseInt(req.body.maxArtists, 10) } : {}),
      ...(req.body?.timeBudgetMs ? { timeBudgetMs: parseInt(req.body.timeBudgetMs, 10) } : {}),
      dryRun: req.body?.dryRun === true
    });

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in discography sync endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

router.get('/sync-discography', syncDiscographyHandler);
router.post('/sync-discography', syncDiscographyHandler);

module.exports = router;
