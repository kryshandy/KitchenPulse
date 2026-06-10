const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/verifyToken');
const role    = require('../middleware/verifyRole');
const {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  toggleUserActive,
} = require('../controllers/userConntrollers');

// GET  /api/users          — liste tous les utilisateurs (admin)
router.get('/',                  auth, role('admin'), getAllUsers);

// GET  /api/users/pending  — comptes en attente de validation (admin)
router.get('/pending',           auth, role('admin'), getPendingUsers);

// PATCH /api/users/:id/approve — valider un compte serveur/cuisinier (admin)
router.patch('/:id/approve',     auth, role('admin'), approveUser);

// PATCH /api/users/:id/reject  — refuser un compte serveur/cuisinier (admin)
router.patch('/:id/reject',      auth, role('admin'), rejectUser);

// PATCH /api/users/:id/toggle  — activer/désactiver un compte (admin)
router.patch('/:id/toggle',      auth, role('admin'), toggleUserActive);

// PUT  /api/users/:id      — modifier le rôle d'un utilisateur (admin)
router.put('/:id',               auth, role('admin'), updateUserRole);

module.exports = router;