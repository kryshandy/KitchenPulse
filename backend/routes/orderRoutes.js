const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');

// ── Toutes les routes orders nécessitent un token ──────────────
router.use(verifyToken);

// ── Création de commande (client) ─────────────────────────────
router.post('/',
  verifyRole('client'),
  ctrl.create
);

// ⚠️ IMPORTANT : /mine et /cuisine AVANT /:id
// Sans ça, Express interprète "mine" comme un id et appelle getOne
router.get('/mine',
  ctrl.getMine
);

router.get('/cuisine',
  verifyRole('cuisinier', 'admin'),
  ctrl.getOrdersForCuisinier
);

// ── Vue générale (admin / serveur) ────────────────────────────
router.get('/',
  verifyRole('serveur', 'admin'),
  ctrl.getAllOrders
);

// ── Détail d'une commande (tous rôles authentifiés) ───────────
router.get('/:id',
  ctrl.getOne
);

// ── Actions cuisinier ─────────────────────────────────────────
router.patch('/:id/take',
  verifyRole('cuisinier', 'admin'),
  ctrl.takeOrder
);

router.patch('/:id/ready',
  verifyRole('cuisinier', 'admin'),
  ctrl.markOrderReady
);

// ── Actions serveur ───────────────────────────────────────────
router.patch('/:id/assign',
  verifyRole('serveur', 'admin'),
  ctrl.assignOrder                               // stub 501 dans orderController
);

router.patch('/:id/deliver',
  verifyRole('serveur', 'admin'),
  ctrl.deliverOrder                              // stub 501 dans orderController
);

// ── Annulation (client + serveur + admin) ─────────────────────
router.patch('/:id/cancel',
  verifyRole('client', 'serveur', 'admin'),
  ctrl.cancelOrder
);

// ── Suppression (admin) ───────────────────────────────────────
// ✅ deleteOrder n'est pas exporté par orderController
//    → stub inline pour éviter le crash "handler must be a function"
router.delete('/:id',
  verifyRole('admin'),
  (_req, res) => res.status(501).json({ message: 'deleteOrder — à implémenter (feat/serveur-admin)' })
);

module.exports = router;