const pool = require('../config/db');

// Génère un numéro de commande unique
const genOrderNumber = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `KP-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(Math.random()*9000+1000)}`;
};

// POST /api/orders — créer une commande
exports.create = async (req, res) => {
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
        'SELECT id, name, price, is_active FROM plats WHERE id = ?', [item.plat_id]
      );
      if (!rows.length || !rows[0].is_active) {
        await conn.rollback();
        return res.status(400).json({ message: `Plat #${item.plat_id} indisponible` });
      }
      enriched.push({ ...rows[0], quantity: item.quantity || 1, instructions: item.special_instructions || '' });
      subtotal += rows[0].price * (item.quantity || 1);
    }

    const tax_amount = subtotal * 0.1925; // TVA Cameroun
    const total_amount = subtotal + tax_amount;

    // Trouver une table si non fournie
    let tableId = table_id;
    if (!tableId) {
      const [tables] = await conn.query(
        "SELECT id FROM tables_restaurant WHERE status = 'LIBRE' AND is_active = 1 LIMIT 1"
      );
      tableId = tables[0]?.id || 1;
    }

    // Créer la commande
    const [orderResult] = await conn.query(
      `INSERT INTO commandes (table_id, user_id, status, payment_status, order_number, subtotal, tax_amount, total_amount, notes, opened_at)
       VALUES (?, ?, 'RECUE', 'EN_ATTENTE', ?, ?, ?, ?, ?, NOW())`,
      [tableId, req.user.id, genOrderNumber(), subtotal, tax_amount, total_amount, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insérer les items
    for (const item of enriched) {
      await conn.query(
        `INSERT INTO order_items (commande_id, plat_id, quantity, unit_price, subtotal, special_instructions, status)
         VALUES (?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
        [orderId, item.id, item.quantity, item.price, item.price * item.quantity, item.instructions]
      );
    }

    await conn.commit();

    // Émettre l'événement socket
    if (req.io) {
      req.io.to('cuisine').emit('new_order', { orderId, order_number: genOrderNumber(), items: enriched });
    }

    res.status(201).json({
      id: orderId,
      subtotal, tax_amount, total_amount,
      message: 'Commande envoyée en cuisine !'
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la commande' });
  } finally {
    conn.release();
  }
};

// GET /api/orders/:id — suivi commande
exports.getOne = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT c.id, c.order_number, c.status, c.payment_status, c.subtotal,
              c.tax_amount, c.total_amount, c.notes, c.opened_at, c.updated_at,
              t.table_number, t.label AS table_label
       FROM commandes c
       LEFT JOIN tables_restaurant t ON c.table_id = t.id
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Commande introuvable' });

    const order = orders[0];

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url, p.prep_time_minutes
       FROM order_items oi JOIN plats p ON oi.plat_id = p.id
       WHERE oi.commande_id = ?`,
      [order.id]
    );
    order.items = items;

    // Historique de statuts
    const [history] = await pool.query(
      `SELECT previous_status, new_status, changed_at
       FROM order_status_history WHERE commande_id = ? ORDER BY changed_at`,
      [order.id]
    );
    order.status_history = history;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/orders — mes commandes
exports.getMine = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT c.id, c.order_number, c.status, c.payment_status, c.total_amount, c.opened_at, c.updated_at,
              t.table_number
       FROM commandes c LEFT JOIN tables_restaurant t ON c.table_id = t.id
       WHERE c.user_id = ? ORDER BY c.opened_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};