const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
} = require('../controllers/authController');   // ← make sure this path is correct

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
