const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const tradeController = require('../controllers/tradeController');

const router = express.Router();

router.use(authMiddleware);

// Create order
router.post('/order', tradeController.createOrder);

// Get orders
router.get('/orders', tradeController.getOrders);

// Cancel order
router.put('/orders/:id/cancel', tradeController.cancelOrder);

// Get trade history
router.get('/history', tradeController.getTradeHistory);

module.exports = router;
