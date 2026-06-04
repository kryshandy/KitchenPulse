const db = require('../config/db');

/**
 * 👑 ADMIN : Récupérer la liste de tous les utilisateurs
 * Utilisé pour alimenter la page GestionUsers.jsx
 */
const getAllUsers = async (req, res) => {
  try {
    // On sélectionne les infos importantes sans renvoyer le password_hash par sécurité !
    const [users] = await db.query(
      'SELECT id, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Erreur dans getAllUsers :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs.'
    });
  }
};

/**
 * 👑 ADMIN : Modifier le rôle d'un utilisateur
 * Permet de passer un client au rôle de SERVEUR, CUISINIER ou ADMIN
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validation des rôles autorisés dans votre base de données
  const rolesAutorises = ['CLIENT', 'SERVEUR', 'CUISINIER', 'ADMIN'];
  
  if (!role || !rolesAutorises.includes(role.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Rôle invalide. Les rôles autorisés sont : ${rolesAutorises.join(', ')}`
    });
  }

  try {
    // On vérifie d'abord si l'utilisateur existe
    const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "L'utilisateur spécifié n'existe pas."
      });
    }

    // Mise à jour du rôle dans la table users
    await db.query(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role.toUpperCase(), id]
    );

    return res.status(200).json({
      success: true,
      message: `Le rôle de l'utilisateur a bien été mis à jour en ${role.toUpperCase()}.`
    });
  } catch (error) {
    console.error('❌ Erreur dans updateUserRole :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle.'
    });
  }
};

// Export des fonctions du contrôleur
module.exports = {
  getAllUsers,
  updateUserRole
};