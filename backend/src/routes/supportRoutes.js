const express = require('express');

const {
  authMiddleware,
  adminMiddleware,
} = require('../middleware/auth');

const {
  getOrCreateConversation,
  getUserMessages,
  sendUserMessage,
  getAdminConversations,
  getAdminMessages,
  sendAdminMessage,
  markMessagesAsRead,
  closeConversation,
} = require('../controllers/supportController');

const router = express.Router();

// ============================================================
// USER LIVE CHAT
// ============================================================

// Get the user's active conversation,
// or create one if none exists.
router.get(
  '/conversation',
  authMiddleware,
  getOrCreateConversation
);

// Get messages belonging to the user's conversation.
router.get(
  '/conversation/:conversationId/messages',
  authMiddleware,
  getUserMessages
);

// Send a message as the logged-in user.
router.post(
  '/conversation/:conversationId/messages',
  authMiddleware,
  sendUserMessage
);

// Mark admin messages as read for the logged-in user.
router.patch(
  '/conversation/:conversationId/read',
  authMiddleware,
  markMessagesAsRead
);

// ============================================================
// ADMIN LIVE CHAT
// ============================================================

// Get all support conversations.
router.get(
  '/admin/conversations',
  adminMiddleware,
  getAdminConversations
);

// Get messages for a specific conversation.
router.get(
  '/admin/conversations/:conversationId/messages',
  adminMiddleware,
  getAdminMessages
);

// Send a reply as an administrator.
router.post(
  '/admin/conversations/:conversationId/messages',
  adminMiddleware,
  sendAdminMessage
);

// Mark user's messages as read.
router.patch(
  '/admin/conversations/:conversationId/read',
  adminMiddleware,
  markMessagesAsRead
);

// Close a conversation.
router.patch(
  '/admin/conversations/:conversationId/close',
  adminMiddleware,
  closeConversation
);

module.exports = router;
