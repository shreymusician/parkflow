const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const os = require('os');
const validateEnv = require('./config/envValidator');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

/* ── CORS ──────────────────────────────────────────────────────────────────
   Allow the frontend whether it runs on localhost OR via LAN IP.
   CLIENT_URL in .env can be a comma-separated list, e.g.:
     CLIENT_URL=http://localhost:5173,http://192.168.31.56:5173
   We always add a wildcard fallback so mobile devices on the LAN work
   even before CLIENT_URL is explicitly set.
───────────────────────────────────────────────────────────────────────── */
const rawOrigins = process.env.CLIENT_URL || '';
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...rawOrigins.split(',').map(o => o.trim()).filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps without CORS header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow any origin on the same /16 subnet (192.168.x.x)
    if (/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
    if (/^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Initialize Socket.io Utility  (must happen before routes that emit)
const socketUtility = require('./utils/socket');
socketUtility.init(server, allowedOrigins);
console.log('Socket.io Initialized');

app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes         = require('./routes/authRoutes');
const reservationRoutes  = require('./routes/reservationRoutes');
const sessionRoutes      = require('./routes/sessionRoutes');
const vehicleRoutes      = require('./routes/vehicleRoutes');
const locationRoutes     = require('./routes/locationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const simulationRoutes   = require('./routes/simulationRoutes');
const userRoutes         = require('./routes/userRoutes');

app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/reservations',  reservationRoutes);
app.use('/api/v1/sessions',      sessionRoutes);
app.use('/api/v1/vehicles',      vehicleRoutes);
app.use('/api/v1/locations',     locationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin',         adminRoutes);
app.use('/api/v1/simulation',    simulationRoutes);
app.use('/api/v1/users',         userRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime(),
  });
});

// Start Background Workers
const { startCleanupWorker } = require('./workers/reservationCleanup');
startCleanupWorker();
console.log('Background workers started (reservation cleanup)');

/* ── Get local LAN IPv4 ──────────────────────────────────────────────── */
function getLanIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer Wi-Fi / Ethernet (skip APIPA 169.254.x.x)
        if (!iface.address.startsWith('169.254')) return iface.address;
      }
    }
  }
  return '0.0.0.0';
}

/* ── Start server on ALL interfaces ────────────────────────────────── */
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  const lanIP = getLanIP();
  console.log('\n-------------------------------------------------');
  console.log('  ParkFlow Backend Server running');
  console.log('-------------------------------------------------');
  console.log(`  Local:    http://localhost:${PORT}`);
  console.log(`  Network:  http://${lanIP}:${PORT}`);
  console.log(`  Health:   http://${lanIP}:${PORT}/api/v1/health`);
  console.log('-------------------------------------------------\n');
});

