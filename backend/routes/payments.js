const router = require('express').Router();
const ctrl = require('../controllers/paymentController');

router.get('/',          ctrl.getAll);
router.get('/:id',       ctrl.getById);
router.post('/',         ctrl.create);
router.put('/:id',       ctrl.update);

module.exports = router;
