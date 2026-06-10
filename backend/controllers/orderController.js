const pool = require('../config/db');

// -- GET /api/orders?status=RECUE,EN_PREPARATION ---------------
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

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      sql += ` AND c.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    if (user.role === 'client' || user.role === 'CLIENT') {
      sql += ' AND c.user_id = ?';
      params.push(user.id);
    }

    sql += ' ORDER BY c.opened_at DESC';

    const [orders] = await pool.query(sql, params);

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

// -- PATCH /api/orders/:id/status ------------------------------
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

    if (req.io) {
      req.io.to('cuisine').emit('order_status_update', { orderId: id, status });
      req.io.to('salle').emit('order_status_update', { orderId: id, status });
      req.io.to(`order:${id}`).emit('order_status_update', { orderId: id, status });

      if (status === 'PRETE') {
        req.io.to('salle').emit('order_ready', { orderId: id });
      }
    }

    return res.json({ message: `Commande passee a ${status}`, orderId: id, status });
  } catch (err) {
    console.error('updateOrderStatus:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// -- GET /api/orders/:id ---------------------------------------
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

// -- POST /api/orders ------------------------------------------
exports.createOrder = async (req, res) => {
  const { table_id, notes, items } = req.body;
  if (!table_id || !items?.length) {
    return res.status(400).json({ message: 'table_id et items sont requis' });
  }

  try {
    // ✅ Récupérer les vrais prix depuis la BD
    const platIds = items.map(i => i.plat_id);
    const [plats] = await pool.query(
      `SELECT id, price FROM plats WHERE id IN (?)`, [platIds]
    );
    const priceMap = {};
    plats.forEach(p => { priceMap[p.id] = Number(p.price); });

    // ✅ Calculer le total avec les prix BD
    let total = 0;
    const itemsAvecPrix = items.map(i => {
      const unitPrice = priceMap[i.plat_id];
      const itemTotal = unitPrice * Number(i.quantity);
      total += itemTotal;
      return { ...i, unit_price: unitPrice, item_total: itemTotal };
    });

    const [result] = await pool.execute(
      `INSERT INTO commandes (user_id, table_id, notes, subtotal, total_amount, order_number, status, payment_status, opened_at)
       VALUES (?, ?, ?, ?, ?, 'TEMP', 'RECUE', 'EN_ATTENTE', NOW())`,
      [req.user.id, table_id, notes || null, total, total]
    );
    const commandeId = result.insertId;

    for (const item of itemsAvecPrix) {
      await pool.execute(
        'INSERT INTO order_items (commande_id, plat_id, quantity, unit_price, item_total) VALUES (?, ?, ?, ?, ?)',
        [commandeId, item.plat_id, item.quantity, item.unit_price, item.item_total]
      );
    }

    const orderNumber = `KP-${String(commandeId).padStart(4, '0')}`;
    await pool.execute('UPDATE commandes SET order_number = ? WHERE id = ?', [orderNumber, commandeId]);

    // Payload enrichi pour la cuisine via Socket.io
    if (req.io) {
      const [tableRows] = await pool.execute(
        'SELECT table_number FROM tables_restaurant WHERE id = ?',
        [table_id]
      );
      const [itemRows] = await pool.query(
        `SELECT oi.quantity, oi.unit_price, oi.item_total,
                p.name AS plat_nom, p.prep_time_minutes
         FROM order_items oi
         JOIN plats p ON oi.plat_id = p.id
         WHERE oi.commande_id = ?`,
        [commandeId]
      );

      req.io.to('cuisine').emit('new_order', {
        commande_id:  commandeId,
        order_number: orderNumber,
        table_numero: tableRows[0]?.table_number ?? null,
        client:       { id: req.user.id, prenom: req.user.first_name },
        notes:        notes || null,
        total:        total,
        items:        itemRows,
        created_at:   new Date().toISOString(),
      });
    }

    return res.status(201).json({ commande_id: commandeId, order_number: orderNumber, total_amount: total });
  } catch (err) {
    console.error('createOrder:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// -- DELETE /api/orders/:id ------------------------------------
exports.deleteOrder = async (req, res) => {
  try {
    await pool.execute("UPDATE commandes SET status = 'ANNULEE' WHERE id = ?", [req.params.id]);

    if (req.io) {
      req.io.to('cuisine').emit('order_status_update', { orderId: req.params.id, status: 'ANNULEE' });
      req.io.to('salle').emit('order_status_update',   { orderId: req.params.id, status: 'ANNULEE' });
      req.io.to(`order:${req.params.id}`).emit('order_status_update', { orderId: req.params.id, status: 'ANNULEE' });
    }

    return res.json({ message: 'Commande annulee' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};