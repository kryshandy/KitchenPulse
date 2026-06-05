const router  = require('express').Router();
const ctrl    = require('../controllers/authController');
const verify  = require('../middleware/verifyToken');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        verify, ctrl.me);

// GET /auth/allergies — liste publique pour le formulaire d'inscription
router.get('/allergies', async (req, res) => {
  const pool = require('../config/db');
  try {
    const [rows] = await pool.query('SELECT id, code, label, icon FROM allergies ORDER BY id');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;