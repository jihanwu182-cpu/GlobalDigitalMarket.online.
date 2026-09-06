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
} = require('../controllers/authController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Password routes
router.put('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
