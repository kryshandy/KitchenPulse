<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feature/cuisinier
