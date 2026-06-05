const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');

const SECRET  = process.env.JWT_SECRET || 'kitchenpulse_secret';
const EXPIRES = '7d';

// POST /auth/register
exports.register = async (req, res) => {
  const { first_name, last_name, email, phone, password, table_number, allergies } = req.body;

  if (!first_name || !last_name || !password) {
    return res.status(400).json({ message: 'Prénom, nom et mot de passe requis' });
  }
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email ou téléphone requis' });
  }

  try {
    // Vérif unicité
    if (email) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length) return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    if (phone) {
      const [rows] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (rows.length) return res.status(409).json({ message: 'Téléphone déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'CLIENT')`,
      [first_name, last_name, email || null, phone || null, password_hash]
    );
    const userId = result.insertId;

    // Associer allergies si fournies
    if (allergies && allergies.length > 0) {
      for (const allergyId of allergies) {
        await pool.query(
          'INSERT IGNORE INTO profile_allergies (user_id, allergy_id) VALUES (?, ?)',
          [userId, allergyId]
        ).catch(() => {}); // ignore si table n'a pas les bons champs
      }
    }

    // Table de restaurant (facultatif)
    let tableInfo = null;
    if (table_number) {
      const [tables] = await pool.query(
        'SELECT id, table_number, label FROM tables_restaurant WHERE table_number = ? AND is_active = 1',
        [table_number]
      );
      tableInfo = tables[0] || null;
    }

    const token = jwt.sign({ id: userId, role: 'CLIENT', first_name, last_name }, SECRET, { expiresIn: EXPIRES });

    res.status(201).json({
      token,
      user: { id: userId, first_name, last_name, email, phone, role: 'CLIENT', table: tableInfo }
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
  }

  try {
    const field = email ? 'email' : 'phone';
    const value = email || phone;

    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role, password_hash, is_active
       FROM users WHERE ${field} = ?`,
      [value]
    );

    if (!rows.length) return res.status(401).json({ message: 'Identifiants incorrects' });

    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ message: 'Compte désactivé' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Identifiants incorrects' });

    // Récupérer allergies
    let allergies = [];
    try {
      const [a] = await pool.query(
        `SELECT al.id, al.code, al.label, al.icon
         FROM profile_allergies pa JOIN allergies al ON pa.allergy_id = al.id
         WHERE pa.user_id = ?`,
        [user.id]
      );
      allergies = a;
    } catch {}

    // Màj last_login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name },
      SECRET,
      { expiresIn: EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user.id, first_name: user.first_name, last_name: user.last_name,
        email: user.email, phone: user.phone, role: user.role, allergies
      }
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /auth/me
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, role, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Utilisateur introuvable' });

    let allergies = [];
    try {
      const [a] = await pool.query(
        `SELECT al.id, al.code, al.label, al.icon
         FROM profile_allergies pa JOIN allergies al ON pa.allergy_id = al.id
         WHERE pa.user_id = ?`,
        [req.user.id]
      );
      allergies = a;
    } catch {}

    res.json({ ...rows[0], allergies });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};