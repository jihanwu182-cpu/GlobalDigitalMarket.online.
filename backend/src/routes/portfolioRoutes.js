const express = require('express');

const {
  authMiddleware,
} = require('../middleware/auth');

const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authMiddleware);

// ============================================================
// PORTFOLIO HOLDINGS
// ============================================================

router.get(
  '/holdings',
  portfolioController.getHoldings
);

// ============================================================
// PORTFOLIO PERFORMANCE
// ============================================================

router.get(
  '/performance',
  portfolioController.getPerformance
);

// ============================================================
// ACCOUNT SUMMARY
// ============================================================

router.get(
  '/account',
  portfolioController.getAccountSummary
);

// ============================================================
// ASSET ALLOCATION
// ============================================================

router.get(
  '/allocation',
  portfolioController.getAllocation
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
