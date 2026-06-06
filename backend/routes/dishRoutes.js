const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/dishController');
const verifyToken = require('../middleware/verifyToken');
const verifyRole  = require('../middleware/verifyRole');
const upload      = require('../middleware/upload');

// Lecture publique — /categories AVANT /:id
router.get('/categories', ctrl.getCategories);
router.get('/',           ctrl.getAllDishes);
router.get('/:id',        ctrl.getDishById);

// Écriture protégée avec upload image optionnel
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
