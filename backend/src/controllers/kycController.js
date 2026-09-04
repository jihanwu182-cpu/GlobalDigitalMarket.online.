const pool = require('../config/database');
const logger = require('../utils/logger');

// ============================================================
// SUBMIT KYC VERIFICATION
// ============================================================

const submitKyc = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      documentType,
      documentNumber,
    } = req.body || {};

    // ========================================================
    // VALIDATE DOCUMENT TYPE
    // ========================================================

    const allowedDocumentTypes = [
      'PASSPORT',
      'NATIONAL_ID',
      'DRIVERS_LICENSE',
    ];

    const normalizedDocumentType =
      String(documentType || '')
        .trim()
        .toUpperCase();

    if (
      !allowedDocumentTypes.includes(
        normalizedDocumentType
      )
    ) {
      return res.status(400).json({
        message:
          'Please select a valid identity document type.',
      });
    }

    // ========================================================
    // VALIDATE DOCUMENT NUMBER
    // ========================================================

    const normalizedDocumentNumber =
      String(documentNumber || '').trim();

    if (!normalizedDocumentNumber) {
      return res.status(400).json({
        message:
          'Identity document number is required.',
      });
    }

    if (
      normalizedDocumentNumber.length < 3 ||
      normalizedDocumentNumber.length > 150
    ) {
      return res.status(400).json({
        message:
          'Identity document number must be between 3 and 150 characters.',
      });
    }

    // ========================================================
    // VALIDATE FILE
    // ========================================================

    if (!req.file) {
      return res.status(400).json({
        message:
          'Please upload your identity document.',
      });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (
      !allowedTypes.includes(
        req.file.mimetype
      )
    ) {
      return res.status(400).json({
        message:
          'Only JPG, PNG, WebP images and PDF files are allowed.',
      });
    }

    // ========================================================
    // CHECK USER
    // ========================================================

    const userResult =
      await pool.query(
        `
        SELECT
          id,
          identity_verification_status
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
      );

    if (
      userResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user =
      userResult.rows[0];

    const currentStatus =
      String(
        user.identity_verification_status ||
          'PENDING'
      )
        .trim()
        .toUpperCase();

    // ========================================================
    // PREVENT DUPLICATE APPROVED SUBMISSION
    // ========================================================

    if (currentStatus === 'APPROVED') {
      return res.status(409).json({
        message:
          'Your identity verification has already been approved.',
        status: 'APPROVED',
      });
    }

    // ========================================================
    // UPLOAD TO CLOUDINARY
    // ========================================================

    const cloudinary =
      require('../config/cloudinary');

    const uploadedFile =
      await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  'globaldigitalmarket/kyc-documents',

                resource_type:
                  'auto',
              },

              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(
            req.file.buffer
          );
        }
      );

    // ========================================================
    // SAVE KYC RECORD
    // ========================================================

    const client =
      await pool.connect();

    try {
      await client.query('BEGIN');

      // ------------------------------------------------------
      // Create identity document record
      // ------------------------------------------------------

      const documentResult =
        await client.query(
          `
          INSERT INTO identity_documents (
            user_id,
            document_type,
            document_number,
            document_url,
            status
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            'PENDING'
          )

          RETURNING
            id,
            user_id,
            document_type,
            document_number,
            document_url,
            status,
            created_at
          `,
          [
            userId,
            normalizedDocumentType,
            normalizedDocumentNumber,
            uploadedFile.secure_url,
          ]
        );

      // ------------------------------------------------------
      // Update user verification status
      // ------------------------------------------------------

      await client.query(
        `
        UPDATE users

        SET
          identity_document_type = $1,
          identity_document_number = $2,
          identity_document_url = $3,
          identity_verification_status = 'PENDING'

        WHERE id = $4
        `,
        [
          normalizedDocumentType,
          normalizedDocumentNumber,
          uploadedFile.secure_url,
          userId,
        ]
      );

      await client.query('COMMIT');

      const document =
        documentResult.rows[0];

      return res.status(201).json({
        message:
          'Identity verification submitted successfully. Your document is now awaiting administrator review.',

        verification: {
          id: document.id,

          documentType:
            document.document_type,

          documentNumber:
            document.document_number,

          documentUrl:
            document.document_url,

          status:
            document.status,

          createdAt:
            document.created_at,
        },
      });
    } catch (databaseError) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error(
          'KYC rollback error:',
          rollbackError
        );
      }

      throw databaseError;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error(
      'KYC submission error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET MY KYC STATUS
// ============================================================

const getMyKyc = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const userResult =
      await pool.query(
        `
        SELECT
          identity_document_type,
          identity_document_number,
          identity_document_url,
          identity_verification_status
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
      );

    if (
      userResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user =
      userResult.rows[0];

    const documentResult =
      await pool.query(
        `
        SELECT
          id,
          document_type,
          document_number,
          document_url,
          status,
          rejection_reason,
          reviewed_at,
          created_at,
          updated_at
        FROM identity_documents
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId]
      );

    const document =
      documentResult.rows[0] || null;

    return res.status(200).json({
      verification: {
        status:
          user.identity_verification_status ||
          'PENDING',

        documentType:
          user.identity_document_type ||
          null,

        documentNumber:
          user.identity_document_number ||
          null,

        documentUrl:
          user.identity_document_url ||
          null,

        document,
      },
    });
  } catch (error) {
    logger.error(
      'Get KYC status error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  submitKyc,
  getMyKyc,
};
