const db = require('../config/db');

/**
 * 👑 ADMIN : Récupérer les statistiques du Dashboard principal
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Chiffre d'affaires total et nombre de commandes validées
    const [salesStats] = await db.query(
      `SELECT 
        COUNT(id) AS total_orders, 
        IFNULL(SUM(total_amount), 0) AS total_revenue,
        IFNULL(AVG(total_amount), 0) AS average_basket
       FROM orders 
       WHERE status != 'CANCELLED'`
    );

    // 2. Récupérer les ingrédients en alerte de stock depuis la VUE SQL de votre BD finale !
    const [lowStocks] = await db.query('SELECT * FROM v_stocks_alerte');

    // 3. Récupérer le top des plats les mieux notés depuis l'autre VUE SQL de votre BD !
    const [topDishes] = await db.query('SELECT * FROM v_plats_notes ORDER BY note_moyenne DESC LIMIT 5');

    return res.status(200).json({
      success: true,
      data: {
        summary: salesStats[0],
        lowStocksWarning: lowStocks,
        topRatedDishes: topDishes
      }
    });
  } catch (error) {
    console.error('❌ Erreur dans getDashboardStats :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des statistiques du dashboard.'
    });
  }
};

/**
 * 🧑‍🍳 SERVEUR : Récupérer la liste des commandes actives (en préparation ou prêtes)
 * Utilise la vue SQL v_commandes_actives
 */
const getActiveOrders = async (req, res) => {
  try {
    const [activeOrders] = await db.query('SELECT * FROM v_commandes_actives');
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
  getActiveOrders // <-- Ne l'oublie pas !
};