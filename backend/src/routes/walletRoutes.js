const express = require('express');
const multer = require('multer');

const {
  authMiddleware,
} = require('../middleware/auth');

const walletController = require('../controllers/walletController');

const router = express.Router();

// ============================================================
// MULTER CONFIGURATION
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
// WALLET BALANCE
// ============================================================

router.get(
  '/balance',
  walletController.getBalance
);

// ============================================================
// DEPOSIT
// ============================================================

router.post(
  '/deposit',
  walletController.depositFunds
);

// ============================================================
// WITHDRAWAL
// ============================================================

router.post(
  '/withdraw',
  walletController.withdrawFunds
);

// ============================================================
// TRANSACTION HISTORY
// ============================================================

router.get(
  '/transactions',
  walletController.getTransactions
);

// ============================================================
// PAYMENT PROOF UPLOAD
// ============================================================
//
// Frontend sends:
//
// FormData
//   proof = selected file
//
// Multer places the uploaded file in:
//
// req.file
//
// Then the controller uploads it to Cloudinary.
//

router.post(
  '/upload-proof',
  upload.single('proof'),
  (req, res, next) => {
    console.log(
      '================================================'
    );

    console.log(
      'PAYMENT PROOF UPLOAD REQUEST'
    );

    console.log(
      'File received:',
      !!req.file
    );

    if (req.file) {
      console.log(
        'File name:',
        req.file.originalname
      );

      console.log(
        'File type:',
        req.file.mimetype
      );

      console.log(
        'File size:',
        req.file.size
      );
    }

    console.log(
      '================================================'
    );

    next();
  },
  walletController.uploadProofOfPayment
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
