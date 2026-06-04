const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importation de ton fichier de connexion de base de données
const db = require('./config/db');

// Importation de TES routes de la fonctionnalité Serveur/Admin
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json()); // Permet à Express de lire le JSON envoyé par le frontend

// Déclaration de TES routes d'administration
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Route de test d'API de base
app.get('/', (req, res) => {
  res.send('🚀 Le serveur backend de KitchenPulse fonctionne parfaitement !');
});

// Récupération du port depuis ton fichier .env ou 3001 par défaut
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur : http://localhost:${PORT}`);
});