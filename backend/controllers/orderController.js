// backend/controllers/orderController.js
// ⚠️  AJOUTE ces deux fonctions à ton orderController existant si elles manquent.
// Si ton fichier est complet, vérifie juste que getOrders et updateOrderStatus existent.

const pool = require('../config/db');

// ── GET /api/orders?status=RECUE,EN_PREPARATION ────────────────
// Utilisé par le cuisinier et le client
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const user = req.user;

    let sql = `
      SELECT c.*,
             t.table_number AS table_numero,
             u.first_name, u.last_name
      FROM commandes c
      LEFT JOIN tables_restaurant t ON c.table_id = t.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filtre par statut (liste séparée par virgules)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      sql += ` AND c.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    // Client ne voit que ses propres commandes
    if (user.role === 'client' || user.role === 'CLIENT') {
      sql += ' AND c.user_id = ?';
      params.push(user.id);
    }

    sql += ' ORDER BY c.opened_at DESC';

    const [orders] = await pool.query(sql, params);

    // Charger les items de chaque commande
    if (orders.length) {
      const ids = orders.map(o => o.id);
      const [items] = await pool.query(
        `SELECT oi.*, p.name AS plat_nom, p.prep_time_minutes
         FROM order_items oi
         JOIN plats p ON oi.plat_id = p.id
         WHERE oi.commande_id IN (?)`,
        [ids]
      );
      const map = {};
      items.forEach(i => {
        if (!map[i.commande_id]) map[i.commande_id] = [];
        map[i.commande_id].push(i);
      });
      orders.forEach(o => { o.items = map[o.id] || []; });
    }

    return res.json(orders);
  } catch (err) {
    console.error('getOrders:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ── PATCH /api/orders/:id/status ──────────────────────────────
// Cycle : RECUE → EN_PREPARATION → PRETE → SERVIE → CLOTUREE
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED = ['EN_PREPARATION', 'PRETE', 'EN_COURS_DE_SERVICE', 'SERVIE', 'CLOTUREE', 'ANNULEE'];
  if (!ALLOWED.includes(status)) {
    return res.status(400).json({ message: `Statut invalide. Valeurs : ${ALLOWED.join(', ')}` });
  }

  try {
    const [rows] = await pool.execute('SELECT id, status FROM commandes WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Commande introuvable' });

    await pool.execute('UPDATE commandes SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    // Émettre l'événement Socket.io si disponible
    if (req.io) {
      req.io.to('cuisine').emit('order_status_update', { orderId: id, status });
      req.io.to('salle').emit('order_status_update', { orderId: id, status });
      req.io.to(`order:${id}`).emit('order_status_update', { orderId: id, status });
      if (status === 'PRETE') {
        req.io.to('salle').emit('order_ready', { orderId: id });
      }
    }

    return res.json({ message: `Commande passée à ${status}`, orderId: id, status });
  } catch (err) {
    console.error('updateOrderStatus:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, t.table_number AS table_numero, u.first_name, u.last_name
       FROM commandes c
       LEFT JOIN tables_restaurant t ON c.table_id = t.id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Commande introuvable' });
    const order = rows[0];

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS plat_nom, p.prep_time_minutes
       FROM order_items oi JOIN plats p ON oi.plat_id = p.id
       WHERE oi.commande_id = ?`,
      [order.id]
    );
    order.items = items;
    return res.json(order);
  } catch (err) {
    console.error('getOrderById:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── POST /api/orders ──────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const { table_id, notes, items } = req.body;
  if (table_id === undefined || table_id === null || table_id === '' || !items?.length) {
    return res.status(400).json({ message: 'table_id et items sont requis' });
  }
  try {
    const total = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
    const [result] = await pool.execute(
      `INSERT INTO commandes (user_id, table_id, notes, subtotal, total_amount, order_number, status, payment_status, opened_at)
       VALUES (?, ?, ?, ?, ?, 'TEMP', 'RECUE', 'EN_ATTENTE', NOW())`,
      [req.user.id, table_id, notes || null, total, total]
    );
    const commandeId = result.insertId;

    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (commande_id, plat_id, quantity, unit_price, item_total) VALUES (?, ?, ?, ?, ?)',
        [commandeId, item.plat_id, item.quantity, item.unit_price, Number(item.unit_price) * Number(item.quantity)]
      );
    }

    // Générer un numéro de commande lisible
    const orderNumber = `KP-${String(commandeId).padStart(4, '0')}`;
    await pool.execute('UPDATE commandes SET order_number = ? WHERE id = ?', [orderNumber, commandeId]);

    if (req.io) {
      req.io.to('cuisine').emit('new_order', { commande_id: commandeId, order_number: orderNumber });
    }

    return res.status(201).json({ commande_id: commandeId, order_number: orderNumber, total_amount: total });
  } catch (err) {
    console.error('createOrder:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ── DELETE /api/orders/:id ────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    await pool.execute("UPDATE commandes SET status = 'ANNULEE' WHERE id = ?", [req.params.id]);
    return res.json({ message: 'Commande annulée' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};