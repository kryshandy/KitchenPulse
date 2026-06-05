const pool = require('../config/db');

// ── Helper : numéro de commande unique ─────────────────────────
const genOrderNumber = () => {
  const d   = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `KP-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

// ── Helper : charger les items d'une commande ──────────────────
const loadItems = async (orderId) => {
  const [items] = await pool.query(
    `SELECT oi.*, p.name, p.image_url, p.prep_time_minutes
     FROM order_items oi JOIN plats p ON oi.plat_id = p.id
     WHERE oi.commande_id = ?`,
    [orderId]
  );
  return items;
};

// ── POST /api/orders — créer une commande (client) ─────────────
const create = async (req, res) => {
  const { items, table_id, notes } = req.body;
  // items = [{ plat_id, quantity, special_instructions }]

  if (!items || !items.length) {
    return res.status(400).json({ message: 'Panier vide' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Vérifier les plats et calculer les totaux
    let subtotal = 0;
    const enriched = [];
    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT id, name, price, is_active FROM plats WHERE id = ?',
        [item.plat_id]
      );
      if (!rows.length || !rows[0].is_active) {
        await conn.rollback();
        return res.status(400).json({ message: `Plat #${item.plat_id} indisponible` });
      }
      const qty = item.quantity || 1;
      enriched.push({ ...rows[0], quantity: qty, instructions: item.special_instructions || '' });
      subtotal += rows[0].price * qty;
    }

    const tax_amount   = subtotal * 0.1925; // TVA Cameroun
    const total_amount = subtotal + tax_amount;

    // Table par défaut si non fournie
    let tableId = table_id;
    if (!tableId) {
      const [tables] = await conn.query(
        "SELECT id FROM tables_restaurant WHERE status = 'libre' AND is_active = 1 LIMIT 1"
      );
      tableId = tables[0]?.id || 1;
    }

    const orderNumber = genOrderNumber();

    // Créer la commande
    const [orderResult] = await conn.query(
      `INSERT INTO commandes
         (table_id, user_id, status, payment_status, order_number, subtotal, tax_amount, total_amount, notes, opened_at)
       VALUES (?, ?, 'nouveau', 'en_attente', ?, ?, ?, ?, ?, NOW())`,
      [tableId, req.user.id, orderNumber, subtotal, tax_amount, total_amount, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insérer les items
    for (const item of enriched) {
      await conn.query(
        `INSERT INTO order_items
           (commande_id, plat_id, quantity, unit_price, subtotal, special_instructions, status)
         VALUES (?, ?, ?, ?, ?, ?, 'en_attente')`,
        [orderId, item.id, item.quantity, item.price, item.price * item.quantity, item.instructions]
      );
    }

    await conn.commit();

    // Notifier la cuisine via Socket.io
    if (req.io) {
      req.io.to('cuisine').emit('new_order', { orderId, order_number: orderNumber, items: enriched });
    }

    return res.status(201).json({
      id: orderId,
      order_number: orderNumber,
      subtotal, tax_amount, total_amount,
      message: 'Commande envoyée en cuisine !',
    });
  } catch (err) {
    await conn.rollback();
    console.error('create order error:', err);
    return res.status(500).json({ message: 'Erreur lors de la création de la commande' });
  } finally {
    conn.release();
  }
};

// ── GET /api/orders/:id — suivi commande (client) ──────────────
const getOne = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT c.id, c.order_number, c.status, c.payment_status,
              c.subtotal, c.tax_amount, c.total_amount,
              c.notes, c.opened_at, c.updated_at,
              t.table_number, t.label AS table_label
       FROM commandes c
       LEFT JOIN tables_restaurant t ON c.table_id = t.id
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Commande introuvable' });

    const order = orders[0];
    order.items = await loadItems(order.id);

    const [history] = await pool.query(
      `SELECT previous_status, new_status, changed_at
       FROM order_status_history WHERE commande_id = ? ORDER BY changed_at`,
      [order.id]
    );
    order.status_history = history;

    return res.json(order);
  } catch (err) {
    console.error('getOne order error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/orders/mine — mes commandes (client) ──────────────
const getMine = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT c.id, c.order_number, c.status, c.payment_status,
              c.total_amount, c.opened_at, c.updated_at, t.table_number
       FROM commandes c
       LEFT JOIN tables_restaurant t ON c.table_id = t.id
       WHERE c.user_id = ? ORDER BY c.opened_at DESC LIMIT 20`,
      [req.user.id]
    );
    return res.json(orders);
  } catch (err) {
    console.error('getMine error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/orders — toutes commandes avec filtres (admin/serveur) ─
const getAllOrders = async (req, res) => {
  const { statut, client_id, serveur_id } = req.query;
  let query = `
    SELECT c.*, u.first_name, u.last_name, t.table_number
    FROM commandes c
    JOIN  users u ON c.user_id = u.id
    LEFT JOIN tables_restaurant t ON c.table_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (statut)     { query += ' AND c.status = ?';    params.push(statut); }
  if (client_id)  { query += ' AND c.user_id = ?';   params.push(client_id); }
  if (serveur_id) { query += ' AND c.serveur_id = ?';params.push(serveur_id); }
  query += ' ORDER BY c.opened_at DESC';

  try {
    const [orders] = await pool.query(query, params);
    for (const order of orders) {
      order.items = await loadItems(order.id);
    }
    return res.json(orders);
  } catch (err) {
    console.error('getAllOrders:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/orders/cuisine — commandes pour cuisinier ─────────
const getOrdersForCuisinier = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT c.*, u.first_name, u.last_name, t.table_number
       FROM commandes c
       JOIN  users u ON c.user_id = u.id
       LEFT JOIN tables_restaurant t ON c.table_id = t.id
       WHERE c.status IN ('nouveau', 'en_preparation')
       ORDER BY c.opened_at ASC`
    );
    for (const order of orders) {
      order.items = await loadItems(order.id);
    }
    return res.json(orders);
  } catch (err) {
    console.error('getOrdersForCuisinier:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/orders/:id/take — prise en charge (cuisinier) ───
const takeOrder = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Commande introuvable' });
    if (existing[0].status !== 'nouveau') {
      return res.status(400).json({ message: 'Commande déjà prise en charge' });
    }

    await pool.query("UPDATE commandes SET status = 'en_preparation' WHERE id = ?", [req.params.id]);
    const [updated] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);

    if (req.io) req.io.emit('order_in_progress', { orderId: req.params.id, status: 'en_preparation' });

    return res.json(updated[0]);
  } catch (err) {
    console.error('takeOrder:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/orders/:id/ready — commande prête (cuisinier) ───
const markOrderReady = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Commande introuvable' });
    if (existing[0].status !== 'en_preparation') {
      return res.status(400).json({ message: 'La commande doit être en préparation pour être marquée prête' });
    }

    await pool.query("UPDATE commandes SET status = 'pret' WHERE id = ?", [req.params.id]);
    const [updated] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);

    if (req.io) req.io.emit('order_ready', { orderId: req.params.id, status: 'pret' });

    return res.json(updated[0]);
  } catch (err) {
    console.error('markOrderReady:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/orders/:id/cancel — annuler une commande ────────
const cancelOrder = async (req, res) => {
  try {
    const { motif } = req.body;
    const [existing] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Commande introuvable' });

    await pool.query("UPDATE commandes SET status = 'annule' WHERE id = ?", [req.params.id]);
    const [updated] = await pool.query('SELECT * FROM commandes WHERE id = ?', [req.params.id]);

    if (req.io) req.io.emit('order_cancelled', { orderId: req.params.id, motif: motif || 'Annulée' });

    return res.json(updated[0]);
  } catch (err) {
    console.error('cancelOrder:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── À implémenter (feat/serveur-admin) ────────────────────────
const assignOrder  = (_req, res) => res.status(501).json({ message: 'À implémenter par feat/serveur-admin' });
const deliverOrder = (_req, res) => res.status(501).json({ message: 'À implémenter par feat/serveur-admin' });

module.exports = {
  create,
  getOne,
  getMine,
  getAllOrders,
  getOrdersForCuisinier,
  takeOrder,
  markOrderReady,
  cancelOrder,
  assignOrder,
  deliverOrder,
};