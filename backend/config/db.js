const mysql = require('mysql2');
require('dotenv').config();

<<<<<<< HEAD
// Récupération de l'URL de la base de données depuis le .env
const connectionUri = process.env.DATABASE_URL;

if (!connectionUri) {
  console.error("❌ Erreur : DATABASE_URL n'est pas définie dans le fichier .env");
  process.exit(1);
}

// Création du pool adapté à la BD finale
const pool = mysql.createPool({
  uri: connectionUri,
  decimalNumbers: true, // Permet de récupérer les prix (decimals) sous forme de nombres et non de chaînes de caractères
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Conversion du pool pour utiliser async/await (indispensable pour vos futurs contrôleurs)
const db = pool.promise();

// Test de connexion automatique au lancement du serveur
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Impossible de se connecter à MySQL via DATABASE_URL :", err.message);
  } else {
    console.log("✅ Connexion réussie à la base de données KitchenPulse !");
    connection.release();
  }
});

module.exports = db;
=======
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
>>>>>>> origin/feature/cuisinier
