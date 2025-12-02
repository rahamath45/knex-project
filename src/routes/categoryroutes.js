const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const auth = require('../middlewares/authmiddlewares');
const role = require('../middlewares/rolemiddlewares');

// Public
router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);

// Admin only
router.post('/', auth, role('admin'), ctrl.createCategory);
router.put('/:id', auth, role('admin'), ctrl.updateCategory);
router.delete('/:id', auth, role('admin'), ctrl.deleteCategory);

module.exports = router;
