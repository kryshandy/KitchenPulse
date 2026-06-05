const router = require('express').Router();
const ctrl   = require('../controllers/dishController');

router.get('/categories', ctrl.getCategories);
router.get('/',           ctrl.getAll);
router.get('/:id',        ctrl.getOne);

module.exports = router;