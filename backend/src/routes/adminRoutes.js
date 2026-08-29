const express = require('express');

const router = express.Router();

const {
  getDashboard,
  getUsers,
  getUser,
  getTransactions,
  getDeposits,
  getWithdrawals,
  getKycRequests,
  updateUserStatus,
  updateTransactionStatus,
} = require('../controllers/adminController');

const {
  adminMiddleware,
} = require('../middleware/authMiddleware');

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

router.use(adminMiddleware);

// ============================================================
// ADMIN DASHBOARD
// ============================================================

router.get(
  '/dashboard',
  getDashboard
);

// ============================================================
// USERS
// ============================================================

router.get(
  '/users',
  getUsers
);

router.get(
  '/users/:id',
  getUser
);

router.patch(
  '/users/:id/status',
  updateUserStatus
);

// ============================================================
// TRANSACTIONS
// ============================================================

router.get(
  '/transactions',
  getTransactions
);

// ============================================================
// DEPOSITS
// ============================================================

router.get(
  '/deposits',
  getDeposits
);

// ============================================================
// WITHDRAWALS
// ============================================================

router.get(
  '/withdrawals',
  getWithdrawals
);

// ============================================================
// KYC
// ============================================================

router.get(
  '/kyc',
  getKycRequests
);

// ============================================================
// UPDATE TRANSACTION
// ============================================================

router.patch(
  '/transactions/:id/status',
  updateTransactionStatus
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
