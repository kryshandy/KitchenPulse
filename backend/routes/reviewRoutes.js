const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/verifyToken');

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  const { plat_id, note, commentaire } = req.body;
  if (!plat_id || !note) return res.status(400).json({ message: 'plat_id et note requis' });
  if (note < 1 || note > 5) return res.status(400).json({ message: 'Note entre 1 et 5' });

  try {
    // Vérifier achat vérifié
    const [purchases] = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN commandes c ON oi.commande_id = c.id
       WHERE c.user_id = ? AND oi.plat_id = ? AND c.status IN ('SERVIE','CLOTUREE')
       LIMIT 1`,
      [req.user.id, plat_id]
    );
    const is_verified = purchases.length > 0 ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO avis (user_id, plat_id, note, commentaire, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, plat_id, note, commentaire || null, is_verified]
    );
    res.status(201).json({ id: result.insertId, is_verified_purchase: !!is_verified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reviews/:platId
router.get('/:platId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT av.id, av.note, av.commentaire, av.is_verified_purchase, av.created_at,
              u.first_name, u.last_name
       FROM avis av JOIN users u ON av.user_id = u.id
       WHERE av.plat_id = ? ORDER BY av.created_at DESC LIMIT 20`,
      [req.params.platId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;