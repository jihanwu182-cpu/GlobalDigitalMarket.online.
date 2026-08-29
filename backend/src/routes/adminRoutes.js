const express = require('express');

const router = express.Router();

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

const {
  adminMiddleware,
} = require('../middleware/auth');

// ADMIN LOGIN
router.post(
  '/login',
  adminLogin
);

// PROTECT ADMIN ROUTES
router.use(adminMiddleware);

// DASHBOARD
router.get(
  '/dashboard',
  getDashboard
);

// USERS
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

// TRANSACTIONS
router.get(
  '/transactions',
  getTransactions
);

// DEPOSITS
router.get(
  '/deposits',
  getDeposits
);

// WITHDRAWALS
router.get(
  '/withdrawals',
  getWithdrawals
);

// KYC
router.get(
  '/kyc',
  getKycRequests
);

// TRANSACTION STATUS
router.patch(
  '/transactions/:id/status',
  updateTransactionStatus
);

module.exports = router;
