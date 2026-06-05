const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const path       = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// ── Routes ─────────────────────────────────────────────────────
// ✅ Seulement les routes dont les fichiers existent réellement
const authRoutes  = require('./routes/authRoutes');
const dishRoutes  = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const userRoutes  = require('./routes/userRoutes');
// ❌ Supprimés car fichiers inexistants (causeraient un crash immédiat) :
//    reviewRoutes, statsRoutes, platRoutes, notificationRoutes

const { initSocket } = require('./socket/socketHandlers');

// ── App & Serveur HTTP ─────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ── Middlewares globaux ────────────────────────────────────────
app.use(cors({ origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Servir les fichiers uploadés (images, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Injecter l'instance Socket.io dans chaque requête
app.use((req, _res, next) => { req.io = io; next(); });

// ── Déclaration des routes ─────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users',  userRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ ok: true, version: '1.0.0', ts: new Date() })
);

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }));

// ── Initialisation Socket.io ───────────────────────────────────
initSocket(io);

// ── Démarrage ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🍴  KitchenPulse backend → http://localhost:${PORT}`);
  console.log(`✅  Routes actives :`);
  console.log(`    GET  /health`);
  console.log(`    POST /api/auth/register`);
  console.log(`    POST /api/auth/login`);
  console.log(`    GET  /api/auth/me`);
  console.log(`    GET  /api/dishes`);
  console.log(`    GET  /api/dishes/categories`);
  console.log(`    GET  /api/orders`);
  console.log(`    GET  /api/tables`);
  console.log(`    GET  /api/users\n`);
});