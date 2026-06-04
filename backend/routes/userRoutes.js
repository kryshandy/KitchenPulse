const express = require('express');
const router = express.Router();
const userController = require('../controllers/userConntrollers'); // Attention au double "n" de ton équipe !

// Import des middlewares de sécurité (gérés par le Membre 1 de ton équipe)
// Si ton équipe ne les a pas encore codés ou nommés ainsi, tu peux commenter ces lignes temporairement
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

/**
 * 🔒 TOUTES les routes ici nécessitent d'être connecté (verifyToken)
 * et d'avoir le rôle d'ADMINISTRATEUR (verifyRole('ADMIN'))
 */
router.get('/', verifyToken, verifyRole('ADMIN'), userController.getAllUsers);
router.put('/:id', verifyToken, verifyRole('ADMIN'), userController.updateUserRole);

module.exports = router;