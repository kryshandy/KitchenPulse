const db = require('../config/db');

// ─── GET commandes pour le cuisinier ───────────────────────────────────────
// Retourne les commandes avec statut 'nouveau' ou 'en_preparation'
const getOrdersForCuisinier = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.nom AS client_nom
       FROM orders o
       JOIN users u ON o.client_id = u.id
       WHERE o.statut IN ('nouveau', 'en_preparation')
       ORDER BY o.created_at ASC`
    );

    // Pour chaque commande, récupérer les items
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, d.nom AS dish_nom, d.photo, d.categorie
         FROM order_items oi
         JOIN dishes d ON oi.dish_id = d.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('getOrdersForCuisinier:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── PATCH marquer une commande "en préparation" ────────────────────────────
const takeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Commande non trouvée' });

    if (existing[0].statut !== 'nouveau') {
      return res.status(400).json({ message: 'Cette commande est déjà prise en charge' });
    }

    await db.query("UPDATE orders SET statut = 'en_preparation' WHERE id = ?", [id]);
    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    // Émettre l'événement Socket.io si disponible
    const io = req.app.get('io');
    if (io) {
      io.emit('order_in_progress', { orderId: id, statut: 'en_preparation' });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error('takeOrder:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── PATCH marquer une commande "prête" ────────────────────────────────────
const markOrderReady = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Commande non trouvée' });

    if (existing[0].statut !== 'en_preparation') {
      return res.status(400).json({
        message: 'La commande doit être en préparation avant d\'être marquée prête',
      });
    }

    await db.query("UPDATE orders SET statut = 'pret' WHERE id = ?", [id]);
    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('order_ready', { orderId: id, statut: 'pret' });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error('markOrderReady:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── DELETE supprimer une commande (annulation cuisine) ────────────────────
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Commande non trouvée' });

    // Supprimer d'abord les order_items (clé étrangère)
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await db.query('DELETE FROM orders WHERE id = ?', [id]);

    // Notifier via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('order_cancelled', { orderId: id, motif: motif || 'Annulé par la cuisine' });
    }

    res.json({ message: 'Commande supprimée', motif });
  } catch (err) {
    console.error('deleteOrder:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── Fonctions pour les autres branches (placeholders) ────────────────────
// Ces fonctions seront complétées par feat/client-ui et feat/serveur-admin

const getAllOrders = async (req, res) => {
  try {
    const { statut, client_id, serveur_id } = req.query;
    let query = `SELECT o.*, u.nom AS client_nom FROM orders o JOIN users u ON o.client_id = u.id WHERE 1=1`;
    const params = [];

    if (statut) { query += ' AND o.statut = ?'; params.push(statut); }
    if (client_id) { query += ' AND o.client_id = ?'; params.push(client_id); }
    if (serveur_id) { query += ' AND o.serveur_id = ?'; params.push(serveur_id); }

    query += ' ORDER BY o.created_at DESC';
    const [orders] = await db.query(query, params);

    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, d.nom AS dish_nom FROM order_items oi JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('getAllOrders:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createOrder = async (req, res) => {
  res.status(501).json({ message: 'Implémenté par feat/client-ui' });
};

const assignOrder = async (req, res) => {
  res.status(501).json({ message: 'Implémenté par feat/serveur-admin' });
};

const deliverOrder = async (req, res) => {
  res.status(501).json({ message: 'Implémenté par feat/serveur-admin' });
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Commande non trouvée' });

    await db.query("UPDATE orders SET statut = 'annule' WHERE id = ?", [id]);
    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) io.emit('order_cancelled', { orderId: id });

    res.json(updated[0]);
  } catch (err) {
    console.error('cancelOrder:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getOrdersForCuisinier,
  takeOrder,
  markOrderReady,
  deleteOrder,
  getAllOrders,
  createOrder,
  assignOrder,
  deliverOrder,
  cancelOrder,
};