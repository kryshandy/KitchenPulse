const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// Route sécurisée pour le Dashboard Admin
router.get('/dashboard', verifyToken, verifyRole('ADMIN'), statsController.getDashboardStats);
// Permet aux serveurs de voir les commandes actives à livrer
router.get('/active-orders', verifyToken, statsController.getActiveOrders);

module.exports = router;