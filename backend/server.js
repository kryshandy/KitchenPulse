const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const db = require('./config/db');

// ── Routes ────────────────────────────────────────────────────
const authRoutes  = require('./routes/authRoutes');
const dishRoutes  = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes  = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const tableRoutes = require('./routes/tableRoutes');
const platRoutes  = require('./routes/platRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globaux ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Servir les images uploadées
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Déclaration des routes ─────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users',  userRoutes);
app.use('/api/stats',  statsRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/plats',  platRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// ── Route santé ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 KitchenPulse API is running !', version: '1.0.0' });
});

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
