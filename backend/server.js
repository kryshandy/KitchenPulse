const express = require('express');
const cors    = require('cors');
const http    = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes   = require('./routes/authRoutes');
const dishRoutes   = require('./routes/dishRoutes');
const orderRoutes  = require('./routes/orderRoutes');
const tableRoutes  = require('./routes/tableRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes   = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { initSocket } = require('./socket/socketHandlers');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Injecter io dans chaque requête
app.use((req, _res, next) => { req.io = io; next(); });

// ── Routes ──────────────────────────────────────────
app.use('/auth',        authRoutes);
app.use('/api/dishes',  dishRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/tables',  tableRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }));

initSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🍴  KitchenPulse backend → http://localhost:${PORT}`);
  console.log(`📋  Routes dispo :`);
  console.log(`    GET  /health`);
  console.log(`    POST /auth/register`);
  console.log(`    POST /auth/login`);
  console.log(`    GET  /auth/allergies`);
  console.log(`    GET  /api/dishes`);
  console.log(`    GET  /api/dishes/categories`);
  console.log(`    GET  /api/tables\n`);
  console.log(`    GET  /api/payments\n`);
});