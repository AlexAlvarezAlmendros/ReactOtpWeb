require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./utils/dbConnection');
const releaseRoutes = require('./routes/releaseRoutes');
const beatRoutes = require('./routes/beatRoutes');
const artistRoutes = require('./routes/artistRoutes');
const studioRoutes = require('./routes/studioRoutes');
const eventRoutes = require('./routes/eventRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const newsletterContentRoutes = require('./routes/newsletterContentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const cronRoutes = require('./routes/cronRoutes');
const healthRoutes = require('./routes/healthRoutes');
const fileRoutes = require('./routes/fileRoutes');
const imageRoutes = require('./routes/imageRoutes');
const licenseRoutes = require('./routes/licenseRoutes');

const app = express();

// IMPORTANTE: El webhook de Stripe necesita el body raw
// Debe estar ANTES de cualquier middleware que procese el body
app.post('/api/tickets/webhook', 
  express.raw({ type: 'application/json' }), 
  require('./controllers/ticketController').handleWebhook
);

// Webhook de Stripe para compra de beats
app.post('/api/beats/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/beatController').handleBeatWebhook
);

// Configuración de CORS - Permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.otherpeople.es',
  'https://otherpeople.es'
];

// Si hay una variable de entorno FRONTEND_URL, agregarla también
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

app.use(cors(corsOptions));

app.use(express.json()); // Para parsear el body de las peticiones a JSON

// Logging de todas las requests (después de express.json para que no interfiera con webhooks)
app.use((req, res, next) => {
  // No loguear webhooks de Stripe (ya tienen sus propios logs)
  if (req.path.includes('/webhook')) {
    return next();
  }
  
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Conexión a la base de datos
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5001;

// Conectar a MongoDB (para desarrollo local)
// En Vercel, la conexión se maneja por request en los webhooks y otras rutas
connectDB().catch(err => {
    console.error('❌ Initial MongoDB connection failed:', err.message);
});

// Ruta de la api
app.use('/api/health', healthRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/newsletters', newsletterContentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/licenses', licenseRoutes);

// Middleware de manejo de errores JWT
app.use((err, req, res, next) => {
  console.error('🚨 Error middleware triggered:');
  console.error('📛 Error name:', err.name);
  console.error('📛 Error message:', err.message);
  console.error('📛 Error code:', err.code);
  console.error('📛 Error status:', err.status);
  
  if (err.name === 'UnauthorizedError') {
    console.error('🔐 JWT Error details:');
    console.error('  - Code:', err.code);
    console.error('  - Message:', err.message);
    console.error('  - Inner error:', err.inner);
    
    res.status(401).json({ 
      error: 'Token inválido o expirado',
      message: err.message,
      code: err.code
    });
  } else {
    console.error('❌ Generic error:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: err.message
    });
  }
});

// Para desarrollo local
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;
