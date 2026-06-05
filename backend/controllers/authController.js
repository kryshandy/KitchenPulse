const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

const SECRET  = process.env.JWT_SECRET || 'kitchenpulse_secret';
const EXPIRES = '7d';

// Rôles autorisés à l'inscription publique
const PUBLIC_ROLES = ['CLIENT', 'client'];

// ── POST /api/auth/register ────────────────────────────────────
const register = async (req, res) => {
  const { first_name, last_name, email, phone, password, role, table_number, allergies } = req.body;

  if (!first_name || !last_name || !password) {
    return res.status(400).json({ message: 'Prénom, nom et mot de passe requis' });
  }
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email ou téléphone requis' });
  }

  // Sécurité : on n'autorise pas l'auto-attribution de rôles privilégiés
  const userRole = PUBLIC_ROLES.includes(role) ? 'CLIENT' : 'CLIENT';

  try {
    // Vérif unicité email
    if (email) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length) return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    // Vérif unicité téléphone
    if (phone) {
      const [rows] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (rows.length) return res.status(409).json({ message: 'Téléphone déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email || null, phone || null, password_hash, userRole]
    );
    const userId = result.insertId;

    // Associer les allergies si fournies (table profile_allergies)
    if (Array.isArray(allergies) && allergies.length > 0) {
      for (const allergyId of allergies) {
        await pool.query(
          'INSERT IGNORE INTO profile_allergies (user_id, allergy_id) VALUES (?, ?)',
          [userId, allergyId]
        ).catch(() => {});
      }
    }

    // Info table de restaurant (facultatif)
    let tableInfo = null;
    if (table_number) {
      const [tables] = await pool.query(
        'SELECT id, table_number, label FROM tables_restaurant WHERE table_number = ? AND is_active = 1',
        [table_number]
      );
      tableInfo = tables[0] || null;
    }

    const token = jwt.sign(
      { id: userId, role: userRole, first_name, last_name },
      SECRET,
      { expiresIn: EXPIRES }
    );

    return res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: { id: userId, first_name, last_name, email, phone, role: userRole, table: tableInfo },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
const login = async (req, res) => {
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

    // Récupérer allergies depuis la table de jointure
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

    // Mettre à jour last_login_at
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name },
      SECRET,
      { expiresIn: EXPIRES }
    );

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id, first_name: user.first_name, last_name: user.last_name,
        email: user.email, phone: user.phone, role: user.role, allergies,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/auth/me  (route protégée — nécessite verifyToken) ──
const getMe = async (req, res) => {
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

    return res.status(200).json({ ...rows[0], allergies });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe };