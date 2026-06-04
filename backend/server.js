const platRoutes = require('./routes/platRoutes');
const express = require('express');
const cors = require('cors'); // Doit être là UNE seule fois !
require('dotenv').config();

// Importation de ton fichier de connexion de base de données
const db = require('./config/db');

// Importation de TES routes de la fonctionnalité Serveur/Admin
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const tableRoutes = require('./routes/tableRoutes'); // Ajouté à l'étape précédente !

const app = express();

// Middlewares de base (ils doivent être appelés une seule fois ici)
app.use(cors());
app.use(express.json()); // Permet à Express de lire le JSON envoyé par le frontend

// Déclaration de TES routes d'administration et serveurs
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tables', tableRoutes);
//const platRoutes = require('./routes/platRoutes');

// Route de test d'API de base
app.get('/', (req, res) => {
  res.send('🚀 Le serveur backend de KitchenPulse fonctionne parfaitement !');
});

// Récupération du port depuis ton fichier .env ou 3001 par défaut
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur : http://localhost:${PORT}`);
});