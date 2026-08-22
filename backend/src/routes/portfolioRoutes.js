const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

router.use(authMiddleware);

// Get portfolio holdings
router.get('/holdings', portfolioController.getHoldings);

// Get portfolio performance
router.get('/performance', portfolioController.getPerformance);

// Get asset allocation
router.get('/allocation', portfolioController.getAllocation);

module.exports = router;
