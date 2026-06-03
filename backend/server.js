const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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