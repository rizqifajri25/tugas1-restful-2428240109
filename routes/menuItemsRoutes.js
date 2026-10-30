const express = require('express');
const menuItemsController = require('../controllers/menuItemsController');
const cekApiKey = require('../middlewares/cekApiKey');

const router = express.Router();

router.get('/categories', menuItemsController.getCategories);
router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getById);
router.post('/', cekApiKey, menuItemsController.create);
router.put('/:id', cekApiKey, menuItemsController.update);
router.delete('/:id', cekApiKey, menuItemsController.remove);

module.exports = router;
