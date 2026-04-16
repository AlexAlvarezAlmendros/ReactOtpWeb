const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const SpotifyService = require('../services/spotifyService');

// Instanciar el servicio de Spotify
const spotifyService = new SpotifyService();

// Rate limiting: 10 requests por minuto por IP
const spotifyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por ventana por IP
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests to Spotify API. Please try again in a minute.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to Spotify API. Please try again in a minute.',
      retryAfter: 60
    });
  }
});

// Aplicar rate limiting a todas las rutas de Spotify
router.use(spotifyRateLimit);

// Middleware de logging específico para Spotify API
const spotifyLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`🎵 Spotify API Request: ${req.method} ${req.path}`);
    console.log(`📊 Response time: ${duration}ms`);
    console.log(`📋 Status: ${res.statusCode}`);
    console.log(`🌐 IP: ${req.ip}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Spotify request successful`);
    } else {
      console.log(`❌ Spotify request failed with status ${res.statusCode}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

router.use(spotifyLogger);

// Middleware de validación para URL de Spotify
const validateSpotifyUrl = (req, res, next) => {
  const { spotifyUrl } = req.body;
  
  if (!spotifyUrl) {
    return res.status(400).json({
      error: 'URL_REQUIRED',
      message: 'Spotify URL is required'
    });
  }
  
  if (typeof spotifyUrl !== 'string') {
    return res.status(400).json({
      error: 'INVALID_URL_FORMAT',
      message: 'URL must be a string'
    });
  }
  
  // Sanitizar URL
  const sanitizedUrl = spotifyUrl.trim().replace(/[<>'"]/g, '');
  
  if (sanitizedUrl.length > 1000) {
    return res.status(400).json({
      error: 'URL_TOO_LONG',
      message: 'URL is too long'
    });
  }
  
  if (!sanitizedUrl.includes('spotify.com')) {
    return res.status(400).json({
      error: 'INVALID_DOMAIN',
      message: 'URL must be from spotify.com'
    });
  }
  
  try {
    spotifyService.extractIdFromUrl(sanitizedUrl);
    req.body.spotifyUrl = sanitizedUrl;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'INVALID_SPOTIFY_URL',
      message: 'Invalid Spotify URL format'
    });
  }
};

// Función para sanitizar datos de respuesta
const sanitizeSpotifyData = (data) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '')
              .trim();
  };
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeString(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return sanitizeString(data);
};

// POST /api/spotify/artist-info
router.post('/artist-info', validateSpotifyUrl, async (req, res) => {
  try {
    const { spotifyUrl } = req.body;
    const urlInfo = spotifyService.extractIdFromUrl(spotifyUrl);
    
    if (urlInfo.type !== 'artist') {
      return res.status(400).json({
        error: 'INVALID_URL_TYPE',
        message: 'URL must be a Spotify artist URL'
      });
    }
    
    const artistData = await spotifyService.getArtistData(urlInfo.id);
    
    const mappedData = {
      name: artistData.name,
      genre: artistData.genres.join(', '),
      img: artistData.images.length > 0 ? artistData.images[0].url : '',
      spotifyLink: artistData.spotifyUrl,
      instagramLink: '',
      twitterLink: '',
      youtubeLink: '',
      facebookLink: '',
      websiteLink: ''
    };
    
    const sanitizedData = sanitizeSpotifyData(mappedData);
    
    res.status(200).json({
      success: true,
      data: sanitizedData,
      source: 'spotify'
    });
    
  } catch (error) {
    console.error('Error importing artist from Spotify:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'ARTIST_NOT_FOUND',
        message: 'Artist not found on Spotify'
      });
    }
    
    if (error.message.includes('Authentication failed')) {
      return res.status(401).json({
        error: 'SPOTIFY_AUTH_ERROR',
        message: 'Failed to authenticate with Spotify API'
      });
    }
    
    return res.status(500).json({
      error: 'SPOTIFY_API_ERROR',
      message: 'Failed to get artist data from Spotify'
    });
  }
});

// POST /api/spotify/release-info
router.post('/release-info', validateSpotifyUrl, async (req, res) => {
  try {
    const { spotifyUrl } = req.body;
    const urlInfo = spotifyService.extractIdFromUrl(spotifyUrl);

    if (urlInfo.type !== 'album' && urlInfo.type !== 'track') {
      return res.status(400).json({
        error: 'INVALID_URL_TYPE',
        message: 'URL must be a Spotify album or track URL'
      });
    }
    
    // Obtener datos según el tipo
    let releaseData;
    if (urlInfo.type === 'album') {
      releaseData = await spotifyService.getReleaseData(urlInfo.id);
    } else if (urlInfo.type === 'track') {
      releaseData = await spotifyService.getTrackData(urlInfo.id);
    }
    
    const mapReleaseType = (spotifyType) => {
      switch (spotifyType.toLowerCase()) {
        case 'album': return 'Album';
        case 'track': return 'Song';
        case 'compilation': return 'Album';
        default: return 'Track';
      }
    };
    
    const formatReleaseDate = (dateString) => {
      if (!dateString) return '';
      if (dateString.includes('T')) return dateString;
      if (dateString.length === 4) return `${dateString}-01-01T00:00:00.000Z`;
      if (dateString.length === 7) return `${dateString}-01T00:00:00.000Z`;
      return `${dateString}T00:00:00.000Z`;
    };
    
    const mappedData = {
      title: releaseData.name,
      subtitle: '',
      artist: releaseData.artists.join(', '),
      date: formatReleaseDate(releaseData.releaseDate),
      type: mapReleaseType(releaseData.type),
      img: releaseData.images.length > 0 ? releaseData.images[0].url : '',
      spotifyLink: releaseData.spotifyUrl,
      appleMusicLink: '',
      youtubeMusicLink: '',
      amazonMusicLink: '',
      deezerLink: '',
      soundcloudLink: ''
    };
    
    const sanitizedData = sanitizeSpotifyData(mappedData);
    
    res.status(200).json({
      success: true,
      data: sanitizedData,
      source: 'spotify',
      metadata: {
        totalTracks: releaseData.totalTracks,
        originalType: releaseData.type
      }
    });
    
  } catch (error) {
    console.error('Error importing release from Spotify:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'RELEASE_NOT_FOUND',
        message: 'Release not found on Spotify'
      });
    }
    
    if (error.message.includes('Authentication failed')) {
      return res.status(401).json({
        error: 'SPOTIFY_AUTH_ERROR',
        message: 'Failed to authenticate with Spotify API'
      });
    }
    
    return res.status(500).json({
      error: 'SPOTIFY_API_ERROR',
      message: 'Failed to get release data from Spotify'
    });
  }
});

module.exports = router;
