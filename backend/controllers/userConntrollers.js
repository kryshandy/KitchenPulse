const db = require('../config/db');

// -- GET /api/users — liste complète (admin) -------------------
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, first_name, last_name, email, phone, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('getAllUsers:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur lors de la recuperation des utilisateurs.' });
  }
};

// -- GET /api/users/pending — comptes en attente (admin) -------
const getPendingUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, first_name, last_name, email, phone, role, created_at
       FROM users
       WHERE is_active = 0 AND role IN ('serveur', 'cuisinier')
       ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('getPendingUsers:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// -- PATCH /api/users/:id/approve — valider un compte (admin) --
const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ? AND is_active = 0 AND role IN ('serveur','cuisinier')",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable ou deja actif.' });
    }

    const user = rows[0];
    await db.query('UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?', [id]);

    // Marquer les notifications liées comme lues
    await db.query(
      "UPDATE notifications SET is_read = 1, updated_at = NOW() WHERE type = 'staff_approval_pending' AND JSON_EXTRACT(payload, '$.user_id') = ?",
      [id]
    );

    // Notifier l'utilisateur approuvé en temps réel
    if (req.io) {
      req.io.emit('account_approved', {
        user_id: user.id,
        message: 'Votre compte a ete valide. Vous pouvez maintenant vous connecter.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Compte de ${user.first_name} ${user.last_name} valide avec succes.`,
    });
  } catch (error) {
    console.error('approveUser:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// -- PATCH /api/users/:id/reject — refuser un compte (admin) ---
const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { motif } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ? AND is_active = 0 AND role IN ('serveur','cuisinier')",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable ou deja traite.' });
    }

    const user = rows[0];

    // Supprimer le compte refusé
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    // Marquer les notifications liées comme lues
    await db.query(
      "UPDATE notifications SET is_read = 1, updated_at = NOW() WHERE type = 'staff_approval_pending' AND JSON_EXTRACT(payload, '$.user_id') = ?",
      [id]
    );

    // Notifier en temps réel si la personne est encore connectée
    if (req.io) {
      req.io.emit('account_rejected', {
        user_id: user.id,
        message: motif || 'Votre demande a ete refusee par un administrateur.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Demande de ${user.first_name} ${user.last_name} refusee.`,
    });
  } catch (error) {
    console.error('rejectUser:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// -- PUT /api/users/:id — modifier rôle / statut (admin) -------
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const rolesAutorises = ['client', 'serveur', 'cuisinier', 'admin'];
  if (!role || !rolesAutorises.includes(role.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Role invalide. Roles autorises : ${rolesAutorises.join(', ')}`,
    });
  }

  try {
    const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!userExists.length) {
      return res.status(404).json({ success: false, message: "L'utilisateur n'existe pas." });
    }

    await db.query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role.toLowerCase(), id]);

    return res.status(200).json({
      success: true,
      message: `Role mis a jour : ${role.toLowerCase()}`,
    });
  } catch (error) {
    console.error('updateUserRole:', error.message);
    return res.status(500).json({ success: false, message: 'Erreur lors de la mise a jour du role.' });
  }
};

module.exports = { getAllUsers, getPendingUsers, approveUser, rejectUser, updateUserRole };