// backend/controllers/dishController.js
const pool = require('../config/db');

// ── Slug automatique ──────────────────────────────────────────
const toSlug = (name) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    + '-' + Date.now();

// ── Helper : charger allergènes pour une liste de plats ───────
const loadAllergens = async (dishes) => {
  if (!dishes.length) return;
  const ids = dishes.map(d => d.id);
  const [allergens] = await pool.query(
    `SELECT pa.plat_id, a.id, a.code, a.label, a.icon
     FROM plat_allergens pa
     JOIN  allergies a ON pa.allergy_id = a.id
     WHERE pa.plat_id IN (?)`, [ids]
  );
  const map = {};
  allergens.forEach(a => {
    if (!map[a.plat_id]) map[a.plat_id] = [];
    map[a.plat_id].push({ id: a.id, code: a.code, label: a.label, icon: a.icon });
  });
  dishes.forEach(d => { d.allergens = map[d.id] || []; });
};

// ── Helper : filtre période SQL ───────────────────────────────
const periodFilter = (period, col = 'c.opened_at') => {
  switch (period) {
    case 'today':  return `AND DATE(${col}) = CURDATE()`;
    case 'week':   return `AND ${col} >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
    case 'month':  return `AND ${col} >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
    default:       return '';
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/dishes  (?disponible=all|true|false  &category=  &search=)
// ═══════════════════════════════════════════════════════════════
const getAllDishes = async (req, res) => {
  const { category, search, disponible } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name, c.icon AS category_icon, c.color_hex,
           COALESCE((SELECT ROUND(AVG(a.note),1) FROM avis a WHERE a.plat_id = p.id), 0) AS note_moyenne,
           COALESCE((SELECT COUNT(*)             FROM avis a WHERE a.plat_id = p.id), 0) AS nb_avis
    FROM plats p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // ✅ Fix disponible=all : ne pas filtrer sur is_active
  if (disponible === 'all') {
    // Aucun filtre is_active — retourne tout (actif + masqué) pour le cuisinier
  } else if (disponible !== undefined) {
    sql += ' AND p.is_active = ?';
    params.push(disponible === 'true' ? 1 : 0);
  } else {
    sql += ' AND p.is_active = 1'; // Par défaut : actifs seulement (menu client)
  }

  if (category) { sql += ' AND c.slug = ?';    params.push(category); }
  if (search)   { sql += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY p.is_featured DESC, c.sort_order, p.name';

  try {
    const [dishes] = await pool.query(sql, params);
    await loadAllergens(dishes);
    return res.json(dishes);
  } catch (err) {
    console.error('getAllDishes:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/dishes/categories
// ═══════════════════════════════════════════════════════════════
const getCategories = async (_req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT id, name, slug, icon, color_hex
       FROM categories
       WHERE is_active = 1
       ORDER BY sort_order`
    );
    return res.json(cats);
  } catch (err) {
    console.error('getCategories:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/dishes/:id
// ═══════════════════════════════════════════════════════════════
const getDishById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.icon AS category_icon,
              COALESCE((SELECT ROUND(AVG(a.note),1) FROM avis a WHERE a.plat_id = p.id), 0) AS note_moyenne,
              COALESCE((SELECT COUNT(*)             FROM avis a WHERE a.plat_id = p.id), 0) AS nb_avis
       FROM plats p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Plat introuvable' });

    const dish = rows[0];

    // Allergènes
    const [allergens] = await pool.query(
      `SELECT a.id, a.code, a.label, a.icon
       FROM plat_allergens pa
       JOIN  allergies a ON pa.allergy_id = a.id
       WHERE pa.plat_id = ?`,
      [dish.id]
    );
    dish.allergens = allergens;

    // Nutriments
    const [nutri] = await pool.query('SELECT * FROM plat_nutriments WHERE plat_id = ?', [dish.id]);
    dish.nutrition = nutri[0] || null;

    // Avis (5 derniers)
    const [reviews] = await pool.query(
      `SELECT av.note, av.commentaire, av.created_at, u.first_name, u.last_name
       FROM avis av
       JOIN users u ON av.user_id = u.id
       WHERE av.plat_id = ?
       ORDER BY av.created_at DESC LIMIT 5`,
      [dish.id]
    );
    dish.reviews = reviews;

    // Ingrédients
    try {
      const [ings] = await pool.query(
        `SELECT pi.id, i.name, pi.quantity, pi.unit, pi.optional, pi.removable
         FROM plat_ingredients pi
         JOIN ingredients i ON pi.ingredient_id = i.id
         WHERE pi.plat_id = ?
         ORDER BY pi.sort_order`,
        [dish.id]
      );
      dish.ingredients = ings;
    } catch {
      dish.ingredients = []; // Table plat_ingredients peut être vide
    }

    return res.json(dish);
  } catch (err) {
    console.error('getDishById:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/dishes/:id/ingredients
// Body : { ingredients: [{name, quantity, unit}] }
// ═══════════════════════════════════════════════════════════════
const saveIngredients = async (req, res) => {
  const platId = req.params.id;
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'ingredients doit être un tableau' });
  }

  try {
    // Vérifier que le plat existe
    const [platRows] = await pool.query('SELECT id FROM plats WHERE id = ?', [platId]);
    if (!platRows.length) return res.status(404).json({ message: 'Plat introuvable' });

    // Supprimer les anciens ingrédients
    await pool.query('DELETE FROM plat_ingredients WHERE plat_id = ?', [platId]);

    // Insérer les nouveaux
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.name?.trim()) continue;

      // Trouver ou créer l'ingrédient dans la table ingredients
      let ingId;
      const [existing] = await pool.query(
        'SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)',
        [ing.name.trim()]
      );
      if (existing.length) {
        ingId = existing[0].id;
      } else {
        const [ins] = await pool.query(
          'INSERT INTO ingredients (name, unit, is_active) VALUES (?, ?, 1)',
          [ing.name.trim(), ing.unit || 'g']
        );
        ingId = ins.insertId;
      }

      await pool.query(
        `INSERT INTO plat_ingredients (plat_id, ingredient_id, quantity, unit, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [platId, ingId, parseFloat(ing.quantity) || 0, ing.unit || 'g', i]
      );
    }

    return res.json({ message: `${ingredients.length} ingrédient(s) enregistré(s)`, platId });
  } catch (err) {
    console.error('saveIngredients:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/dishes/my-reviews   (avis reçus sur tous les plats)
// ═══════════════════════════════════════════════════════════════
const getMyReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT av.id, av.note, av.commentaire, av.created_at,
              p.name AS plat_name, p.id AS plat_id,
              u.first_name, u.last_name
       FROM avis av
       JOIN plats p ON av.plat_id = p.id
       JOIN users u ON av.user_id = u.id
       ORDER BY av.created_at DESC
       LIMIT 100`
    );
    return res.json(rows);
  } catch (err) {
    console.error('getMyReviews:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/dishes/stats?period=today|week|month
// ═══════════════════════════════════════════════════════════════
const getStats = async (req, res) => {
  const period = req.query.period || 'today';
  const pf = periodFilter(period);

  try {
    // Commandes servies / clôturées
    const [[{ commandes_servies }]] = await pool.query(
      `SELECT COUNT(*) AS commandes_servies
       FROM commandes c
       WHERE c.status IN ('SERVIE','CLOTUREE') ${pf}`
    );

    // Plats préparés (nombre total d'items dans les commandes de la période)
    const [[{ plats_prepares }]] = await pool.query(
      `SELECT COALESCE(SUM(oi.quantity), 0) AS plats_prepares
       FROM order_items oi
       JOIN commandes c ON oi.commande_id = c.id
       WHERE c.status IN ('EN_PREPARATION','PRETE','SERVIE','CLOTUREE') ${pf}`
    );

    // Note moyenne globale
    const [[{ note_moyenne }]] = await pool.query(
      `SELECT COALESCE(ROUND(AVG(a.note), 1), 0) AS note_moyenne FROM avis a`
    );

    // Plats actifs
    const [[{ plats_actifs }]] = await pool.query(
      `SELECT COUNT(*) AS plats_actifs FROM plats WHERE is_active = 1`
    );

    // Top 5 plats les plus commandés sur la période
    const [top_plats] = await pool.query(
      `SELECT p.name AS nom, SUM(oi.quantity) AS ventes
       FROM order_items oi
       JOIN plats p      ON oi.plat_id = p.id
       JOIN commandes c  ON oi.commande_id = c.id
       WHERE c.status IN ('SERVIE','CLOTUREE') ${pf}
       GROUP BY p.id, p.name
       ORDER BY ventes DESC
       LIMIT 5`
    );

    // Notes par plat (top 5 les plus notés)
    const [notes_par_plat] = await pool.query(
      `SELECT p.name AS nom,
              ROUND(AVG(a.note), 1)  AS note_moyenne,
              COUNT(a.id)            AS nb_avis
       FROM avis a
       JOIN plats p ON a.plat_id = p.id
       GROUP BY p.id, p.name
       HAVING COUNT(a.id) > 0
       ORDER BY note_moyenne DESC, nb_avis DESC
       LIMIT 5`
    );

    return res.json({
      commandes_servies: Number(commandes_servies),
      plats_prepares:    Number(plats_prepares),
      note_moyenne:      Number(note_moyenne),
      plats_actifs:      Number(plats_actifs),
      top_plats,
      notes_par_plat,
    });
  } catch (err) {
    console.error('getStats:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/dishes
// ═══════════════════════════════════════════════════════════════
const createDish = async (req, res) => {
  const { name, description, price, category_id, prep_time_minutes, is_featured, calories, proteins, lipids, glucids, fibers } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Champs obligatoires : name, price, category_id' });
  }

  let image_url = req.body.image_url || null;
  if (req.file) image_url = `/uploads/dishes/${req.file.filename}`;

  const slug = toSlug(name);

  try {
    const [result] = await pool.query(
      `INSERT INTO plats (name, slug, description, price, category_id, image_url, prep_time_minutes, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [name, slug, description || '', parseFloat(price), parseInt(category_id), image_url, parseInt(prep_time_minutes) || 15, is_featured == 1 || is_featured === 'true' || is_featured === true ? 1 : 0]
    );
    const platId = result.insertId;

    // Nutriments
    if (calories || proteins || lipids || glucids) {
      await pool.query(
        `INSERT INTO plat_nutriments (plat_id, calories, proteins, lipids, glucids, fibers) VALUES (?,?,?,?,?,?)`,
        [platId, calories || 0, proteins || 0, lipids || 0, glucids || 0, fibers || 0]
      );
    }

    const [newDish] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM plats p JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [platId]
    );
    return res.status(201).json({ ...newDish[0], id: platId });
  } catch (err) {
    console.error('createDish:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// PATCH /api/dishes/:id
// ═══════════════════════════════════════════════════════════════
const updateDish = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, prep_time_minutes, is_active, is_featured, calories, proteins, lipids, glucids, fibers } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM plats WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Plat introuvable' });
    const d = existing[0];

    let image_url = d.image_url;
    if (req.file) image_url = `/uploads/dishes/${req.file.filename}`;
    else if (req.body.image_url !== undefined) image_url = req.body.image_url;

    // Normaliser is_active (peut arriver en string "0"/"1" depuis FormData ou JSON)
    const newIsActive   = is_active   !== undefined ? (Number(is_active)   > 0 ? 1 : 0) : d.is_active;
    const newIsFeatured = is_featured !== undefined ? (Number(is_featured) > 0 ? 1 : 0) : d.is_featured;

    await pool.query(
      `UPDATE plats SET name=?, description=?, price=?, category_id=?,
       image_url=?, prep_time_minutes=?, is_active=?, is_featured=?
       WHERE id=?`,
      [
        name        !== undefined ? name              : d.name,
        description !== undefined ? description       : d.description,
        price       !== undefined ? parseFloat(price) : d.price,
        category_id !== undefined ? parseInt(category_id) : d.category_id,
        image_url,
        prep_time_minutes !== undefined ? parseInt(prep_time_minutes) : d.prep_time_minutes,
        newIsActive,
        newIsFeatured,
        id,
      ]
    );

    // Nutriments
    if (calories !== undefined || proteins !== undefined) {
      const [nutri] = await pool.query('SELECT id FROM plat_nutriments WHERE plat_id = ?', [id]);
      if (nutri.length) {
        await pool.query(
          `UPDATE plat_nutriments SET calories=?, proteins=?, lipids=?, glucids=?, fibers=? WHERE plat_id=?`,
          [calories || 0, proteins || 0, lipids || 0, glucids || 0, fibers || 0, id]
        );
      } else {
        await pool.query(
          `INSERT INTO plat_nutriments (plat_id, calories, proteins, lipids, glucids, fibers) VALUES (?,?,?,?,?,?)`,
          [id, calories || 0, proteins || 0, lipids || 0, glucids || 0, fibers || 0]
        );
      }
    }

    const [updated] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM plats p JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [id]
    );
    return res.json(updated[0]);
  } catch (err) {
    console.error('updateDish:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// DELETE /api/dishes/:id
// ═══════════════════════════════════════════════════════════════
const deleteDish = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM plats WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Plat introuvable' });
    await pool.query('DELETE FROM plats WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Plat supprimé avec succès' });
  } catch (err) {
    console.error('deleteDish:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

module.exports = {
  getAllDishes,
  getCategories,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  saveIngredients,
  getMyReviews,
  getStats,
};