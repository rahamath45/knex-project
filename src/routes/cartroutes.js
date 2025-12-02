const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const auth = require('../middlewares/authmiddlewares');

router.use(auth); 
router.get('/', ctrl.getCart);
router.post('/items', ctrl.addItem); 
router.put('/items/:id', ctrl.updateItem);
router.delete('/items/:id', ctrl.removeItem);

module.exports = router;
