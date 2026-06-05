const db = require('../config/db');

/**
 * 🧑‍🍳 SERVEUR / ADMIN : Récupérer toutes les tables du restaurant
 * Permet au serveur de voir l'état de la salle en un coup d'œil
 */
const getAllTables = async (req, res) => {
  try {
    const [tables] = await db.query(
      'SELECT id, numero, capacite, statut, qr_code FROM tables_restaurant ORDER BY numero ASC'
    );

    return res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('❌ Erreur dans getAllTables :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la liste des tables.'
    });
  }
};

/**
 * 🧑‍🍳 SERVEUR : Modifier le statut d'une table
 * Exemple : Passer le statut à 'LIBRE' après avoir nettoyé la table
 */
const updateTableStatus = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  // Liste des statuts officiels définis dans l'ENUM de votre base de données finale
  const statutsAutorises = ['LIBRE', 'RESERVEE', 'OCCUPEE', 'EN_SERVICE', 'ADDITION_DEMANDEE', 'EN_NETTOYAGE'];

  if (!statut || !statutsAutorises.includes(statut.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Statut invalide. Les statuts autorisés sont : ${statutsAutorises.join(', ')}`
    });
  }

  try {
    // Vérification de l'existence de la table
    const [tableExists] = await db.query('SELECT id FROM tables_restaurant WHERE id = ?', [id]);
    if (tableExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "La table spécifiée n'existe pas."
      });
    }

    // Mise à jour du statut
    await db.query(
      'UPDATE tables_restaurant SET statut = ? WHERE id = ?',
      [statut.toUpperCase(), id]
    );

    return res.status(200).json({
      success: true,
      message: `Le statut de la table a bien été mis à jour en ${statut.toUpperCase()}.`
    });
  } catch (error) {
    console.error('❌ Erreur dans updateTableStatus :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la table.'
    });
  }
};

module.exports = {
  getAllTables,
  updateTableStatus
};