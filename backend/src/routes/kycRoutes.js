const express = require('express');
const multer = require('multer');

const {
  authMiddleware,
} = require('../middleware/auth');

const {
  submitKyc,
  getMyKyc,
} = require('../controllers/kycController');

const router = express.Router();

// ============================================================
// FILE UPLOAD CONFIGURATION
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Only JPG, PNG, WebP images and PDF files are allowed.'
        )
      );
    }
  },
});

// ============================================================
// USER KYC
// ============================================================

// Get current user's KYC status
router.get(
  '/',
  authMiddleware,
  getMyKyc
);

// Submit identity verification
router.post(
  '/submit',
  authMiddleware,
  upload.single('document'),
  submitKyc
);

module.exports = router;
