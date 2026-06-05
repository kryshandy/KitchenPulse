const pool = require('../config/db');

// GET /api/dishes
exports.getAll = async (req, res) => {
  const { category, search } = req.query;
  let sql = `
    SELECT p.*, c.name AS category_name, c.icon AS category_icon, c.color_hex,
           COALESCE(vp.note_moyenne, 0) AS note_moyenne,
           COALESCE(vp.nb_avis, 0) AS nb_avis
    FROM plats p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN v_plats_notes vp ON vp.id = p.id
    WHERE p.is_active = 1
  `;
  const params = [];
  if (category) { sql += ' AND c.slug = ?'; params.push(category); }
  if (search)   { sql += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY p.is_featured DESC, c.sort_order, p.name';

  try {
    const [dishes] = await pool.query(sql, params);

    // Allergènes par plat
    if (dishes.length) {
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
    }

    res.json(dishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/dishes/categories
exports.getCategories = async (_req, res) => {
  try {
    const [cats] = await pool.query(
      'SELECT id, name, slug, icon, color_hex FROM categories WHERE is_active = 1 ORDER BY sort_order'
    );
    res.json(cats);
  } catch {
    res.status(500).json({ message: 'Erreur' });
  }
};

// GET /api/dishes/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.icon AS category_icon,
              COALESCE(vp.note_moyenne, 0) AS note_moyenne,
              COALESCE(vp.nb_avis, 0) AS nb_avis
       FROM plats p JOIN categories c ON p.category_id = c.id
       LEFT JOIN v_plats_notes vp ON vp.id = p.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Plat introuvable' });

    const dish = rows[0];

    // Allergènes
    const [allergens] = await pool.query(
      `SELECT a.id, a.code, a.label, a.icon FROM plat_allergens pa
       JOIN allergies a ON pa.allergy_id = a.id WHERE pa.plat_id = ?`,
      [dish.id]
    );
    dish.allergens = allergens;

    // Nutriments
    const [nutri] = await pool.query(
      'SELECT * FROM plat_nutriments WHERE plat_id = ?', [dish.id]
    );
    dish.nutrition = nutri[0] || null;

    // Avis récents
    const [reviews] = await pool.query(
      `SELECT av.note, av.commentaire, av.created_at,
              u.first_name, u.last_name
       FROM avis av JOIN users u ON av.user_id = u.id
       WHERE av.plat_id = ? ORDER BY av.created_at DESC LIMIT 5`,
      [dish.id]
    );
    dish.reviews = reviews;

    res.json(dish);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};