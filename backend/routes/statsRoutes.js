const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// Route sécurisée pour le Dashboard Admin
router.get('/dashboard', verifyToken, verifyRole('ADMIN'), statsController.getDashboardStats);

module.exports = router;