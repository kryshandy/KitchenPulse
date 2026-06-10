const db = require('../config/db');

// ════════════════════════════════════════════════════════════
// Dashboard admin — stats globales
// ════════════════════════════════════════════════════════════
const getDashboardStats = async (req, res) => {
  try {
    const [summaryRows] = await db.query(`
      SELECT
        IFNULL(SUM(\`total_amount\`), 0) AS total_revenue,
        COUNT(\`id\`)                    AS total_orders,
        IFNULL(AVG(\`total_amount\`), 0) AS average_basket
      FROM \`commandes\`
    `);

    const [lowStocksRows] = await db.query(`
      SELECT \`ingredient\`, \`quantity\`, \`alert_threshold\`, \`unit\`, \`pct_restant\`
      FROM \`v_stocks_alerte\`
      LIMIT 10
    `);

    const [topDishesRows] = await db.query(`
      SELECT \`name\`, \`nb_avis\`, \`note_moyenne\`
      FROM \`v_plats_notes\`
      ORDER BY \`note_moyenne\` DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        summary:         summaryRows[0],
        lowStocksWarning: lowStocksRows,
        topRatedDishes:   topDishesRows,
      }
    });
  } catch (error) {
    console.error('getDashboardStats:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques.' });
  }
};

// ════════════════════════════════════════════════════════════
// Serveur — commandes actives
// ════════════════════════════════════════════════════════════
const getActiveOrders = async (req, res) => {
  try {
    const [activeOrders] = await db.query('SELECT * FROM `v_commandes_actives`');
    return res.status(200).json({ success: true, count: activeOrders.length, data: activeOrders });
  } catch (error) {
    console.error('getActiveOrders:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur chargement commandes actives.' });
  }
};

// ════════════════════════════════════════════════════════════
// CA + commandes sur les 7 derniers jours — toujours 7 points
// ════════════════════════════════════════════════════════════
const getWeeklyStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE(opened_at)                AS jour,
        COUNT(*)                       AS nb_commandes,
        COALESCE(SUM(total_amount), 0) AS chiffre_affaires
      FROM commandes
      WHERE opened_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND status NOT IN ('ANNULEE')
      GROUP BY DATE(opened_at)
      ORDER BY jour ASC
    `);

    // Construire un tableau de 7 jours complets (0 si pas de données ce jour-là)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find(r => {
        const rDate = r.jour instanceof Date
          ? r.jour.toISOString().split('T')[0]
          : String(r.jour).split('T')[0];
        return rDate === dateStr;
      });
      result.push({
        jour:             dateStr,
        nb_commandes:     found ? Number(found.nb_commandes)     : 0,
        chiffre_affaires: found ? Number(found.chiffre_affaires) : 0,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error('getWeeklyStats:', err.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ════════════════════════════════════════════════════════════
// Export — UN SEUL module.exports à la fin
// ════════════════════════════════════════════════════════════
module.exports = { getDashboardStats, getActiveOrders, getWeeklyStats };