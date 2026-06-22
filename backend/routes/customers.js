const router = require('express').Router();
const ctrl = require('../controllers/customerController');

router.get('/',          ctrl.getAll);
router.get('/:id',       ctrl.getById);
router.post('/',         ctrl.create);
router.put('/:id',       ctrl.update);
router.delete('/:id',    ctrl.remove);
router.get('/:id/orders', ctrl.getOrders);

module.exports = router;
