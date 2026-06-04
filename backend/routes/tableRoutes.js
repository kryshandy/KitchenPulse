const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// Route pour lister toutes les tables (accessible par les SERVEURS et les ADMINS)
router.get('/', verifyToken, tableController.getAllTables);

// Route pour modifier le statut d'une table (réservé aux SERVEURS pour la gestion de la salle)
router.patch('/:id/status', verifyToken, verifyRole('SERVEUR'), tableController.updateTableStatus);

module.exports = router;