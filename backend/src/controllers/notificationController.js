const pool = require('../config/database');
const logger = require('../utils/logger');

// ============================================================
// ADMIN: CREATE NOTIFICATION
// ============================================================

const createNotification = async (req, res) => {
  try {
    const adminId = req.user.id;

    const {
      userId,
      title,
      message,
      type = 'INFO',
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required.',
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        error: 'Notification title is required.',
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        error: 'Notification message is required.',
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        FALSE,
        $5
      )
      RETURNING
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_by,
        created_at,
        read_at
      `,
      [
        Number(userId),
        String(title).trim(),
        String(message).trim(),
        String(type).trim().toUpperCase(),
        adminId,
      ]
    );

    return res.status(201).json({
      message: 'Notification sent successfully.',
      notification: result.rows[0],
      user: userResult.rows[0],
    });
  } catch (error) {
    logger.error(
      'Create notification failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to create notification.',
      message: error.message,
    });
  }
};

// ============================================================
// ADMIN: GET ALL NOTIFICATIONS
// ============================================================

const getAdminNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.created_by,
        n.created_at,
        n.read_at,

        u.first_name,
        u.last_name,
        u.email

      FROM notifications n

      INNER JOIN users u
        ON u.id = n.user_id

      ORDER BY n.created_at DESC
      `
    );

    return res.status(200).json({
      notifications: result.rows,
    });
  } catch (error) {
    logger.error(
      'Get admin notifications failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to load notifications.',
      message: error.message,
    });
  }
};

// ============================================================
// USER: GET MY NOTIFICATIONS
// ============================================================

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        read_at

      FROM notifications

      WHERE user_id = $1

      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      notifications: result.rows,
    });
  } catch (error) {
    logger.error(
      'Get user notifications failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to load your notifications.',
      message: error.message,
    });
  }
};

// ============================================================
// USER: MARK NOTIFICATION AS READ
// ============================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(
      req.params.id
    );

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({
        error: 'Invalid notification ID.',
      });
    }

    const result = await pool.query(
      `
      UPDATE notifications

      SET
        is_read = TRUE,
        read_at = CURRENT_TIMESTAMP

      WHERE id = $1
        AND user_id = $2

      RETURNING
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        read_at
      `,
      [
        notificationId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Notification not found.',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read.',
      notification: result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Mark notification as read failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to update notification.',
      message: error.message,
    });
  }
};

// ============================================================
// USER: MARK ALL NOTIFICATIONS AS READ
// ============================================================

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      UPDATE notifications

      SET
        is_read = TRUE,
        read_at = CURRENT_TIMESTAMP

      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [userId]
    );

    return res.status(200).json({
      message:
        'All notifications marked as read.',
    });
  } catch (error) {
    logger.error(
      'Mark all notifications as read failed:',
      error
    );

    return res.status(500).json({
      error:
        'Unable to update notifications.',
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getAdminNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
