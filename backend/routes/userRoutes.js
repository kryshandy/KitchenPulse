const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/verifyToken');
const role   = require('../middleware/verifyRole');

// GET /api/users — ADMIN seulement
router.get('/', auth, role('ADMIN'), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/:id — modifier rôle/statut (ADMIN)
router.put('/:id', auth, role('ADMIN'), async (req, res) => {
  const { role: newRole, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE users SET role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?',
      [newRole || null, is_active ?? null, req.params.id]
    );
    res.json({ message: 'Utilisateur mis à jour' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;