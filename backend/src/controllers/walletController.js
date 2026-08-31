const pool = require('../config/database');
const logger = require('../utils/logger');
const { comparePassword } = require('../utils/bcrypt');

// ============================================================
// HELPERS
// ============================================================

const getAccount = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id,
      account_number,
      account_type,
      account_name,
      currency,
      balance,
      deposit,
      profits,
      available_balance,
      bonus,
      referrer_bonus,
      buying_power,
      margin_available,
      status
    FROM accounts
    WHERE user_id = $1
      AND LOWER(status) = 'active'
    ORDER BY id ASC
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

const createTransactionReference = (type) => {
  const prefix =
    type === 'DEPOSIT'
      ? 'DEP'
      : type === 'WITHDRAWAL'
        ? 'WTH'
        : 'TX';

  return `GDM-${prefix}-${Date.now()}-${Math.floor(
    Math.random() * 100000
  )}`;
};

const numberValue = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

// ============================================================
// GET WALLET BALANCE
// ============================================================

const getBalance = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const account =
      await getAccount(userId);

    if (!account) {
      return res.status(404).json({
        message:
          'Active trading account not found.',

        balance: 0,
        deposit: 0,
        profits: 0,
        availableBalance: 0,
        bonus: 0,
        referrerBonus: 0,
        buyingPower: 0,
        marginAvailable: 0,
        currency: 'USD',
      });
    }

    return res.status(200).json({
      balance:
        numberValue(account.balance),

      deposit:
        numberValue(account.deposit),

      profits:
        numberValue(account.profits),

      availableBalance:
        numberValue(
          account.available_balance
        ),

      bonus:
        numberValue(account.bonus),

      referrerBonus:
        numberValue(
          account.referrer_bonus
        ),

      buyingPower:
        numberValue(
          account.buying_power
        ),

      marginAvailable:
        numberValue(
          account.margin_available
        ),

      currency:
        account.currency || 'USD',

      accountNumber:
        account.account_number,

      accountType:
        account.account_type,

      accountName:
        account.account_name,

      status:
        account.status,
    });

  } catch (error) {
    logger.error(
      'Get wallet balance error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// DEPOSIT FUNDS
// ============================================================

const depositFunds = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const {
      amount,
      method,
      proofOfPaymentUrl,
    } = req.body || {};

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message:
          'Deposit amount must be a valid number greater than 0.',
      });
    }

    if (numericAmount < 10) {
      return res.status(400).json({
        message:
          'Minimum deposit amount is 10.00.',
      });
    }

    if (numericAmount > 1000000) {
      return res.status(400).json({
        message:
          'Deposit amount exceeds the maximum allowed amount.',
      });
    }

    if (
      typeof method !== 'string' ||
      !method.trim()
    ) {
      return res.status(400).json({
        message:
          'Please select a deposit method.',
      });
    }

    if (
      typeof proofOfPaymentUrl !== 'string' ||
      !proofOfPaymentUrl.trim()
    ) {
      return res.status(400).json({
        message:
          'Proof of payment is required for every deposit.',
      });
    }

    const account =
      await getAccount(userId);

    if (!account) {
      return res.status(404).json({
        message:
          'Active trading account not found.',
      });
    }

    const transactionReference =
      createTransactionReference(
        'DEPOSIT'
      );

    const result =
      await pool.query(
        `
        INSERT INTO transactions (
          account_id,
          transaction_reference,
          transaction_type,
          amount,
          currency,
          payment_method,
          status,
          description,
          metadata,
          proof_of_payment_url
        )

        VALUES (
          $1,
          $2,
          'DEPOSIT',
          $3,
          $4,
          $5,
          'PENDING',
          $6,
          $7::jsonb,
          $8
        )

        RETURNING
          id,
          transaction_reference,
          transaction_type,
          amount,
          currency,
          payment_method,
          status,
          description,
          proof_of_payment_url,
          created_at
        `,
        [
          account.id,

          transactionReference,

          numericAmount.toFixed(2),

          account.currency || 'USD',

          method.trim(),

          'Deposit request submitted and awaiting payment verification.',

          JSON.stringify({
            userId,
            accountId: account.id,
          }),

          proofOfPaymentUrl.trim(),
        ]
      );

    const transaction =
      result.rows[0];

    return res.status(201).json({
      message:
        'Deposit request submitted successfully. Your payment proof will be reviewed before the balance is credited.',

      transaction: {
        id:
          transaction.id,

        transactionReference:
          transaction.transaction_reference,

        transactionType:
          transaction.transaction_type,

        amount:
          numberValue(
            transaction.amount
          ),

        currency:
          transaction.currency,

        paymentMethod:
          transaction.payment_method,

        status:
          transaction.status,

        description:
          transaction.description,

        proofOfPaymentUrl:
          transaction.proof_of_payment_url,

        createdAt:
          transaction.created_at,
      },
    });

  } catch (error) {
    logger.error(
      'Deposit funds error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// WITHDRAW FUNDS
// ============================================================
//
// USER WORKFLOW:
//
// 1. Admin generates a withdrawal code for the user.
// 2. User enters the code when requesting withdrawal.
// 3. Backend verifies the code.
// 4. Code must be ACTIVE and not expired.
// 5. Code is linked to this withdrawal.
// 6. Code becomes USED.
// 7. Withdrawal becomes PENDING.
// 8. Available balance is reserved.
// 9. Admin reviews the withdrawal.
//
// IMPORTANT:
// The actual withdrawal code is NEVER returned to the user.
// ============================================================

const withdrawFunds = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const userId =
      req.user.id;

    const {
      amount,
      method,
      identityDocumentNumber,
      withdrawalCode,
    } = req.body || {};

    // ========================================================
    // VALIDATE AMOUNT
    // ========================================================

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message:
          'Withdrawal amount must be a valid number greater than 0.',
      });
    }

    if (numericAmount < 10) {
      return res.status(400).json({
        message:
          'Minimum withdrawal amount is 10.00.',
      });
    }

    // ========================================================
    // VALIDATE METHOD
    // ========================================================

    if (
      typeof method !== 'string' ||
      !method.trim()
    ) {
      return res.status(400).json({
        message:
          'Please select a withdrawal method.',
      });
    }

    // ========================================================
    // VALIDATE ID NUMBER
    // ========================================================

    if (
      typeof identityDocumentNumber !==
        'string' ||
      !identityDocumentNumber.trim()
    ) {
      return res.status(400).json({
        message:
          'Your verified identity document number is required before making a withdrawal.',
      });
    }

    // ========================================================
    // VALIDATE WITHDRAWAL CODE
    // ========================================================

    if (
      typeof withdrawalCode !== 'string' ||
      !withdrawalCode.trim()
    ) {
      return res.status(400).json({
        message:
          'A withdrawal authorization code is required before submitting your withdrawal request.',
      });
    }

    const submittedCode =
      withdrawalCode.trim();

    if (
      submittedCode.length < 4 ||
      submittedCode.length > 100
    ) {
      return res.status(400).json({
        message:
          'Invalid withdrawal authorization code.',
      });
    }

    // ========================================================
    // START TRANSACTION
    // ========================================================

    await client.query('BEGIN');

    // ========================================================
    // GET USER
    // ========================================================

    const userResult =
      await client.query(
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
      await client.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user =
      userResult.rows[0];

    // ========================================================
    // REQUIRE APPROVED KYC
    // ========================================================

    if (
      String(
        user.identity_verification_status ||
          ''
      )
        .trim()
        .toUpperCase() !==
      'APPROVED'
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(403).json({
        message:
          'Identity verification must be approved before you can request a withdrawal.',

        verificationStatus:
          user.identity_verification_status ||
          'PENDING',
      });
    }

    // ========================================================
    // GET APPROVED IDENTITY DOCUMENT
    // ========================================================

    const documentResult =
      await client.query(
        `
        SELECT
          id,
          document_type,
          document_number,
          status
        FROM identity_documents
        WHERE user_id = $1
          AND UPPER(status) = 'APPROVED'
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId]
      );

    if (
      documentResult.rows.length === 0
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(403).json({
        message:
          'No approved identity document was found. Please complete identity verification first.',
      });
    }

    const verifiedDocument =
      documentResult.rows[0];

    // ========================================================
    // VERIFY ID NUMBER
    // ========================================================

    if (
      String(
        verifiedDocument.document_number ||
          ''
      ).trim() !==
      identityDocumentNumber.trim()
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        message:
          'The identity document number does not match your approved verification record.',
      });
    }

    // ========================================================
    // GET AND LOCK ACCOUNT
    // ========================================================

    const accountResult =
      await client.query(
        `
        SELECT
          id,
          user_id,
          account_number,
          currency,
          balance,
          available_balance,
          status
        FROM accounts
        WHERE user_id = $1
          AND LOWER(status) = 'active'
        ORDER BY id ASC
        LIMIT 1
        FOR UPDATE
        `,
        [userId]
      );

    if (
      accountResult.rows.length === 0
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        message:
          'Active trading account not found.',
      });
    }

    const account =
      accountResult.rows[0];

    const availableBalance =
      numberValue(
        account.available_balance
      );

    // ========================================================
    // CHECK BALANCE
    // ========================================================

    if (
      numericAmount >
      availableBalance
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        message:
          'Insufficient available balance.',

        availableBalance,

        requestedAmount:
          numericAmount,
      });
    }

    // ========================================================
    // PREVENT DUPLICATE PENDING WITHDRAWAL
    // ========================================================

    const pendingResult =
      await client.query(
        `
        SELECT
          id,
          transaction_reference
        FROM transactions
        WHERE account_id = $1
          AND transaction_type = 'WITHDRAWAL'
          AND status IN (
            'PENDING',
            'PROCESSING'
          )
        LIMIT 1
        `,
        [account.id]
      );

    if (
      pendingResult.rows.length > 0
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        message:
          'You already have a withdrawal request being processed.',

        transactionReference:
          pendingResult.rows[0]
            .transaction_reference,
      });
    }

    // ========================================================
    // FIND ADMIN-GENERATED WITHDRAWAL CODE
    // ========================================================
    //
    // The code must:
    //
    // - belong to this user
    // - be ACTIVE
    // - not be used
    // - not be expired
    //
    // We lock the row so two requests cannot use
    // the same code simultaneously.
    // ========================================================

    const codeResult =
      await client.query(
        `
        SELECT
          id,
          user_id,
          code_hash,
          status,
          expires_at,
          used_at,
          generated_by
        FROM withdrawal_codes
        WHERE user_id = $1
          AND UPPER(status) = 'ACTIVE'
          AND used_at IS NULL
          AND (
            expires_at IS NULL
            OR expires_at > CURRENT_TIMESTAMP
          )
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
        `,
        [userId]
      );

    if (
      codeResult.rows.length === 0
    ) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(403).json({
        message:
          'No active withdrawal authorization code is available for your account. Please contact the administrator.',
      });
    }

    const storedCode =
      codeResult.rows[0];

    // ========================================================
    // VERIFY CODE
    // ========================================================

    let codeMatches = false;

    try {
      codeMatches =
        await comparePassword(
          submittedCode,
          storedCode.code_hash
        );
    } catch (codeError) {
      logger.error(
        'Withdrawal code comparison error:',
        codeError
      );

      await client.query(
        'ROLLBACK'
      );

      return res.status(500).json({
        message:
          'Unable to verify withdrawal authorization code.',
      });
    }

    if (!codeMatches) {
      await client.query(
        'ROLLBACK'
      );

      return res.status(403).json({
        message:
          'The withdrawal authorization code is incorrect.',
      });
    }

    // ========================================================
    // CREATE WITHDRAWAL REFERENCE
    // ========================================================

    const transactionReference =
      createTransactionReference(
        'WITHDRAWAL'
      );

    // ========================================================
    // CREATE PENDING WITHDRAWAL
    // ========================================================

    const result =
      await client.query(
        `
        INSERT INTO transactions (
          account_id,
          transaction_reference,
          transaction_type,
          amount,
          currency,
          payment_method,
          status,
          description,
          metadata
        )

        VALUES (
          $1,
          $2,
          'WITHDRAWAL',
          $3,
          $4,
          $5,
          'PENDING',
          $6,
          $7::jsonb
        )

        RETURNING
          id,
          transaction_reference,
          transaction_type,
          amount,
          currency,
          payment_method,
          status,
          description,
          created_at
        `,
        [
          account.id,

          transactionReference,

          numericAmount.toFixed(2),

          account.currency || 'USD',

          method.trim(),

          'Withdrawal request submitted and awaiting administrator review.',

          JSON.stringify({
            userId,

            accountId:
              account.id,

            identityDocumentId:
              verifiedDocument.id,

            identityDocumentType:
              verifiedDocument.document_type,

            withdrawalCodeId:
              storedCode.id,
          }),
        ]
      );

    const transaction =
      result.rows[0];

    // ========================================================
    // LINK CODE TO WITHDRAWAL
    // ========================================================

    await client.query(
      `
      UPDATE withdrawal_codes

      SET
        transaction_id = $1,
        status = 'USED',
        used_at = CURRENT_TIMESTAMP

      WHERE id = $2
      `,
      [
        transaction.id,
        storedCode.id,
      ]
    );

    // ========================================================
    // RESERVE AVAILABLE BALANCE
    // ========================================================
    //
    // balance remains unchanged.
    //
    // available_balance is reduced so the user cannot
    // spend the same funds again while the admin reviews
    // the withdrawal.
    // ========================================================

    await client.query(
      `
      UPDATE accounts

      SET
        available_balance =
          COALESCE(
            available_balance,
            0
          ) - $1,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = $2
      `,
      [
        numericAmount.toFixed(2),

        account.id,
      ]
    );

    // ========================================================
    // COMMIT
    // ========================================================

    await client.query(
      'COMMIT'
    );

    // ========================================================
    // RESPONSE
    // ========================================================
    //
    // IMPORTANT:
    // Never return the withdrawal code.
    // Never return code_hash.
    // ========================================================

    return res.status(201).json({
      message:
        'Withdrawal request submitted successfully. It is now awaiting administrator review.',

      transaction: {
        id:
          transaction.id,

        transactionReference:
          transaction.transaction_reference,

        transactionType:
          transaction.transaction_type,

        amount:
          numberValue(
            transaction.amount
          ),

        currency:
          transaction.currency,

        paymentMethod:
          transaction.payment_method,

        status:
          transaction.status,

        description:
          transaction.description,

        createdAt:
          transaction.created_at,
      },

      verification: {
        status:
          user.identity_verification_status,

        documentType:
          verifiedDocument.document_type,
      },

      messageForUser:
        'Your withdrawal request has been submitted and is awaiting administrator review.',
    });

  } catch (error) {
    try {
      await client.query(
        'ROLLBACK'
      );
    } catch (rollbackError) {
      logger.error(
        'Withdrawal rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Withdraw funds error:',
      error
    );

    return next(error);

  } finally {
    client.release();
  }
};

// ============================================================
// GET USER TRANSACTIONS
// ============================================================

const getTransactions = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user.id;

    const account =
      await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        transactions: [],
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          transaction_reference,
          transaction_type,
          amount,
          currency,
          payment_method,
          status,
          description,
          proof_of_payment_url,
          admin_note,
          created_at,
          updated_at

        FROM transactions

        WHERE account_id = $1

        ORDER BY
          created_at DESC

        LIMIT 100
        `,
        [account.id]
      );

    const transactions =
      result.rows.map(
        (transaction) => ({
          id:
            transaction.id,

          transactionReference:
            transaction.transaction_reference,

          transactionType:
            transaction.transaction_type,

          amount:
            numberValue(
              transaction.amount
            ),

          currency:
            transaction.currency,

          paymentMethod:
            transaction.payment_method ||
            '',

          status:
            transaction.status,

          description:
            transaction.description ||
            '',

          proofOfPaymentUrl:
            transaction.proof_of_payment_url ||
            null,

          adminNote:
            transaction.admin_note ||
            null,

          createdAt:
            transaction.created_at,

          updatedAt:
            transaction.updated_at,
        })
      );

    return res.status(200).json({
      transactions,
    });

  } catch (error) {
    logger.error(
      'Get transactions error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPLOAD PAYMENT PROOF
// ============================================================

const uploadProofOfPayment = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          'Please select a payment proof file.',
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

    const cloudinary =
      require('../config/cloudinary');

    const uploadedFile =
      await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  'globaldigitalmarket/payment-proofs',

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

    return res.status(201).json({
      message:
        'Payment proof uploaded successfully.',

      proofOfPaymentUrl:
        uploadedFile.secure_url,

      publicId:
        uploadedFile.public_id,

      resourceType:
        uploadedFile.resource_type,
    });

  } catch (error) {
    logger.error(
      'Payment proof upload error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getBalance,
  depositFunds,
  withdrawFunds,
  getTransactions,
  uploadProofOfPayment,
};
