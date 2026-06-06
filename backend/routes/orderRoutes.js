// backend/routes/orderRoutes.js — VERSION COMPLÈTE
// Vérifie que ces routes existent bien dans ton fichier actuel
// Sinon remplace ton orderRoutes.js par celui-ci

const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');

// ── CLIENT ──────────────────────────────────────────────────────
router.post('/',      verifyToken, ctrl.createOrder);
router.get('/:id',   verifyToken, ctrl.getOrderById);
router.get('/',      verifyToken, ctrl.getOrders);   // ← ?status=RECUE,EN_PREPARATION

// ── CUISINIER / SERVEUR ─────────────────────────────────────────
// PATCH /api/orders/:id/status  { status: 'EN_PREPARATION' | 'PRETE' | ... }
router.patch('/:id/status',
  verifyToken,
  verifyRole('cuisinier', 'serveur', 'admin'),
  ctrl.updateOrderStatus
);

// ── ADMIN ───────────────────────────────────────────────────────
router.delete('/:id',
  verifyToken,
  verifyRole('admin'),
  ctrl.deleteOrder
);

module.exports = router;