const express = require('express');
const multer = require('multer');

const { authMiddleware } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

const router = express.Router();

// ============================================================
// MULTER
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (allowedTypes.includes(file.mimetype)) {
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
// AUTHENTICATION
// ============================================================

router.use(authMiddleware);

// ============================================================
// WALLET
// ============================================================

router.get(
  '/balance',
  walletController.getBalance
);

router.post(
  '/deposit',
  walletController.depositFunds
);

router.post(
  '/withdraw',
  walletController.withdrawFunds
);

router.get(
  '/transactions',
  walletController.getTransactions
);

// ============================================================
// PAYMENT PROOF UPLOAD
// ============================================================

router.post(
  '/upload-proof',
  upload.single('proof'),
  walletController.uploadProofOfPayment
);

module.exports = router;
