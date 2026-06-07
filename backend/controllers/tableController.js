const pool = require('../config/db');

// GET /api/tables — liste toutes les tables actives
const getAllTables = async (req, res) => {
  try {
    const [tables] = await pool.query(
      `SELECT t.*,
              c.order_number, c.status AS order_status, c.total_amount
       FROM tables_restaurant t
       LEFT JOIN commandes c ON c.table_id = t.id
         AND c.status NOT IN ('CLOTUREE','ANNULEE')
       WHERE t.is_active = 1
       ORDER BY t.table_number`
    );
    res.json(tables);
  } catch (err) {
    console.error('getAllTables:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/tables/:id
const getTableById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tables_restaurant WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Table introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getTableById:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/tables/:id/status
const updateTableStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['LIBRE','OCCUPEE','EN_SERVICE','ADDITION_DEMANDEE','EN_NETTOYAGE','RESERVEE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  try {
    await pool.query(
      'UPDATE tables_restaurant SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: 'Statut mis à jour', status });
  } catch (err) {
    console.error('updateTableStatus:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllTables, getTableById, updateTableStatus };