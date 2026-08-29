const express = require('express');

const router = express.Router();

// ============================================================
// ADMIN CONTROLLER
// ============================================================

const {
  // Authentication
  adminLogin,

  // Dashboard
  getDashboard,

  // Users
  getUsers,
  getUser,
  updateUserStatus,

  // Account Funding
  fundUserAccount,

  // Transactions
  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  // KYC
  getKycRequests,

  // Investment Plans
  getInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,

  // Signal Plans
  getSignalPlans,
  createSignalPlan,
  updateSignalPlan,
  deleteSignalPlan,

  // User Signal
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
// SAFETY CHECK
// ============================================================

const requiredHandlers = {
  adminLogin,
  adminMiddleware,
  getDashboard,

  getUsers,
  getUser,
  updateUserStatus,

  fundUserAccount,

  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  getKycRequests,

  getInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,

  getSignalPlans,
  createSignalPlan,
  updateSignalPlan,
  deleteSignalPlan,

  getUserSignal,
  updateUserSignal,
};

for (const [name, handler] of Object.entries(
  requiredHandlers
)) {
  if (typeof handler !== 'function') {
    throw new Error(
      `Admin route configuration error: "${name}" is not exported as a function.`
    );
  }
}

// ============================================================
// ADMIN LOGIN
// ============================================================
//
// POST /api/admin/login
//
// PUBLIC ROUTE
//

router.post(
  '/login',
  adminLogin
);

// ============================================================
// PROTECT ALL OTHER ADMIN ROUTES
// ============================================================

router.use(adminMiddleware);

// ============================================================
// DASHBOARD
// ============================================================
//
// GET /api/admin/dashboard
//

router.get(
  '/dashboard',
  getDashboard
);

// ============================================================
// USERS
// ============================================================
//
// GET   /api/admin/users
// GET   /api/admin/users/:id
// PATCH /api/admin/users/:id/status
//

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
// USER ACCOUNT FUNDING
// ============================================================
//
// POST /api/admin/users/:id/fund
//
// Example:
//
// POST /api/admin/users/25/fund
//
// Body:
//
// {
//   "amount": 500,
//   "currency": "USD",
//   "description": "Admin account funding"
// }
//

router.post(
  '/users/:id/fund',
  fundUserAccount
);

// ============================================================
// USER SIGNAL
// ============================================================
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
// TRANSACTIONS
// ============================================================
//
// GET   /api/admin/transactions
// PATCH /api/admin/transactions/:id/status
//

router.get(
  '/transactions',
  getTransactions
);

router.patch(
  '/transactions/:id/status',
  updateTransactionStatus
);

// ============================================================
// DEPOSITS
// ============================================================
//
// GET /api/admin/deposits
//

router.get(
  '/deposits',
  getDeposits
);

// ============================================================
// WITHDRAWALS
// ============================================================
//
// GET /api/admin/withdrawals
//

router.get(
  '/withdrawals',
  getWithdrawals
);

// ============================================================
// KYC
// ============================================================
//
// GET /api/admin/kyc
//

router.get(
  '/kyc',
  getKycRequests
);

// ============================================================
// INVESTMENT PLANS
// ============================================================
//
// GET    /api/admin/investment-plans
// POST   /api/admin/investment-plans
// PATCH  /api/admin/investment-plans/:id
// DELETE /api/admin/investment-plans/:id
//

router.get(
  '/investment-plans',
  getInvestmentPlans
);

router.post(
  '/investment-plans',
  createInvestmentPlan
);

router.patch(
  '/investment-plans/:id',
  updateInvestmentPlan
);

router.delete(
  '/investment-plans/:id',
  deleteInvestmentPlan
);

// ============================================================
// SIGNAL PLANS
// ============================================================
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
// EXPORT
// ============================================================

module.exports = router;
