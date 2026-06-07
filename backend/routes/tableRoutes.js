/**
 * tableRoutes.js — KitchenPulse
 * CORRECTIONS :
 *  - GET /api/tables/my  → accessible au CLIENT (pour le Panier)
 *  - GET /api/tables/seed → admin seulement, crée les tables 0-N en BD
 *  - GET /api/tables      → personnel seulement (inchangé)
 */
const express     = require('express');
const router      = express.Router();
const pool        = require('../config/db');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');

// ── GET /api/tables/my — table du client connecté (Panier) ────
// Doit être déclarée AVANT /:id pour ne pas être capturée
router.get('/my',
  verifyToken,
  verifyRole('client'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT t.id AS table_id, t.table_number, t.label, t.capacity, t.area
         FROM table_assignments ta
         JOIN tables_restaurant t ON ta.table_id = t.id
         WHERE ta.user_id = ?
           AND ta.ended_at IS NULL
           AND t.is_active = 1
           AND t.table_number != 0
         ORDER BY ta.started_at DESC
         LIMIT 1`,
        [req.user.id]
      );
      if (!rows.length) {
        return res.json({ table: null, delivery: true });
      }
      return res.json({ table: rows[0], delivery: false });
    } catch (err) {
      console.error('GET /tables/my:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// ── POST /api/tables/seed — initialiser les tables (admin) ────
// Corps JSON : { count: 20, capacity: 4, area: "Salle principale" }
router.post('/seed',
  verifyToken,
  verifyRole('admin'),
  async (req, res) => {
    const { count = 15, capacity = 4, area = 'Salle principale' } = req.body;
    if (count < 1 || count > 200) {
      return res.status(400).json({ message: 'count doit être entre 1 et 200' });
    }
    try {
      let created = 0;

      // Table spéciale 0 = livraison à domicile
      const [d] = await pool.query('SELECT id FROM tables_restaurant WHERE table_number = 0 LIMIT 1');
      if (!d.length) {
        await pool.query(
          `INSERT INTO tables_restaurant (table_number, label, capacity, status, qr_code, area, is_active)
           VALUES (0, 'Livraison à domicile', 1, 'libre', 'KP-DELIVERY', 'Livraison', 1)`
        );
        created++;
      }

      // Tables 1 → count
      for (let n = 1; n <= count; n++) {
        const [ex] = await pool.query('SELECT id FROM tables_restaurant WHERE table_number = ? LIMIT 1', [n]);
        if (!ex.length) {
          await pool.query(
            `INSERT INTO tables_restaurant (table_number, label, capacity, status, qr_code, area, is_active)
             VALUES (?, ?, ?, 'libre', ?, ?, 1)`,
            [n, `Table ${n}`, capacity, `KP-TABLE-${String(n).padStart(3,'0')}`, area]
          );
          created++;
        }
      }

      return res.status(201).json({ message: `${created} table(s) créée(s)` });
    } catch (err) {
      console.error('POST /tables/seed:', err);
      return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
    }
  }
);

// ── GET /api/tables — toutes les tables (personnel) ───────────
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

// ── PATCH /api/tables/:id/status — changer statut ─────────────
router.patch('/:id/status',
  verifyToken,
  verifyRole('serveur', 'admin'),
  async (req, res) => {
    const status = req.body.status?.toLowerCase();
    const valid  = ['libre','occupee','reservee','en_service','addition_demandee','en_nettoyage'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs : ${valid.join(', ')}` });
    }
    try {
      await pool.query(
        'UPDATE tables_restaurant SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, req.params.id]
      );
      const [updated] = await pool.query('SELECT * FROM tables_restaurant WHERE id = ?', [req.params.id]);
      if (!updated.length) return res.status(404).json({ message: 'Table introuvable' });
      res.json(updated[0]);
    } catch {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;