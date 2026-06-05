const mysql = require('mysql2/promise');
require('dotenv').config();

// ── Construction de la config ──────────────────────────────────
// Priorité : variables individuelles > DATABASE_URL
let poolConfig;

if (process.env.DB_HOST) {
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME     || 'kitchenpulse_db',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  };
} else if (process.env.DATABASE_URL) {
  poolConfig = { uri: process.env.DATABASE_URL };
} else {
  console.error('❌ Aucune configuration DB trouvée dans .env');
  process.exit(1);
}

const pool = mysql.createPool({
  ...poolConfig,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  decimalNumbers:     true,
});

// ── Vérification de la connexion au démarrage ──────────────────
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL réussie !');
    connection.release();
  } catch (err) {
    console.error('❌ Connexion MySQL échouée :', err.message);
    process.exit(1);
  }
})();

module.exports = pool;