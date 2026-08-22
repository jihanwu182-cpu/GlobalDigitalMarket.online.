const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
  ],
  validate,
  authController.register,
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login,
);

// Logout
router.post('/logout', authController.logout);

// Refresh Token
router.post('/refresh', authController.refreshToken);

module.exports = router;
