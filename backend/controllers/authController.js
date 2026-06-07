/**
 * authController.js — KitchenPulse
 * CORRECTION PRINCIPALE : le rôle ENUM en BD est en minuscules
 * ('client','serveur','cuisinier','admin') → on insère en minuscules.
 * C'était la cause du insertId = 0 et de tous les bugs en cascade.
 */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

const SECRET  = process.env.JWT_SECRET || 'kitchenpulse_secret';
const EXPIRES = '7d';

// ── POST /api/auth/register ────────────────────────────────────
const register = async (req, res) => {
  const {
    first_name, last_name, email, phone, password, role,
    allergies, severity,
    nutrition,
    table_number,
    delivery_mode,
  } = req.body;

  if (!first_name || !last_name || !password) {
    return res.status(400).json({ message: 'Prénom, nom et mot de passe requis' });
  }
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email ou téléphone requis' });
  }

  // ⚠️ ENUM en BD = minuscules : 'client','serveur','cuisinier','admin'
  const allowedRoles = ['client', 'serveur', 'cuisinier'];
  const rawRole = (role || 'client').toLowerCase();
  const userRole = allowedRoles.includes(rawRole) ? rawRole : 'client';

  try {
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
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email || null, phone || null, password_hash, userRole]
    );
    const userId = result.insertId;

    // Garde-fou : si l'INSERT a échoué silencieusement
    if (!userId) {
      console.error('register: insertId invalide', result);
      return res.status(500).json({ message: 'Erreur lors de la création du compte (id invalide)' });
    }

    // ── Profil nutritionnel + allergies (CLIENT uniquement) ──
    if (userRole === 'client') {
      try {
        const np = nutrition || {};

        const [profileResult] = await pool.query(
          `INSERT INTO nutrition_profiles
            (user_id, diet, goal, activity_level, sport_type,
             calories_target, proteins_target, lipids_target, glucids_target,
             diabetes_type, hypertension, kidney_failure, pregnancy, pregnancy_weeks, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            np.diet           || 'omnivore',
            np.goal           || 'maintien',
            np.activity_level || 'sedentaire',
            np.sport_type     || null,
            np.calories_target ? Number(np.calories_target) : null,
            np.proteins_target ? Number(np.proteins_target) : null,
            np.lipids_target   ? Number(np.lipids_target)   : null,
            np.glucids_target  ? Number(np.glucids_target)  : null,
            np.diabetes_type   || 'aucun',
            np.hypertension    ? 1 : 0,
            np.kidney_failure  ? 1 : 0,
            np.pregnancy       ? 1 : 0,
            (np.pregnancy && np.pregnancy_weeks) ? Number(np.pregnancy_weeks) : null,
            np.notes           || null,
          ]
        );
        const profileId = profileResult.insertId;

        if (profileId && Array.isArray(allergies) && allergies.length > 0) {
          const allergenySeverity = severity || 'allergie';
          for (const allergyId of allergies) {
            await pool.query(
              'INSERT IGNORE INTO profile_allergies (profile_id, allergy_id, severity) VALUES (?, ?, ?)',
              [profileId, allergyId, allergenySeverity]
            );
          }
        }
      } catch (profileErr) {
        console.warn('Erreur profil nutritionnel (non bloquant):', profileErr.message);
      }

      // ── Assignation de table ──
      try {
        let targetTableNumber = null;
        if (delivery_mode === 'livraison') {
          targetTableNumber = 0; // table spéciale livraison
        } else if (delivery_mode === 'table' && table_number) {
          targetTableNumber = Number(table_number);
        }

        if (targetTableNumber !== null) {
          const [tableRows] = await pool.query(
            'SELECT id FROM tables_restaurant WHERE table_number = ? AND is_active = 1 LIMIT 1',
            [targetTableNumber]
          );
          if (tableRows.length) {
            await pool.query(
              'INSERT INTO table_assignments (table_id, user_id, started_at) VALUES (?, ?, NOW())',
              [tableRows[0].id, userId]
            );
          }
        }
      } catch (tableErr) {
        console.warn('Assignation table (non bloquant):', tableErr.message);
      }
    }

    const token = jwt.sign(
      { id: userId, role: userRole, first_name, last_name },
      SECRET,
      { expiresIn: EXPIRES }
    );

    return res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: { id: userId, first_name, last_name, email, phone, role: userRole },
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

    // Allergies — filtré par user_id pour isoler chaque client
    let allergies = [];
    try {
      const [a] = await pool.query(
        `SELECT al.id, al.code, al.label, al.icon, pa.severity
         FROM nutrition_profiles np
         JOIN profile_allergies pa ON pa.profile_id = np.id
         JOIN allergies al ON pa.allergy_id = al.id
         WHERE np.user_id = ?`,
        [user.id]
      );
      allergies = a;
    } catch {}

    // Profil nutritionnel
    let nutritionProfile = null;
    try {
      const [np] = await pool.query(
        `SELECT diet, goal, activity_level, sport_type, calories_target,
                proteins_target, lipids_target, glucids_target,
                diabetes_type, hypertension, kidney_failure, pregnancy, pregnancy_weeks, notes
         FROM nutrition_profiles WHERE user_id = ? LIMIT 1`,
        [user.id]
      );
      if (np.length) nutritionProfile = np[0];
    } catch {}

    // Table assignée (pour le Panier)
    let tableAssigned = null;
    try {
      const [ta] = await pool.query(
        `SELECT t.id AS table_id, t.table_number, t.label
         FROM table_assignments ta
         JOIN tables_restaurant t ON ta.table_id = t.id
         WHERE ta.user_id = ? AND ta.ended_at IS NULL AND t.is_active = 1
         ORDER BY ta.started_at DESC LIMIT 1`,
        [user.id]
      );
      if (ta.length) tableAssigned = ta[0];
    } catch {}

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
        email: user.email, phone: user.phone, role: user.role,
        allergies,
        nutrition: nutritionProfile,
        table: tableAssigned, // ← dispo dans le Panier via useAuth()
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
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
        `SELECT al.id, al.code, al.label, al.icon, pa.severity
         FROM nutrition_profiles np
         JOIN profile_allergies pa ON pa.profile_id = np.id
         JOIN allergies al ON pa.allergy_id = al.id
         WHERE np.user_id = ?`,
        [req.user.id]
      );
      allergies = a;
    } catch {}

    let nutritionProfile = null;
    try {
      const [np] = await pool.query(
        `SELECT diet, goal, activity_level, sport_type, calories_target,
                proteins_target, lipids_target, glucids_target,
                diabetes_type, hypertension, kidney_failure, pregnancy, pregnancy_weeks, notes
         FROM nutrition_profiles WHERE user_id = ? LIMIT 1`,
        [req.user.id]
      );
      if (np.length) nutritionProfile = np[0];
    } catch {}

    let tableAssigned = null;
    try {
      const [ta] = await pool.query(
        `SELECT t.id AS table_id, t.table_number, t.label
         FROM table_assignments ta
         JOIN tables_restaurant t ON ta.table_id = t.id
         WHERE ta.user_id = ? AND ta.ended_at IS NULL AND t.is_active = 1
         ORDER BY ta.started_at DESC LIMIT 1`,
        [req.user.id]
      );
      if (ta.length) tableAssigned = ta[0];
    } catch {}

    return res.status(200).json({ ...rows[0], allergies, nutrition: nutritionProfile, table: tableAssigned });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe };