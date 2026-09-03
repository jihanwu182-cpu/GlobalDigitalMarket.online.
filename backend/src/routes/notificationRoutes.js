const express = require('express');

const { authMiddleware } = require('../middleware/auth');

const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  getUserNotifications
);

router.patch(
  '/:id/read',
  authMiddleware,
  markNotificationAsRead
);

router.patch(
  '/read-all',
  authMiddleware,
  markAllNotificationsAsRead
);

module.exports = router;
