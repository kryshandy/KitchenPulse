const express = require('express');
const router = express.Router();
const {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} = require('../controllers/dishController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole = require('../middleware/verifyRole');

// ─── Routes publiques (lecture) ─────────────────────────────────────────────
router.get('/', getAllDishes);
router.get('/:id', getDishById);

// ─── Routes protégées (cuisinier + admin) ───────────────────────────────────
router.post('/',
  verifyToken,
  verifyRole('cuisinier', 'admin'),
  createDish
);

router.patch('/:id',
  verifyToken,
  verifyRole('cuisinier', 'admin'),
  updateDish
);

router.delete('/:id',
  verifyToken,
  verifyRole('admin'),
  deleteDish
);

module.exports = router;