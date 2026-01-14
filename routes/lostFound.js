const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');

router.get('/', lostFoundController.getLostAndFound);
router.get('/:id', lostFoundController.getItemById);
router.post('/', lostFoundController.createItem);
router.put('/:id', lostFoundController.updateItem);
router.delete('/:id', lostFoundController.deleteItem);

module.exports = router;
