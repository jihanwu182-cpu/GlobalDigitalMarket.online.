const express = require('express');

const { adminMiddleware } = require('../middleware/auth');

const {
  sendAdminEmail,
} = require('../controllers/emailController');

const router = express.Router();

router.post(
  '/',
  adminMiddleware,
  sendAdminEmail
);

module.exports = router;
