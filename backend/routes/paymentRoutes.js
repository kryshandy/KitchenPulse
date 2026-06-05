const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/verifyToken');

// POST /api/payments — enregistrer un paiement
router.post('/', auth, async (req, res) => {
  const { commande_id, method, amount, phone } = req.body;
  if (!commande_id || !method || !amount) {
    return res.status(400).json({ message: 'commande_id, method et amount requis' });
  }

  const validMethods = ['MTN_MOMO','ORANGE_MONEY','CARTE_BANCAIRE','CAISSE','QR_LOCAL','SPLIT_BILL'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ message: 'Méthode de paiement invalide' });
  }

  try {
    // Vérifier que la commande appartient à l'utilisateur
    const [orders] = await pool.query(
      'SELECT id, total_amount, payment_status FROM commandes WHERE id = ? AND user_id = ?',
      [commande_id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Commande introuvable' });
    if (orders[0].payment_status === 'PAYE') {
      return res.status(400).json({ message: 'Commande déjà payée' });
    }

    // Générer une référence unique
    const reference = `KP-PAY-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    // Créer le paiement
    const [result] = await pool.query(
      `INSERT INTO paiements (commande_id, method, amount, currency, reference, status, paid_at)
       VALUES (?, ?, ?, 'XAF', ?, 'SUCCESS', NOW())`,
      [commande_id, method, amount, reference]
    );

    // Mettre à jour le statut de paiement de la commande
    await pool.query(
      "UPDATE commandes SET payment_status = 'PAYE', status = 'CLOTUREE' WHERE id = ?",
      [commande_id]
    );

    res.status(201).json({
      id: result.insertId,
      reference,
      status: 'SUCCESS',
      message: 'Paiement enregistré avec succès',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/payments/:commandeId — statut paiement
router.get('/:commandeId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.method, p.amount, p.status, p.reference, p.paid_at
       FROM paiements p
       JOIN commandes c ON p.commande_id = c.id
       WHERE p.commande_id = ? AND c.user_id = ?
       ORDER BY p.created_at DESC LIMIT 1`,
      [req.params.commandeId, req.user.id]
    );
    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;