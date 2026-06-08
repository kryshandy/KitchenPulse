const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const path       = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// ── Routes ─────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const dishRoutes         = require('./routes/dishRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const tableRoutes        = require('./routes/tableRoutes');
const userRoutes         = require('./routes/userRoutes');
const statsRoutes        = require('./routes/statsRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');

const { initSocket } = require('./socket/socketHandlers');

// ── App & Serveur HTTP ─────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  '*',                              // ← changer ici
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],  // ← ajouter les méthodes
  },
});

// ── Middlewares globaux ────────────────────────────────────────
app.use(cors({ origin: '*' }));               // ← changer ici
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // ← corrigé
app.use((req, _res, next) => { req.io = io; next(); });

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/dishes',        dishRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/tables',        tableRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/stats',         statsRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments',      paymentRoutes);

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
  console.log(`\nKitchenPulse backend → http://localhost:${PORT}`);
  console.log('Routes actives : auth, dishes, orders, tables, users, stats, reviews, notifications, payments\n');
});