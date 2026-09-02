const express = require('express');

const router = express.Router();

// ============================================================
// LIVE CHAT / SUPPORT
// ============================================================

// Basic support service health check
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    service: 'GlobalDigitalMarket Support',
    liveChat: true,
    message: 'Support service is available.',
  });
});

module.exports = router;
