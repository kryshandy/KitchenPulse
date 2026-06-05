const mysql = require('mysql2');
require('dotenv').config();

const connectionUri = process.env.DATABASE_URL;

if (!connectionUri) {
  console.error("❌ DATABASE_URL manquante dans .env");
  process.exit(1);
}

const pool = mysql.createPool({
  uri: connectionUri,
  decimalNumbers: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Connexion MySQL échouée :", err.message);
  } else {
    console.log("✅ Connexion MySQL réussie !");
    connection.release();
  }
});

module.exports = db;
