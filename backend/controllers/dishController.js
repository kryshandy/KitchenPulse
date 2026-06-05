const db = require('../config/db');

// ─── GET tous les plats ─────────────────────────────────────────────────────
const getAllDishes = async (req, res) => {
  try {
    const { categorie, disponible } = req.query;
    let query = 'SELECT * FROM dishes WHERE 1=1';
    const params = [];

    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }
    if (disponible !== undefined) {
      query += ' AND disponible = ?';
      params.push(disponible === 'true' ? 1 : 0);
    }

    query += ' ORDER BY categorie, nom';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getAllDishes:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── GET un plat par ID ─────────────────────────────────────────────────────
const getDishById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plat non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getDishById:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── POST créer un plat ─────────────────────────────────────────────────────
const createDish = async (req, res) => {
  try {
    const { nom, description, prix, calories, categorie, photo, disponible } = req.body;

    if (!nom || !prix || !categorie) {
      return res.status(400).json({ message: 'Champs obligatoires : nom, prix, categorie' });
    }

    const [result] = await db.query(
      `INSERT INTO dishes (nom, description, prix, calories, categorie, photo, disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        description || '',
        parseFloat(prix),
        parseInt(calories) || 0,
        categorie,
        photo || '',
        disponible !== undefined ? (disponible ? 1 : 0) : 1,
      ]
    );

    const [newDish] = await db.query('SELECT * FROM dishes WHERE id = ?', [result.insertId]);
    res.status(201).json(newDish[0]);
  } catch (err) {
    console.error('createDish:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── PATCH modifier un plat ─────────────────────────────────────────────────
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, calories, categorie, photo, disponible } = req.body;

    const [existing] = await db.query('SELECT * FROM dishes WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Plat non trouvé' });

    const dish = existing[0];

    await db.query(
      `UPDATE dishes SET nom=?, description=?, prix=?, calories=?, categorie=?, photo=?, disponible=?
       WHERE id=?`,
      [
        nom        !== undefined ? nom        : dish.nom,
        description !== undefined ? description : dish.description,
        prix        !== undefined ? parseFloat(prix) : dish.prix,
        calories    !== undefined ? parseInt(calories) : dish.calories,
        categorie   !== undefined ? categorie : dish.categorie,
        photo       !== undefined ? photo     : dish.photo,
        disponible  !== undefined ? (disponible ? 1 : 0) : dish.disponible,
        id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM dishes WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updateDish:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ─── DELETE supprimer un plat ───────────────────────────────────────────────
const deleteDish = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Plat non trouvé' });

    await db.query('DELETE FROM dishes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plat supprimé avec succès' });
  } catch (err) {
    console.error('deleteDish:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllDishes, getDishById, createDish, updateDish, deleteDish };