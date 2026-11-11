const express = require('express');
const {
    listSyncArtists,
    updateSyncArtist,
    syncArtistNow,
    listReviewReleases,
    reviewReleases
} = require('../controllers/spotifySyncController');
const { checkJwt } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

/**
 * Panel → Spotify. Configuración de la sincronización por artista y cola de
 * borradores. Solo administradores.
 */
const router = express.Router();

router.use(checkJwt, checkPermissions(['admin:all']));

router.get('/artists', listSyncArtists);
router.patch('/artists/:id', updateSyncArtist);
router.post('/artists/:id/sync', syncArtistNow);

router.get('/releases', listReviewReleases);
router.post('/releases/review', reviewReleases);

module.exports = router;
