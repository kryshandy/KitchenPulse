const pool = require('../config/db');

// ── Helper : charger allergènes pour une liste de plats ────────
const loadAllergens = async (dishes) => {
  if (!dishes.length) return;
  const ids = dishes.map(d => d.id);
  const [allergens] = await pool.query(
    `SELECT pa.plat_id, a.id, a.code, a.label, a.icon
     FROM plat_allergens pa JOIN allergies a ON pa.allergy_id = a.id
     WHERE pa.plat_id IN (?)`,
    [ids]
  );
  const map = {};
  allergens.forEach(a => {
    if (!map[a.plat_id]) map[a.plat_id] = [];
    map[a.plat_id].push({ id: a.id, code: a.code, label: a.label, icon: a.icon });
  });
  dishes.forEach(d => { d.allergens = map[d.id] || []; });
};

// ── GET /api/dishes ────────────────────────────────────────────
const getAllDishes = async (req, res) => {
  const { category, search, disponible } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name, c.icon AS category_icon, c.color_hex,
           COALESCE(vp.note_moyenne, 0) AS note_moyenne,
           COALESCE(vp.nb_avis, 0)     AS nb_avis
    FROM plats p
    JOIN  categories c    ON p.category_id = c.id
    LEFT JOIN v_plats_notes vp ON vp.id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (disponible !== undefined) {
    sql += ' AND p.is_active = ?';
    params.push(disponible === 'true' ? 1 : 0);
  } else {
    sql += ' AND p.is_active = 1';
  }
  if (category) { sql += ' AND c.slug = ?';       params.push(category); }
  if (search)   { sql += ' AND p.name LIKE ?';    params.push(`%${search}%`); }

  sql += ' ORDER BY p.is_featured DESC, c.sort_order, p.name';

  try {
    const [dishes] = await pool.query(sql, params);
    await loadAllergens(dishes);
    return res.json(dishes);
  } catch (err) {
    console.error('getAllDishes:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/dishes/categories ─────────────────────────────────
const getCategories = async (_req, res) => {
  try {
    const [cats] = await pool.query(
      'SELECT id, name, slug, icon, color_hex FROM categories WHERE is_active = 1 ORDER BY sort_order'
    );
    return res.json(cats);
  } catch (err) {
    console.error('getCategories:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/dishes/:id ────────────────────────────────────────
const getDishById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.icon AS category_icon,
              COALESCE(vp.note_moyenne, 0) AS note_moyenne,
              COALESCE(vp.nb_avis, 0)     AS nb_avis
       FROM plats p
       JOIN  categories c    ON p.category_id = c.id
       LEFT JOIN v_plats_notes vp ON vp.id = p.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Plat introuvable' });

    const dish = rows[0];

    // Allergènes
    const [allergens] = await pool.query(
      `SELECT a.id, a.code, a.label, a.icon
       FROM plat_allergens pa JOIN allergies a ON pa.allergy_id = a.id
       WHERE pa.plat_id = ?`,
      [dish.id]
    );
    dish.allergens = allergens;

    // Nutriments
    const [nutri] = await pool.query(
      'SELECT * FROM plat_nutriments WHERE plat_id = ?', [dish.id]
    );
    dish.nutrition = nutri[0] || null;

    // Avis récents (5 derniers)
    const [reviews] = await pool.query(
      `SELECT av.note, av.commentaire, av.created_at,
              u.first_name, u.last_name
       FROM avis av JOIN users u ON av.user_id = u.id
       WHERE av.plat_id = ? ORDER BY av.created_at DESC LIMIT 5`,
      [dish.id]
    );
    dish.reviews = reviews;

    return res.json(dish);
  } catch (err) {
    console.error('getDishById:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── POST /api/dishes  (admin/gérant) ──────────────────────────
const createDish = async (req, res) => {
  const { name, description, price, category_id, calories, image_url, is_active, is_featured } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Champs obligatoires : name, price, category_id' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO plats (name, description, price, category_id, calories, image_url, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description  || '',
        parseFloat(price),
        category_id,
        parseInt(calories) || 0,
        image_url    || '',
        is_active    !== undefined ? (is_active   ? 1 : 0) : 1,
        is_featured  !== undefined ? (is_featured ? 1 : 0) : 0,
      ]
    );
    const [newDish] = await pool.query('SELECT * FROM plats WHERE id = ?', [result.insertId]);
    return res.status(201).json(newDish[0]);
  } catch (err) {
    console.error('createDish:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/dishes/:id  (admin/gérant) ─────────────────────
const updateDish = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, calories, image_url, is_active, is_featured } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM plats WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Plat introuvable' });

    const d = existing[0];
    await pool.query(
      `UPDATE plats
       SET name=?, description=?, price=?, category_id=?, calories=?, image_url=?, is_active=?, is_featured=?
       WHERE id=?`,
      [
        name        !== undefined ? name        : d.name,
        description !== undefined ? description : d.description,
        price       !== undefined ? parseFloat(price) : d.price,
        category_id !== undefined ? category_id : d.category_id,
        calories    !== undefined ? parseInt(calories) : d.calories,
        image_url   !== undefined ? image_url   : d.image_url,
        is_active   !== undefined ? (is_active   ? 1 : 0) : d.is_active,
        is_featured !== undefined ? (is_featured ? 1 : 0) : d.is_featured,
        id,
      ]
    );
    const [updated] = await pool.query('SELECT * FROM plats WHERE id = ?', [id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('updateDish:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── DELETE /api/dishes/:id  (admin/gérant) ────────────────────
const deleteDish = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM plats WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Plat introuvable' });

    await pool.query('DELETE FROM plats WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Plat supprimé avec succès' });
  } catch (err) {
    console.error('deleteDish:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllDishes, getCategories, getDishById, createDish, updateDish, deleteDish };