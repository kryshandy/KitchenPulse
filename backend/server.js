const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log(process.env.DB_USER)
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Dans server.js, après les imports existants, ajouter :
const dishRoutes  = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Route santé
app.get('/', (req, res) => {
  res.json({ message: 'KitchenPulse API is running 🚀' });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Après app.use('/api/auth', authRoutes) :
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);