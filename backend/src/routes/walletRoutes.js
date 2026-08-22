const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.use(authMiddleware);

// Get wallet balance
router.get('/balance', walletController.getBalance);

// Deposit funds
router.post('/deposit', walletController.depositFunds);

// Withdraw funds
router.post('/withdraw', walletController.withdrawFunds);

// Get transaction history
router.get('/transactions', walletController.getTransactions);

module.exports = router;
