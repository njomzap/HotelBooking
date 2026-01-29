const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const { authMiddleware } = require('../middlewares/auth');

// Apply auth middleware only to protected routes
router.post('/', authMiddleware, lostFoundController.createItem);
router.put('/:id', authMiddleware, lostFoundController.updateItem);
router.delete('/:id', authMiddleware, lostFoundController.deleteItem);

// Public routes (no auth required)
router.get('/', lostFoundController.getLostAndFound);
router.get('/:id', lostFoundController.getItemById);

module.exports = router;
