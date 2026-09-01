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

  // Account Funding / Debit
  fundUserAccount,
  debitUserAccount,

  // Transactions
  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  // Deposits
  rejectDeposit,

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

  // Payment Methods
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,

  // Withdrawal
  generateWithdrawalCodeForTransaction,
  getWithdrawalDetails,
  reverseWithdrawal,
  rejectWithdrawal,
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

  // Dashboard
  getDashboard,

  // Users
  getUsers,
  getUser,
  updateUserStatus,

  // Account Funding / Debit
  fundUserAccount,
  debitUserAccount,

  // Transactions
  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  // Deposits
  rejectDeposit,

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

  // Payment Methods
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,

  // Withdrawal
  generateWithdrawalCodeForTransaction,
  getWithdrawalDetails,
  reverseWithdrawal,
  rejectWithdrawal,
};

for (
  const [name, handler]
  of Object.entries(requiredHandlers)
) {
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
// PUBLIC
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
// USER ACCOUNT CREDIT
// ============================================================
//
// POST /api/admin/users/:id/fund
//
// Supports:
// DEPOSIT
// PROFIT
// BONUS
// REFERRAL_BONUS
//

router.post(
  '/users/:id/fund',
  fundUserAccount
);

// ============================================================
// USER ACCOUNT DEBIT
// ============================================================
//
// POST /api/admin/users/:id/debit
//
// Supports:
// DEPOSIT
// PROFIT
// BONUS
// REFERRAL_BONUS
//

router.post(
  '/users/:id/debit',
  debitUserAccount
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
// GET   /api/admin/deposits
// PATCH /api/admin/deposits/:id/reject
//
// Admin can:
// - View deposit
// - View payment method
// - View proof of payment
// - Approve deposit
// - Reject deposit
//

router.get(
  '/deposits',
  getDeposits
);

router.patch(
  '/deposits/:id/reject',
  rejectDeposit
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
// WITHDRAWAL DETAILS
// ============================================================
//
// GET /api/admin/withdrawals/:id
//

router.get(
  '/withdrawals/:id',
  getWithdrawalDetails
);

// ============================================================
// APPROVE / COMPLETE WITHDRAWAL
// ============================================================
//
// PATCH /api/admin/transactions/:id/status
//
// Send:
// {
//   "status": "COMPLETED"
// }
//

/*
 * Withdrawal approval is handled by the existing
 * updateTransactionStatus controller.
 */

// ============================================================
// REJECT WITHDRAWAL
// ============================================================
//
// PATCH /api/admin/withdrawals/:id/reject
//

router.patch(
  '/withdrawals/:id/reject',
  rejectWithdrawal
);

// ============================================================
// REVERSE COMPLETED WITHDRAWAL
// ============================================================
//
// PATCH /api/admin/withdrawals/:id/reverse
//

router.patch(
  '/withdrawals/:id/reverse',
  reverseWithdrawal
);

// ============================================================
// GENERATE WITHDRAWAL CODE
// ============================================================
//
// POST /api/admin/withdrawals/:id/code
//
// The withdrawal must already be COMPLETED/approved.
//

router.post(
  '/withdrawals/:id/code',
  generateWithdrawalCodeForTransaction
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
// PAYMENT METHODS
// ============================================================
//
// GET    /api/admin/payment-methods
// POST   /api/admin/payment-methods
// PATCH  /api/admin/payment-methods/:id
// DELETE /api/admin/payment-methods/:id
//

router.get(
  '/payment-methods',
  getPaymentMethods
);

router.post(
  '/payment-methods',
  createPaymentMethod
);

router.patch(
  '/payment-methods/:id',
  updatePaymentMethod
);

router.delete(
  '/payment-methods/:id',
  deletePaymentMethod
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
