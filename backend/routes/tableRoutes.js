const router = require('express').Router();
const ctrl   = require('../controllers/tableController');
const auth   = require('../middleware/verifyToken');

// Toutes les routes nécessitent un token
router.get('/',           auth, ctrl.getAllTables);
router.get('/:id',        auth, ctrl.getTableById);
router.patch('/:id/status', auth, ctrl.updateTableStatus);

module.exports = router;