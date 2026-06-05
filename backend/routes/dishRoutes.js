const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/dishController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');

// ── Lecture publique ───────────────────────────────────────────
// ⚠️ /categories DOIT être avant /:id pour ne pas être capturé comme un id
router.get('/categories', ctrl.getCategories);   // ✅ exporté dans dishController
router.get('/',           ctrl.getAllDishes);     // ✅ était ctrl.getAll    → CORRIGÉ
router.get('/:id',        ctrl.getDishById);     // ✅ était ctrl.getOne    → CORRIGÉ

// ── Écriture protégée ──────────────────────────────────────────
router.post('/',
  verifyToken,
  verifyRole('cuisinier', 'admin'),
  ctrl.createDish                                // ✅ était ctrl.create   → CORRIGÉ
);

router.patch('/:id',
  verifyToken,
  verifyRole('cuisinier', 'admin'),
  ctrl.updateDish                                // ✅ était ctrl.update   → CORRIGÉ
);

router.delete('/:id',
  verifyToken,
  verifyRole('admin'),
  ctrl.deleteDish                                // ✅ était ctrl.remove   → CORRIGÉ
);

module.exports = router;