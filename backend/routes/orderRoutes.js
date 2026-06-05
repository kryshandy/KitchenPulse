const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const auth   = require('../middleware/verifyToken');

router.post('/',    auth, ctrl.create);
router.get('/',     auth, ctrl.getMine);
router.get('/:id',  auth, ctrl.getOne);

module.exports = router;