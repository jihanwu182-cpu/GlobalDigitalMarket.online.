const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);

// Get user profile
router.get('/:id', userController.getUserProfile);

// Update user profile
router.put('/:id', userController.updateUserProfile);

// Get user accounts
router.get('/:id/accounts', userController.getUserAccounts);

// Create trading account
router.post('/:id/accounts', userController.createTradingAccount);

module.exports = router;
