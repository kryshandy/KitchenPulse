const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
  const { nom, email, mot_de_passe, role, allergenes, kcal_max } = req.body;

  if (!nom || !email || !mot_de_passe) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' });
  }

  try {
    // Vérifier si l'email existe déjà
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    // Hacher le mot de passe
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // Rôle par défaut : client
    const userRole = role || 'client';

    const [result] = await db.execute(
      'INSERT INTO users (nom, email, mot_de_passe, role, allergenes, kcal_max) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email, hash, userRole, allergenes || null, kcal_max || null]
    );

    return res.status(201).json({
      message: 'Compte créé avec succès.',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Erreur register:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!validPassword) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/me  (route protégée — nécessite verifyToken)
const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nom, email, role, allergenes, kcal_max FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Erreur getMe:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { register, login, getMe };