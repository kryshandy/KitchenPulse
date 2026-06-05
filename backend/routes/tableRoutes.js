const router = require('express').Router();
const pool   = require('../config/db');

// GET /api/tables — liste publique pour le select numéro de table
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, table_number, label, capacity, status FROM tables_restaurant WHERE is_active = 1 ORDER BY table_number"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;