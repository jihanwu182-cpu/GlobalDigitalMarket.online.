const express = require('express');

const router = express.Router();

// ============================================================
// ADMIN CONTROLLER
// ============================================================

const {
  adminLogin,
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

// ============================================================
// ADMIN MIDDLEWARE
// ============================================================

const {
  adminMiddleware,
} = require('../middleware/auth');

// ============================================================
// ADMIN LOGIN
// ============================================================
//
// IMPORTANT:
// Login MUST come before adminMiddleware.
// Otherwise a person cannot log in because they
// don't have an admin token yet.
//

router.post(
  '/login',
  adminLogin
);

// ============================================================
// PROTECT ALL ADMIN ROUTES
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
// UPDATE TRANSACTION STATUS
// ============================================================

router.patch(
  '/transactions/:id/status',
  updateTransactionStatus
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
