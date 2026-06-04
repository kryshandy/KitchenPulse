const express = require('express');
const router = express.Router();
const platController = require('../controllers/platController');

// Définition des endpoints pour le frontend
router.get('/', platController.getAllPlats);  // GET http://localhost:3001/api/plats
router.post('/', platController.createPlat); // POST http://localhost:3001/api/plats

module.exports = router;