const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const marketController = require('../controllers/marketController');

const router = express.Router();

router.use(optionalAuth);

// Get stock quote
router.get('/quotes/:symbol', marketController.getQuote);

// Get price chart
router.get('/chart/:symbol', marketController.getChart);

// Search securities
router.get('/search', marketController.searchSecurities);

module.exports = router;
