const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createOrder, payOrder } = require('../controllers/orderController');

router.post('/', requireAuth, createOrder);
router.post('/:id/pay', requireAuth, payOrder);

module.exports = router;
