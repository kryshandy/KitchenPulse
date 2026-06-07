const pool = require('../config/db');
const path = require('path');

// ── Slug automatique depuis le nom ─────────────────────────────
const toSlug = (name) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    + '-' + Date.now();

// ── Helper : charger allergènes ────────────────────────────────
const loadAllergens = async (dishes) => {
  if (!dishes.length) return;
  const ids = dishes.map(d => d.id);
  const [allergens] = await pool.query(
    `SELECT pa.plat_id, a.id, a.code, a.label, a.icon
     FROM plat_allergens pa JOIN allergies a ON pa.allergy_id = a.id
     WHERE pa.plat_id IN (?)`, [ids]
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
           COALESCE((SELECT ROUND(AVG(a.note),1) FROM avis a WHERE a.plat_id = p.id), 0) AS note_moyenne,
           COALESCE((SELECT COUNT(*) FROM avis a WHERE a.plat_id = p.id), 0) AS nb_avis
    FROM plats p
    JOIN  categories c    ON p.category_id = c.id
    
    WHERE 1=1
  `;
  const params = [];
  if (disponible !== undefined && disponible !== 'all') { sql += ' AND p.is_active = ?'; params.push(disponible === 'true' ? 1 : 0); }
  else { sql += ' AND p.is_active = 1'; }
  if (category) { sql += ' AND c.slug = ?'; params.push(category); }
  if (search)   { sql += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
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
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/dishes/:id ────────────────────────────────────────
const getDishById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.icon AS category_icon,
              COALESCE((SELECT ROUND(AVG(a.note),1) FROM avis a WHERE a.plat_id = p.id), 0) AS note_moyenne,
              COALESCE((SELECT COUNT(*) FROM avis a WHERE a.plat_id = p.id), 0) AS nb_avis
       FROM plats p
       JOIN  categories c ON p.category_id = c.id
       
       WHERE p.id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Plat introuvable' });
    const dish = rows[0];
    const [allergens] = await pool.query(
      `SELECT a.id, a.code, a.label, a.icon
       FROM plat_allergens pa JOIN allergies a ON pa.allergy_id = a.id WHERE pa.plat_id = ?`,
      [dish.id]
    );
    dish.allergens = allergens;
    const [nutri] = await pool.query('SELECT * FROM plat_nutriments WHERE plat_id = ?', [dish.id]);
    dish.nutrition = nutri[0] || null;
    const [reviews] = await pool.query(
      `SELECT av.note, av.commentaire, av.created_at, u.first_name, u.last_name
       FROM avis av JOIN users u ON av.user_id = u.id
       WHERE av.plat_id = ? ORDER BY av.created_at DESC LIMIT 5`, [dish.id]
    );
    dish.reviews = reviews;
    return res.json(dish);
  } catch (err) {
    console.error('getDishById:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── POST /api/dishes ───────────────────────────────────────────
const createDish = async (req, res) => {
  const {
    name, description, price, category_id,
    prep_time_minutes, is_featured,
    // Nutrition optionnelle
    calories, proteins, lipids, glucids, fibers
  } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Champs obligatoires : name, price, category_id' });
  }

  // Image : multer stocke dans req.file
  let image_url = req.body.image_url || null;
  if (req.file) {
    image_url = `/uploads/dishes/${req.file.filename}`;
  }

  const slug = toSlug(name);

  try {
    const [result] = await pool.query(
      `INSERT INTO plats (name, slug, description, price, category_id, image_url, prep_time_minutes, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        name, slug,
        description || '',
        parseFloat(price),
        parseInt(category_id),
        image_url,
        parseInt(prep_time_minutes) || 15,
        is_featured ? 1 : 0,
      ]
    );
    const platId = result.insertId;

    // Insérer nutriments si fournis
    if (calories || proteins || lipids || glucids) {
      await pool.query(
        `INSERT INTO plat_nutriments (plat_id, calories, proteins, lipids, glucids, fibers)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [platId, calories||0, proteins||0, lipids||0, glucids||0, fibers||0]
      );
    }

    const [newDish] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM plats p
       JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [platId]
    );
    return res.status(201).json(newDish[0]);
  } catch (err) {
    console.error('createDish:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/dishes/:id ──────────────────────────────────────
const updateDish = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, category_id,
    prep_time_minutes, is_active, is_featured,
    calories, proteins, lipids, glucids, fibers
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM plats WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Plat introuvable' });
    const d = existing[0];

    let image_url = d.image_url;
    if (req.file) image_url = `/uploads/dishes/${req.file.filename}`;
    else if (req.body.image_url !== undefined) image_url = req.body.image_url;

    await pool.query(
      `UPDATE plats SET name=?, description=?, price=?, category_id=?,
       image_url=?, prep_time_minutes=?, is_active=?, is_featured=? WHERE id=?`,
      [
        name        !== undefined ? name        : d.name,
        description !== undefined ? description : d.description,
        price       !== undefined ? parseFloat(price) : d.price,
        category_id !== undefined ? parseInt(category_id) : d.category_id,
        image_url,
        prep_time_minutes !== undefined ? parseInt(prep_time_minutes) : d.prep_time_minutes,
        is_active   !== undefined ? (is_active   ? 1 : 0) : d.is_active,
        is_featured !== undefined ? (is_featured ? 1 : 0) : d.is_featured,
        id,
      ]
    );

    // Mettre à jour nutriments si fournis
    if (calories !== undefined || proteins !== undefined) {
      const [nutri] = await pool.query('SELECT id FROM plat_nutriments WHERE plat_id = ?', [id]);
      if (nutri.length) {
        await pool.query(
          `UPDATE plat_nutriments SET calories=?, proteins=?, lipids=?, glucids=?, fibers=? WHERE plat_id=?`,
          [calories||0, proteins||0, lipids||0, glucids||0, fibers||0, id]
        );
      } else {
        await pool.query(
          `INSERT INTO plat_nutriments (plat_id, calories, proteins, lipids, glucids, fibers) VALUES (?,?,?,?,?,?)`,
          [id, calories||0, proteins||0, lipids||0, glucids||0, fibers||0]
        );
      }
    }

    const [updated] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM plats p
       JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]
    );
    return res.json(updated[0]);
  } catch (err) {
    console.error('updateDish:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── DELETE /api/dishes/:id ─────────────────────────────────────
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