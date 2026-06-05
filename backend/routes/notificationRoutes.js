const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/verifyToken');
const db = require('../config/db');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const [notifs] = await db.query(
      'SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifs);
  } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
});

router.patch('/read-all', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=1 WHERE recipient_id=?', [req.user.id]);
    res.json({ message: 'Tout marqué comme lu' });
  } catch { res.status(500).json({ message: 'Erreur' }); }
});

router.patch('/:id/read', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=1 WHERE id=? AND recipient_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Lu' });
  } catch { res.status(500).json({ message: 'Erreur' }); }
});

module.exports = router;