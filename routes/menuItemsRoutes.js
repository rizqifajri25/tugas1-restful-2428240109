const express = require('express');
const menuItemsController = require('../controllers/menuItemsController');
const cekApiKey = require('../middlewares/cekApiKey');

const router = express.Router();
const parseJson = express.json();

router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getById);
router.post('/', cekApiKey, parseJson, menuItemsController.create);
router.put('/:id', cekApiKey, parseJson, menuItemsController.update);
router.delete('/:id', cekApiKey, menuItemsController.remove);

module.exports = router;
