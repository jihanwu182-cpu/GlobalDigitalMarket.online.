const express = require('express');

const router = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} = require('../controllers/authController');

// ============================================================
// AUTH ROUTES
// ============================================================

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/refresh-token', refreshToken);

// ============================================================
// PASSWORD ROUTES
// ============================================================

router.put(
  '/change-password',
  changePassword
);

router.post(
  '/forgot-password',
  forgotPassword
);

router.post(
  '/reset-password',
  resetPassword
);

// ============================================================
// EMAIL VERIFICATION ROUTES
// ============================================================

router.post(
  '/send-verification-email',
  sendVerificationEmail
);

router.post(
  '/verify-email',
  verifyEmail
);

module.exports = router;
