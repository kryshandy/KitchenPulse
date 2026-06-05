const db = require('../config/db');

/**
 * 👑 ADMIN : Récupérer les statistiques globales du Dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Calcul du résumé (Utilisation stricte des backticks pour éviter les conflits)
    const [summaryRows] = await db.query(`
      SELECT 
        IFNULL(SUM(\`total_amount\`), 0) AS total_revenue,
        COUNT(\`id\`) AS total_orders,
        IFNULL(AVG(\`total_amount\`), 0) AS average_basket
      FROM \`commandes\`
    `);

    // 2. Récupération des alertes
    const [lowStocksRows] = await db.query(`
      SELECT 
        \`ingredient\`,
        \`quantity\`,
        \`alert_threshold\`,
        \`unit\`,
        \`pct_restant\`
      FROM \`v_stocks_alerte\` 
      LIMIT 10
    `);

    // 3. Récupération des notes
    const [topDishesRows] = await db.query(`
      SELECT 
        \`name\`,
        \`nb_avis\`,
        \`note_moyenne\`
      FROM \`v_plats_notes\` 
      ORDER BY \`note_moyenne\` DESC
      LIMIT 5
    `);

    // Envoi des données au frontend
    return res.status(200).json({
      success: true,
      data: {
        summary: summaryRows[0],
        lowStocksWarning: lowStocksRows,
        topRatedDishes: topDishesRows
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans getDashboardStats :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques du dashboard.'
    });
  }
};

/**
 * 🧑‍🍳 SERVEUR : Récupérer la liste des commandes actives
 */
const getActiveOrders = async (req, res) => {
  try {
    const [activeOrders] = await db.query('SELECT * FROM `v_commandes_actives`');
    return res.status(200).json({
      success: true,
      count: activeOrders.length,
      data: activeOrders
    });
  } catch (error) {
    console.error('❌ Erreur dans getActiveOrders :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des commandes actives.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getActiveOrders
};