// backend/routes/dishRoutes.js
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/dishController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');
const upload      = require('../middleware/upload');

// ── Routes publiques (ordre important : routes spécifiques AVANT /:id) ──────
router.get('/categories',  ctrl.getCategories);   // GET /api/dishes/categories
router.get('/my-reviews',  verifyToken, ctrl.getMyReviews);  // GET /api/dishes/my-reviews
router.get('/stats',       verifyToken, ctrl.getStats);       // GET /api/dishes/stats?period=today|week|month
router.get('/',            ctrl.getAllDishes);     // GET /api/dishes?disponible=all|true|false

// ── Routes par ID ─────────────────────────────────────────────────────────
router.get('/:id',         ctrl.getDishById);     // GET /api/dishes/:id

// POST /api/dishes/:id/ingredients — séparé du PATCH plat principal
router.post('/:id/ingredients',
  verifyToken, verifyRole('cuisinier', 'admin'),
  ctrl.saveIngredients
);

// ── Écriture protégée ─────────────────────────────────────────────────────
router.post('/',
  verifyToken, verifyRole('cuisinier', 'admin'),
  upload.single('image'),
  ctrl.createDish
);

router.patch('/:id',
  verifyToken, verifyRole('cuisinier', 'admin'),
  upload.single('image'),
  ctrl.updateDish
);

router.delete('/:id',
  verifyToken, verifyRole('admin'),
  ctrl.deleteDish
);

module.exports = router;