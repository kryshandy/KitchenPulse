const express  = require('express');
const router   = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

// ── Auth publique ──────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ── Profil connecté ────────────────────────────────────────────
router.get('/me', verifyToken, getMe);

// ── GET /api/auth/allergies — liste publique (formulaire inscription) ──
router.get('/allergies', async (_req, res) => {
  const pool = require('../config/db');
  try {
    const [rows] = await pool.query(
      'SELECT id, code, label, icon FROM allergies ORDER BY id'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;