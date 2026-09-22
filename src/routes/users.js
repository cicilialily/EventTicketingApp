const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getUserPurchaseHistory } = require('../controllers/userController');

router.get('/:id/orders', requireAuth, getUserPurchaseHistory);

module.exports = router;
