const express = require('express');
const router = express.Router();
const {
  getOrdersForCuisinier,
  takeOrder,
  markOrderReady,
  deleteOrder,
  getAllOrders,
  createOrder,
  assignOrder,
  deliverOrder,
  cancelOrder,
} = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// ─── Toutes les routes nécessitent un token ─────────────────────────────────
router.use(verifyToken);

// ─── Vue cuisinier ──────────────────────────────────────────────────────────
router.get('/cuisinier',
  verifyRole('cuisinier', 'admin'),
  getOrdersForCuisinier
);

// ─── Liste générale ─────────────────────────────────────────────────────────
router.get('/', getAllOrders);

// ─── Création (client) ──────────────────────────────────────────────────────
router.post('/',
  verifyRole('client'),
  createOrder
);

// ─── Actions cuisinier ──────────────────────────────────────────────────────
router.patch('/:id/take',
  verifyRole('cuisinier', 'admin'),
  takeOrder
);

router.patch('/:id/ready',
  verifyRole('cuisinier', 'admin'),
  markOrderReady
);

router.delete('/:id',
  verifyRole('cuisinier', 'admin'),
  deleteOrder
);

// ─── Actions serveur (feat/serveur-admin les complétera) ────────────────────
router.patch('/:id/assign',
  verifyRole('serveur', 'admin'),
  assignOrder
);

router.patch('/:id/deliver',
  verifyRole('serveur', 'admin'),
  deliverOrder
);

router.patch('/:id/cancel', cancelOrder);

module.exports = router;