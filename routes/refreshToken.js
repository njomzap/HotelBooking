const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController');

router.post('/', refreshTokenController.refreshToken);
router.post('/logout', refreshTokenController.logout);
router.post('/logout-all', refreshTokenController.logoutAll);

module.exports = router;
