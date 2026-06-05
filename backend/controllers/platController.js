const db = require('../config/db'); // Assure-toi que le chemin vers ta config DB est correct

// 1. Récupérer tous les plats de la base de données
exports.getAllPlats = async (req, res) => {
  try {
    // Requête SQL pour extraire tous les plats triés par catégorie
    const [rows] = await db.query('SELECT * FROM plats ORDER BY category, name');
    
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur dans getAllPlats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la carte.'
    });
  }
};

// 2. Ajouter un nouveau plat dans la base de données
exports.createPlat = async (req, res) => {
  const { name, price, category } = req.body;

  // Validation simple des champs obligatoires
  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un nom, un prix et une catégorie.'
    });
  }

  try {
    // Requête SQL d'insertion
    const query = 'INSERT INTO plats (name, price, category) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [name, price, category]);

    return res.status(201).json({
      success: true,
      message: 'Plat ajouté avec succès !',
      data: {
        id: result.insertId,
        name,
        price,
        category
      }
    });
  } catch (error) {
    console.error('Erreur dans createPlat:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du plat en base de données."
    });
  }
};