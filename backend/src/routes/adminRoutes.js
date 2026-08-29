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

  // SIGNAL MANAGEMENT
  getSignalPlans,
  createSignalPlan,
  updateSignalPlan,
  deleteSignalPlan,
  getUserSignal,
  updateUserSignal,
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
// Login must remain PUBLIC.
// Do not put adminMiddleware before this route.

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
// TRANSACTION STATUS
// ============================================================

router.patch(
  '/transactions/:id/status',
  updateTransactionStatus
);

// ============================================================
// SIGNAL PLANS
// ============================================================
//
// Admin creates and manages the available signal plans.
//
// GET    /api/admin/signal-plans
// POST   /api/admin/signal-plans
// PATCH  /api/admin/signal-plans/:id
// DELETE /api/admin/signal-plans/:id
//

router.get(
  '/signal-plans',
  getSignalPlans
);

router.post(
  '/signal-plans',
  createSignalPlan
);

router.patch(
  '/signal-plans/:id',
  updateSignalPlan
);

router.delete(
  '/signal-plans/:id',
  deleteSignalPlan
);

// ============================================================
// USER SIGNAL MANAGEMENT
// ============================================================
//
// Admin can view and update the signal settings assigned
// to a particular user.
//
// GET   /api/admin/users/:id/signal
// PATCH /api/admin/users/:id/signal
//

router.get(
  '/users/:id/signal',
  getUserSignal
);

router.patch(
  '/users/:id/signal',
  updateUserSignal
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
