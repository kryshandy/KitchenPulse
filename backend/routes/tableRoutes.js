const express     = require('express');
const router      = express.Router();
const pool        = require('../config/db');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');

// ── GET /api/tables — liste des tables (personnel connecté) ───
router.get('/',
  verifyToken,
  verifyRole('serveur', 'admin', 'cuisinier'),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, table_number, label, capacity, status
         FROM tables_restaurant
         WHERE is_active = 1
         ORDER BY table_number`
      );
      res.json(rows);
    } catch {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// ── PATCH /api/tables/:id/status — changer statut (serveur/admin) ──
router.patch('/:id/status',
  verifyToken,
  verifyRole('serveur', 'admin'),
  async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['libre', 'occupee', 'reservee', 'hors_service'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` });
    }
    try {
      await pool.query(
        'UPDATE tables_restaurant SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
      const [updated] = await pool.query(
        'SELECT * FROM tables_restaurant WHERE id = ?',
        [req.params.id]
      );
      if (!updated.length) return res.status(404).json({ message: 'Table introuvable' });
      res.json(updated[0]);
    } catch {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;