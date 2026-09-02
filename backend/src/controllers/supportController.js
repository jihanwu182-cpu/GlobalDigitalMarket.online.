const pool = require('../config/database');
const logger = require('../utils/logger');

// ============================================================
// USER: GET OR CREATE CHAT CONVERSATION
// ============================================================

const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;

    let result = await pool.query(
      `
      SELECT
        id,
        user_id,
        status,
        last_message_at,
        created_at,
        updated_at
      FROM support_conversations
      WHERE user_id = $1
        AND status = 'OPEN'
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length > 0) {
      return res.status(200).json({
        conversation: result.rows[0],
      });
    }

    result = await pool.query(
      `
      INSERT INTO support_conversations (
        user_id,
        status
      )
      VALUES (
        $1,
        'OPEN'
      )
      RETURNING
        id,
        user_id,
        status,
        last_message_at,
        created_at,
        updated_at
      `,
      [userId]
    );

    return res.status(201).json({
      conversation: result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Create support conversation failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to create support conversation.',
      message: error.message,
    });
  }
};

// ============================================================
// USER: GET CHAT MESSAGES
// ============================================================

const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = Number(req.params.conversationId);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT id
      FROM support_conversations
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.sender_role,
        m.message,
        m.is_read,
        m.read_at,
        m.created_at,
        u.first_name,
        u.last_name
      FROM support_messages m
      INNER JOIN users u
        ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    return res.status(200).json({
      messages: result.rows,
    });
  } catch (error) {
    logger.error(
      'Get user support messages failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to load support messages.',
      message: error.message,
    });
  }
};

// ============================================================
// USER: SEND MESSAGE
// ============================================================

const sendUserMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = Number(req.params.conversationId);
    const message = String(req.body.message || '').trim();

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    if (!message) {
      return res.status(400).json({
        error: 'Message is required.',
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: 'Message cannot exceed 5000 characters.',
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT id, status
      FROM support_conversations
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    if (conversationResult.rows[0].status === 'CLOSED') {
      return res.status(400).json({
        error: 'This conversation is closed.',
        message:
          'Please start a new support conversation.',
      });
    }

    const messageResult = await pool.query(
      `
      INSERT INTO support_messages (
        conversation_id,
        sender_id,
        sender_role,
        message,
        is_read
      )
      VALUES (
        $1,
        $2,
        'user',
        $3,
        FALSE
      )
      RETURNING
        id,
        conversation_id,
        sender_id,
        sender_role,
        message,
        is_read,
        created_at
      `,
      [
        conversationId,
        userId,
        message,
      ]
    );

    await pool.query(
      `
      UPDATE support_conversations
      SET
        last_message_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversationId]
    );

    // Notify all administrators about the new message.
    const adminsResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(role) IN (
        'admin',
        'administrator',
        'superadmin'
      )
        AND LOWER(status) = 'active'
      `
    );

    for (const admin of adminsResult.rows) {
      await pool.query(
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
          'New Live Chat Message',
          $2,
          'SUPPORT',
          FALSE,
          $3
        )
        `,
        [
          admin.id,
          `A user sent a new live chat message.`,
          userId,
        ]
      );
    }

    return res.status(201).json({
      message: messageResult.rows[0],
    });
  } catch (error) {
    logger.error(
      'Send user support message failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to send support message.',
      message: error.message,
    });
  }
};

// ============================================================
// ADMIN: GET ALL CONVERSATIONS
// ============================================================

const getAdminConversations = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.user_id,
        c.status,
        c.last_message_at,
        c.created_at,
        c.updated_at,

        u.email,
        u.first_name,
        u.last_name,
        u.username,

        (
          SELECT COUNT(*)
          FROM support_messages m
          WHERE m.conversation_id = c.id
            AND m.sender_role = 'user'
            AND m.is_read = FALSE
        ) AS unread_count,

        (
          SELECT m.message
          FROM support_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message

      FROM support_conversations c

      INNER JOIN users u
        ON u.id = c.user_id

      ORDER BY c.last_message_at DESC
      `
    );

    return res.status(200).json({
      conversations: result.rows,
    });
  } catch (error) {
    logger.error(
      'Get admin support conversations failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to load support conversations.',
      message: error.message,
    });
  }
};

// ============================================================
// ADMIN: GET CONVERSATION MESSAGES
// ============================================================

const getAdminMessages = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT
        c.id,
        c.user_id,
        c.status,
        u.email,
        u.first_name,
        u.last_name,
        u.username
      FROM support_conversations c
      INNER JOIN users u
        ON u.id = c.user_id
      WHERE c.id = $1
      LIMIT 1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    const messagesResult = await pool.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.sender_role,
        m.message,
        m.is_read,
        m.read_at,
        m.created_at,
        u.first_name,
        u.last_name
      FROM support_messages m
      INNER JOIN users u
        ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    return res.status(200).json({
      conversation: conversationResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error) {
    logger.error(
      'Get admin support messages failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to load support messages.',
      message: error.message,
    });
  }
};

// ============================================================
// ADMIN: SEND MESSAGE
// ============================================================

const sendAdminMessage = async (req, res) => {
  try {
    const adminId = req.user.id;
    const conversationId = Number(req.params.conversationId);
    const message = String(req.body.message || '').trim();

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    if (!message) {
      return res.status(400).json({
        error: 'Message is required.',
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: 'Message cannot exceed 5000 characters.',
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        status
      FROM support_conversations
      WHERE id = $1
      LIMIT 1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    const conversation =
      conversationResult.rows[0];

    if (conversation.status === 'CLOSED') {
      return res.status(400).json({
        error: 'This conversation is closed.',
      });
    }

    const messageResult = await pool.query(
      `
      INSERT INTO support_messages (
        conversation_id,
        sender_id,
        sender_role,
        message,
        is_read
      )
      VALUES (
        $1,
        $2,
        'admin',
        $3,
        FALSE
      )
      RETURNING
        id,
        conversation_id,
        sender_id,
        sender_role,
        message,
        is_read,
        created_at
      `,
      [
        conversationId,
        adminId,
        message,
      ]
    );

    await pool.query(
      `
      UPDATE support_conversations
      SET
        last_message_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversationId]
    );

    // Notify the user that support has replied.
    await pool.query(
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
        'New Support Reply',
        $2,
        'SUPPORT',
        FALSE,
        $3
      )
      `,
      [
        conversation.user_id,
        'You have received a new live chat reply from GlobalDigitalMarket Support.',
        adminId,
      ]
    );

    return res.status(201).json({
      message: messageResult.rows[0],
    });
  } catch (error) {
    logger.error(
      'Send admin support message failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to send support reply.',
      message: error.message,
    });
  }
};

// ============================================================
// MARK MESSAGES AS READ
// ============================================================

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = Number(req.params.conversationId);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    const isAdmin = [
      'admin',
      'administrator',
      'superadmin',
    ].includes(
      String(req.user.role || '').toLowerCase()
    );

    if (isAdmin) {
      await pool.query(
        `
        UPDATE support_messages
        SET
          is_read = TRUE,
          read_at = CURRENT_TIMESTAMP
        WHERE conversation_id = $1
          AND sender_role = 'user'
          AND is_read = FALSE
        `,
        [conversationId]
      );
    } else {
      const ownership = await pool.query(
        `
        SELECT id
        FROM support_conversations
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        `,
        [
          conversationId,
          userId,
        ]
      );

      if (ownership.rows.length === 0) {
        return res.status(404).json({
          error: 'Conversation not found.',
        });
      }

      await pool.query(
        `
        UPDATE support_messages
        SET
          is_read = TRUE,
          read_at = CURRENT_TIMESTAMP
        WHERE conversation_id = $1
          AND sender_role = 'admin'
          AND is_read = FALSE
        `,
        [conversationId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (error) {
    logger.error(
      'Mark support messages as read failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to mark messages as read.',
      message: error.message,
    });
  }
};

// ============================================================
// ADMIN: CLOSE CONVERSATION
// ============================================================

const closeConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        error: 'Invalid conversation ID.',
      });
    }

    const result = await pool.query(
      `
      UPDATE support_conversations
      SET
        status = 'CLOSED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        user_id,
        status,
        updated_at
      `,
      [conversationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    return res.status(200).json({
      conversation: result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Close support conversation failed:',
      error
    );

    return res.status(500).json({
      error: 'Unable to close conversation.',
      message: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getOrCreateConversation,
  getUserMessages,
  sendUserMessage,
  getAdminConversations,
  getAdminMessages,
  sendAdminMessage,
  markMessagesAsRead,
  closeConversation,
};
