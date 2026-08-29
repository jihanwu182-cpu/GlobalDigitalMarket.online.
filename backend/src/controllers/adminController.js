const pool = require('../config/database');
const logger = require('../utils/logger');

const {
  generateAccessToken,
} = require('../utils/jwt');

const {
  comparePassword,
} = require('../utils/bcrypt');

// ============================================================
// HELPERS
// ============================================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const normalizeStatus = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase();
};

const normalizeUserStatus = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase();
};

const getSignalStrength = (value) => {
  const strength = Number(value);

  if (!Number.isFinite(strength)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, strength)
  );
};

const isPositiveInteger = (value) => {
  return (
    Number.isInteger(value) &&
    value > 0
  );
};

// ============================================================
// SIGNAL DATABASE SETUP
// IMPORTANT:
// This matches the database schema in config/database.js.
// ============================================================

const ensureSignalTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_plans (
      id SERIAL PRIMARY KEY,

      name VARCHAR(150) NOT NULL,

      description TEXT,

      strength INTEGER
        NOT NULL DEFAULT 50,

      accuracy_percent NUMERIC(6, 2)
        NOT NULL DEFAULT 0,

      duration_days INTEGER
        NOT NULL DEFAULT 30,

      price NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

      currency VARCHAR(10)
        NOT NULL DEFAULT 'USD',

      status VARCHAR(20)
        NOT NULL DEFAULT 'ACTIVE',

      created_by INTEGER,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS accuracy_percent NUMERIC(6, 2)
    DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS duration_days INTEGER
    DEFAULT 30;
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS price NUMERIC(20, 2)
    DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10)
    DEFAULT 'USD';
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS created_by INTEGER;
  `);

  await pool.query(`
    ALTER TABLE signal_plans
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_signals (
      id SERIAL PRIMARY KEY,

      user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      signal_plan_id INTEGER
        REFERENCES signal_plans(id)
        ON DELETE SET NULL,

      strength INTEGER
        NOT NULL DEFAULT 50,

      status VARCHAR(20)
        NOT NULL DEFAULT 'ACTIVE',

      note TEXT,

      updated_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(user_id)
    );
  `);

  await pool.query(`
    ALTER TABLE user_signals
    ADD COLUMN IF NOT EXISTS status VARCHAR(20)
    DEFAULT 'ACTIVE';
  `);

  await pool.query(`
    ALTER TABLE user_signals
    ADD COLUMN IF NOT EXISTS note TEXT;
  `);

  await pool.query(`
    ALTER TABLE user_signals
    ADD COLUMN IF NOT EXISTS updated_by INTEGER;
  `);

  await pool.query(`
    ALTER TABLE user_signals
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_signals_user_id
    ON user_signals(user_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_signals_plan_id
    ON user_signals(signal_plan_id);
  `);
};

// ============================================================
// ADMIN LOGIN
// ============================================================

const adminLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Admin email and password are required.',
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const result =
      await pool.query(
        `
        SELECT
          id,
          email,
          password_hash,
          first_name,
          last_name,
          username,
          phone,
          role,
          status
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message:
          'Invalid administrator email or password.',
      });
    }

    const admin =
      result.rows[0];

    const passwordMatches =
      await comparePassword(
        password,
        admin.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          'Invalid administrator email or password.',
      });
    }

    const role =
      String(
        admin.role || ''
      )
        .trim()
        .toLowerCase();

    if (
      role !== 'admin' &&
      role !== 'administrator' &&
      role !== 'superadmin'
    ) {
      return res.status(403).json({
        message:
          'Administrator access required.',
      });
    }

    const status =
      String(
        admin.status || ''
      )
        .trim()
        .toLowerCase();

    if (
      status === 'blocked' ||
      status === 'suspended' ||
      status === 'disabled'
    ) {
      return res.status(403).json({
        message:
          'This administrator account is unavailable.',
      });
    }

    const accessToken =
      generateAccessToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
      });

    const adminUser = {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      username: admin.username || '',
      phone: admin.phone || '',
      role: admin.role,
      status: admin.status,
    };

    logger.info(
      `Successful admin login for email: ${normalizedEmail}`
    );

    return res.status(200).json({
      message:
        'Administrator login successful.',

      token: accessToken,

      accessToken,

      admin: adminUser,
    });

  } catch (error) {
    logger.error(
      'Admin login error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const getDashboard = async (
  req,
  res,
  next
) => {
  try {
    const usersResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users
      `);

    const activeUsersResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE LOWER(status) = 'active'
      `);

    const accountsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM accounts
      `);

    const transactionsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
      `);

    const pendingTransactionsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE status IN (
          'PENDING',
          'PROCESSING'
        )
      `);

    const depositsResult =
      await pool.query(`
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total
        FROM transactions
        WHERE transaction_type = 'DEPOSIT'
        AND status = 'COMPLETED'
      `);

    const withdrawalsResult =
      await pool.query(`
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total
        FROM transactions
        WHERE transaction_type = 'WITHDRAWAL'
        AND status = 'COMPLETED'
      `);

    const pendingDepositsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE transaction_type = 'DEPOSIT'
        AND status IN (
          'PENDING',
          'PROCESSING'
        )
      `);

    const pendingWithdrawalsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE transaction_type = 'WITHDRAWAL'
        AND status IN (
          'PENDING',
          'PROCESSING'
        )
      `);

    const kycResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM identity_documents
        WHERE status = 'PENDING'
      `);

    const balanceResult =
      await pool.query(`
        SELECT
          COALESCE(
            SUM(balance),
            0
          ) AS total
        FROM accounts
      `);

    const plansResult =
      await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM investment_plans
        WHERE status = 'ACTIVE'
      `);

    return res.status(200).json({
      message:
        'Admin dashboard loaded successfully.',

      dashboard: {
        totalUsers:
          usersResult.rows[0].total,

        activeUsers:
          activeUsersResult.rows[0].total,

        totalAccounts:
          accountsResult.rows[0].total,

        totalTransactions:
          transactionsResult.rows[0].total,

        pendingTransactions:
          pendingTransactionsResult.rows[0].total,

        completedDeposits:
          safeNumber(
            depositsResult.rows[0].total
          ),

        completedWithdrawals:
          safeNumber(
            withdrawalsResult.rows[0].total
          ),

        pendingDeposits:
          pendingDepositsResult.rows[0].total,

        pendingWithdrawals:
          pendingWithdrawalsResult.rows[0].total,

        pendingKyc:
          kycResult.rows[0].total,

        totalAccountBalance:
          safeNumber(
            balanceResult.rows[0].total
          ),

        activeInvestmentPlans:
          plansResult.rows[0].total,
      },
    });

  } catch (error) {
    logger.error(
      'Admin dashboard error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET USERS
// ============================================================

const getUsers = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.username,
          u.phone,
          u.country,
          u.preferred_currency,
          u.referral_code,
          u.role,
          u.status,
          u.email_verified,
          u.identity_verification_status,
          u.created_at,

          a.id AS account_id,
          a.account_number,
          a.account_type,
          a.currency AS account_currency,
          a.balance,
          a.available_balance

        FROM users u

        LEFT JOIN accounts a
          ON a.user_id = u.id

        ORDER BY
          u.created_at DESC
      `);

    const users =
      result.rows.map(
        (user) => ({
          id:
            user.id,

          email:
            user.email,

          firstName:
            user.first_name,

          lastName:
            user.last_name,

          username:
            user.username || '',

          phone:
            user.phone || '',

          country:
            user.country || '',

          preferredCurrency:
            user.preferred_currency || 'USD',

          referralCode:
            user.referral_code || '',

          role:
            user.role,

          status:
            user.status,

          emailVerified:
            Boolean(
              user.email_verified
            ),

          identityVerificationStatus:
            user.identity_verification_status,

          createdAt:
            user.created_at,

          account:
            user.account_id
              ? {
                  id:
                    user.account_id,

                  accountNumber:
                    user.account_number,

                  accountType:
                    user.account_type,

                  currency:
                    user.account_currency,

                  balance:
                    safeNumber(
                      user.balance
                    ),

                  availableBalance:
                    safeNumber(
                      user.available_balance
                    ),
                }
              : null,
        })
      );

    return res.status(200).json({
      users,

      count:
        users.length,
    });

  } catch (error) {
    logger.error(
      'Admin users error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET SINGLE USER
// ============================================================

const getUser = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      Number(req.params.id);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.username,
          u.phone,
          u.country,
          u.preferred_currency,
          u.referral_code,
          u.referrer_code,
          u.role,
          u.status,
          u.email_verified,
          u.identity_verification_status,
          u.created_at,

          a.id AS account_id,
          a.account_number,
          a.account_type,
          a.account_name,
          a.currency AS account_currency,
          a.balance,
          a.deposit,
          a.profits,
          a.available_balance,
          a.bonus,
          a.referrer_bonus,
          a.buying_power,
          a.margin_available,
          a.status AS account_status

        FROM users u

        LEFT JOIN accounts a
          ON a.user_id = u.id

        WHERE u.id = $1

        LIMIT 1
        `,
        [userId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User not found.',
      });
    }

    const user =
      result.rows[0];

    return res.status(200).json({
      user: {
        id:
          user.id,

        email:
          user.email,

        firstName:
          user.first_name,

        lastName:
          user.last_name,

        username:
          user.username || '',

        phone:
          user.phone || '',

        country:
          user.country || '',

        preferredCurrency:
          user.preferred_currency || 'USD',

        referralCode:
          user.referral_code || '',

        referrerCode:
          user.referrer_code || '',

        role:
          user.role,

        status:
          user.status,

        emailVerified:
          Boolean(
            user.email_verified
          ),

        identityVerificationStatus:
          user.identity_verification_status,

        createdAt:
          user.created_at,

        account:
          user.account_id
            ? {
                id:
                  user.account_id,

                accountNumber:
                  user.account_number,

                accountType:
                  user.account_type,

                accountName:
                  user.account_name,

                currency:
                  user.account_currency,

                balance:
                  safeNumber(
                    user.balance
                  ),

                deposit:
                  safeNumber(
                    user.deposit
                  ),

                profits:
                  safeNumber(
                    user.profits
                  ),

                availableBalance:
                  safeNumber(
                    user.available_balance
                  ),

                bonus:
                  safeNumber(
                    user.bonus
                  ),

                referrerBonus:
                  safeNumber(
                    user.referrer_bonus
                  ),

                buyingPower:
                  safeNumber(
                    user.buying_power
                  ),

                marginAvailable:
                  safeNumber(
                    user.margin_available
                  ),

                status:
                  user.account_status,
              }
            : null,
      },
    });

  } catch (error) {
    logger.error(
      'Admin get user error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET TRANSACTIONS
// ============================================================

const getTransactions = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.amount,
          t.currency,
          t.payment_method,
          t.status,
          t.description,
          t.proof_of_payment_url,
          t.verified_by,
          t.verified_at,
          t.admin_note,
          t.created_at,
          t.updated_at,

          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        INNER JOIN users u
          ON u.id = a.user_id

        ORDER BY
          t.created_at DESC
      `);

    const transactions =
      result.rows.map(
        (transaction) => ({
          id:
            transaction.id,

          accountId:
            transaction.account_id,

          transactionReference:
            transaction.transaction_reference,

          transactionType:
            transaction.transaction_type,

          amount:
            safeNumber(
              transaction.amount
            ),

          currency:
            transaction.currency,

          paymentMethod:
            transaction.payment_method || '',

          status:
            transaction.status,

          description:
            transaction.description || '',

          proofOfPaymentUrl:
            transaction.proof_of_payment_url || '',

          verifiedBy:
            transaction.verified_by,

          verifiedAt:
            transaction.verified_at,

          adminNote:
            transaction.admin_note || '',

          createdAt:
            transaction.created_at,

          updatedAt:
            transaction.updated_at,

          user: {
            id:
              transaction.user_id,

            firstName:
              transaction.first_name,

            lastName:
              transaction.last_name,

            email:
              transaction.email,

            username:
              transaction.username || '',
          },
        })
      );

    return res.status(200).json({
      transactions,

      count:
        transactions.length,
    });

  } catch (error) {
    logger.error(
      'Admin transactions error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET DEPOSITS
// ============================================================

const getDeposits = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.amount,
          t.currency,
          t.payment_method,
          t.status,
          t.description,
          t.proof_of_payment_url,
          t.admin_note,
          t.created_at,

          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        INNER JOIN users u
          ON u.id = a.user_id

        WHERE
          t.transaction_type = 'DEPOSIT'

        ORDER BY
          t.created_at DESC
      `);

    return res.status(200).json({
      deposits:
        result.rows.map(
          (row) => ({
            id:
              row.id,

            accountId:
              row.account_id,

            transactionReference:
              row.transaction_reference,

            amount:
              safeNumber(
                row.amount
              ),

            currency:
              row.currency,

            paymentMethod:
              row.payment_method || '',

            status:
              row.status,

            description:
              row.description || '',

            proofOfPaymentUrl:
              row.proof_of_payment_url || '',

            adminNote:
              row.admin_note || '',

            createdAt:
              row.created_at,

            user: {
              id:
                row.user_id,

              firstName:
                row.first_name,

              lastName:
                row.last_name,

              email:
                row.email,

              username:
                row.username || '',
            },
          })
        ),
    });

  } catch (error) {
    logger.error(
      'Admin deposits error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET WITHDRAWALS
// ============================================================

const getWithdrawals = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.amount,
          t.currency,
          t.payment_method,
          t.status,
          t.description,
          t.admin_note,
          t.created_at,

          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        INNER JOIN users u
          ON u.id = a.user_id

        WHERE
          t.transaction_type = 'WITHDRAWAL'

        ORDER BY
          t.created_at DESC
      `);

    return res.status(200).json({
      withdrawals:
        result.rows.map(
          (row) => ({
            id:
              row.id,

            accountId:
              row.account_id,

            transactionReference:
              row.transaction_reference,

            amount:
              safeNumber(
                row.amount
              ),

            currency:
              row.currency,

            paymentMethod:
              row.payment_method || '',

            status:
              row.status,

            description:
              row.description || '',

            adminNote:
              row.admin_note || '',

            createdAt:
              row.created_at,

            user: {
              id:
                row.user_id,

              firstName:
                row.first_name,

              lastName:
                row.last_name,

              email:
                row.email,

              username:
                row.username || '',
            },
          })
        ),
    });

  } catch (error) {
    logger.error(
      'Admin withdrawals error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET KYC REQUESTS
// ============================================================

const getKycRequests = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          d.id,
          d.user_id,
          d.document_type,
          d.document_number,
          d.document_url,
          d.status,
          d.reviewed_by,
          d.reviewed_at,
          d.rejection_reason,
          d.created_at,
          d.updated_at,

          u.first_name,
          u.last_name,
          u.email,
          u.username,
          u.country

        FROM identity_documents d

        INNER JOIN users u
          ON u.id = d.user_id

        ORDER BY
          d.created_at DESC
      `);

    return res.status(200).json({
      requests:
        result.rows.map(
          (row) => ({
            id:
              row.id,

            userId:
              row.user_id,

            documentType:
              row.document_type,

            documentNumber:
              row.document_number || '',

            documentUrl:
              row.document_url,

            status:
              row.status,

            reviewedBy:
              row.reviewed_by,

            reviewedAt:
              row.reviewed_at,

            rejectionReason:
              row.rejection_reason || '',

            createdAt:
              row.created_at,

            updatedAt:
              row.updated_at,

            user: {
              firstName:
                row.first_name,

              lastName:
                row.last_name,

              email:
                row.email,

              username:
                row.username || '',

              country:
                row.country || '',
            },
          })
        ),
    });

  } catch (error) {
    logger.error(
      'Admin KYC error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPDATE USER STATUS
// ============================================================

const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      Number(req.params.id);

    const normalizedStatus =
      normalizeUserStatus(
        req.body?.status
      );

    const allowedStatuses = [
      'active',
      'blocked',
      'suspended',
      'disabled',
    ];

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid user status.',
        allowedStatuses,
      });
    }

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          email,
          status
        `,
        [
          normalizedStatus,
          userId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User not found.',
      });
    }

    logger.info(
      `Admin ${req.user.id} changed user ${userId} status to ${normalizedStatus}`
    );

    return res.status(200).json({
      message:
        'User status updated successfully.',

      user:
        result.rows[0],
    });

  } catch (error) {
    logger.error(
      'Admin update user status error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPDATE TRANSACTION STATUS
// ============================================================

const updateTransactionStatus = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const transactionId =
      Number(req.params.id);

    const {
      status,
      adminNote,
    } = req.body || {};

    const allowedStatuses = [
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];

    const normalizedStatus =
      normalizeStatus(status);

    if (
      !isPositiveInteger(
        transactionId
      )
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Invalid transaction ID.',
      });
    }

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Invalid transaction status.',
        allowedStatuses,
      });
    }

    await client.query('BEGIN');

    // --------------------------------------------------------
    // LOCK TRANSACTION
    // --------------------------------------------------------

    const transactionResult =
      await client.query(
        `
        SELECT
          id,
          account_id,
          transaction_type,
          amount,
          status
        FROM transactions
        WHERE id = $1
        FOR UPDATE
        `,
        [transactionId]
      );

    if (
      transactionResult.rows.length === 0
    ) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'Transaction not found.',
      });
    }

    const transaction =
      transactionResult.rows[0];

    const previousStatus =
      normalizeStatus(
        transaction.status
      );

    const transactionType =
      normalizeStatus(
        transaction.transaction_type
      );

    const amount =
      safeNumber(
        transaction.amount
      );

    // --------------------------------------------------------
    // PREVENT CHANGING COMPLETED TRANSACTIONS
    // --------------------------------------------------------

    if (
      previousStatus === 'COMPLETED' &&
      normalizedStatus !== 'COMPLETED'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'A completed transaction cannot be changed to another status.',
      });
    }

    // --------------------------------------------------------
    // NO-OP
    // --------------------------------------------------------

    if (
      previousStatus === normalizedStatus
    ) {
      const unchangedResult =
        await client.query(
          `
          UPDATE transactions
          SET
            admin_note =
              COALESCE(
                $1,
                admin_note
              ),
            updated_at =
              CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING
            id,
            account_id,
            transaction_type,
            amount,
            currency,
            status,
            admin_note,
            verified_by,
            verified_at
          `,
          [
            adminNote
              ? String(adminNote).trim()
              : null,

            transactionId,
          ]
        );

      await client.query('COMMIT');

      return res.status(200).json({
        message:
          'Transaction already has this status.',

        transaction:
          unchangedResult.rows[0],
      });
    }

    // --------------------------------------------------------
    // ACCOUNT LOCK
    // --------------------------------------------------------

    let account = null;

    if (
      normalizedStatus === 'COMPLETED' &&
      (
        transactionType === 'DEPOSIT' ||
        transactionType === 'WITHDRAWAL'
      )
    ) {
      const accountResult =
        await client.query(
          `
          SELECT
            id,
            balance,
            deposit,
            available_balance,
            buying_power,
            margin_available
          FROM accounts
          WHERE id = $1
          FOR UPDATE
          `,
          [transaction.account_id]
        );

      if (
        accountResult.rows.length === 0
      ) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          message:
            'Account associated with this transaction was not found.',
        });
      }

      account =
        accountResult.rows[0];
    }

    // --------------------------------------------------------
    // VALIDATE AMOUNT
    // --------------------------------------------------------

    if (
      normalizedStatus === 'COMPLETED' &&
      (
        !Number.isFinite(amount) ||
        amount <= 0
      )
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Transaction amount must be greater than zero.',
      });
    }

    // --------------------------------------------------------
    // WITHDRAWAL BALANCE CHECK
    // --------------------------------------------------------

    if (
      normalizedStatus === 'COMPLETED' &&
      transactionType === 'WITHDRAWAL'
    ) {
      const currentBalance =
        safeNumber(
          account.balance
        );

      const currentAvailable =
        safeNumber(
          account.available_balance
        );

      if (
        currentBalance < amount ||
        currentAvailable < amount
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'Insufficient account balance to complete this withdrawal.',

          availableBalance:
            currentAvailable,

          requestedAmount:
            amount,
        });
      }
    }

    // --------------------------------------------------------
    // UPDATE TRANSACTION
    // --------------------------------------------------------

    const updatedResult =
      await client.query(
        `
        UPDATE transactions
        SET
          status = $1,

          admin_note =
            COALESCE(
              $2,
              admin_note
            ),

          verified_by =
            CASE
              WHEN $1 = 'COMPLETED'
              THEN $3
              ELSE verified_by
            END,

          verified_at =
            CASE
              WHEN $1 = 'COMPLETED'
              THEN CURRENT_TIMESTAMP
              ELSE verified_at
            END,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $4

        RETURNING
          id,
          account_id,
          transaction_type,
          amount,
          currency,
          status,
          admin_note,
          verified_by,
          verified_at,
          updated_at
        `,
        [
          normalizedStatus,

          adminNote
            ? String(adminNote).trim()
            : null,

          req.user.id,

          transactionId,
        ]
      );

    // --------------------------------------------------------
    // COMPLETE DEPOSIT
    // --------------------------------------------------------

    if (
      normalizedStatus === 'COMPLETED' &&
      previousStatus !== 'COMPLETED' &&
      transactionType === 'DEPOSIT'
    ) {
      await client.query(
        `
        UPDATE accounts
        SET
          balance =
            COALESCE(balance, 0) + $1,

          deposit =
            COALESCE(deposit, 0) + $1,

          available_balance =
            COALESCE(available_balance, 0) + $1,

          buying_power =
            COALESCE(buying_power, 0) + $1,

          margin_available =
            COALESCE(margin_available, 0) + $1,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2
        `,
        [
          amount,

          transaction.account_id,
        ]
      );
    }

    // --------------------------------------------------------
    // COMPLETE WITHDRAWAL
    // --------------------------------------------------------

    if (
      normalizedStatus === 'COMPLETED' &&
      previousStatus !== 'COMPLETED' &&
      transactionType === 'WITHDRAWAL'
    ) {
      await client.query(
        `
        UPDATE accounts
        SET
          balance =
            COALESCE(balance, 0) - $1,

          available_balance =
            COALESCE(available_balance, 0) - $1,

          buying_power =
            COALESCE(buying_power, 0) - $1,

          margin_available =
            COALESCE(margin_available, 0) - $1,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2
        `,
        [
          amount,

          transaction.account_id,
        ]
      );
    }

    await client.query('COMMIT');

    logger.info(
      `Admin ${req.user.id} changed transaction ${transactionId} from ${previousStatus} to ${normalizedStatus}`
    );

    return res.status(200).json({
      message:
        'Transaction status updated successfully.',

      transaction:
        updatedResult.rows[0],
    });

  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Transaction rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Admin transaction update error:',
      error
    );

    return next(error);

  } finally {
    client.release();
  }
};

// ============================================================
// INVESTMENT PLANS
// ============================================================

// ============================================================
// GET INVESTMENT PLANS
// ============================================================

const getInvestmentPlans = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await pool.query(`
        SELECT
          id,
          name,
          description,
          minimum_amount,
          maximum_amount,
          roi_percent,
          duration_days,
          status,
          created_at,
          updated_at
        FROM investment_plans
        ORDER BY created_at DESC
      `);

    const plans =
      result.rows.map(
        (plan) => ({
          id:
            plan.id,

          name:
            plan.name,

          description:
            plan.description || '',

          minimumAmount:
            safeNumber(
              plan.minimum_amount
            ),

          maximumAmount:
            plan.maximum_amount === null
              ? null
              : safeNumber(
                  plan.maximum_amount
                ),

          roiPercent:
            safeNumber(
              plan.roi_percent
            ),

          durationDays:
            Number(
              plan.duration_days
            ),

          status:
            plan.status,

          createdAt:
            plan.created_at,

          updatedAt:
            plan.updated_at,
        })
      );

    return res.status(200).json({
      plans,

      count:
        plans.length,
    });

  } catch (error) {
    logger.error(
      'Admin investment plans error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// CREATE INVESTMENT PLAN
// ============================================================

const createInvestmentPlan = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description,
      minimumAmount,
      maximumAmount,
      roiPercent,
      durationDays,
      status,
    } = req.body || {};

    const planName =
      String(name || '').trim();

    if (!planName) {
      return res.status(400).json({
        message:
          'Investment plan name is required.',
      });
    }

    if (planName.length > 150) {
      return res.status(400).json({
        message:
          'Investment plan name is too long.',
      });
    }

    const minimum =
      Number(minimumAmount);

    const maximum =
      maximumAmount === '' ||
      maximumAmount === null ||
      maximumAmount === undefined
        ? null
        : Number(maximumAmount);

    const roi =
      Number(roiPercent);

    const duration =
      Number(durationDays);

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      return res.status(400).json({
        message:
          'Minimum investment amount is invalid.',
      });
    }

    if (
      maximum !== null &&
      (
        !Number.isFinite(maximum) ||
        maximum < minimum
      )
    ) {
      return res.status(400).json({
        message:
          'Maximum investment must be greater than or equal to minimum investment.',
      });
    }

    if (
      !Number.isFinite(roi) ||
      roi < 0
    ) {
      return res.status(400).json({
        message:
          'ROI percentage is invalid.',
      });
    }

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    const planStatus =
      normalizeStatus(
        status || 'ACTIVE'
      );

    if (
      planStatus !== 'ACTIVE' &&
      planStatus !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Plan status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        INSERT INTO investment_plans (
          name,
          description,
          minimum_amount,
          maximum_amount,
          roi_percent,
          duration_days,
          status,
          created_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING
          id,
          name,
          description,
          minimum_amount,
          maximum_amount,
          roi_percent,
          duration_days,
          status,
          created_at,
          updated_at
        `,
        [
          planName,

          description
            ? String(description).trim()
            : null,

          minimum,

          maximum,

          roi,

          duration,

          planStatus,

          req.user.id,
        ]
      );

    const plan =
      result.rows[0];

    logger.info(
      `Admin ${req.user.id} created investment plan ${plan.id}`
    );

    return res.status(201).json({
      message:
        'Investment plan created successfully.',

      plan: {
        id:
          plan.id,

        name:
          plan.name,

        description:
          plan.description || '',

        minimumAmount:
          safeNumber(
            plan.minimum_amount
          ),

        maximumAmount:
          plan.maximum_amount === null
            ? null
            : safeNumber(
                plan.maximum_amount
              ),

        roiPercent:
          safeNumber(
            plan.roi_percent
          ),

        durationDays:
          Number(
            plan.duration_days
          ),

        status:
          plan.status,

        createdAt:
          plan.created_at,

        updatedAt:
          plan.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Admin create investment plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPDATE INVESTMENT PLAN
// ============================================================

const updateInvestmentPlan = async (
  req,
  res,
  next
) => {
  try {
    const planId =
      Number(req.params.id);

    if (!isPositiveInteger(planId)) {
      return res.status(400).json({
        message:
          'Invalid investment plan ID.',
      });
    }

    const {
      name,
      description,
      minimumAmount,
      maximumAmount,
      roiPercent,
      durationDays,
      status,
    } = req.body || {};

    const planName =
      String(name || '').trim();

    if (!planName) {
      return res.status(400).json({
        message:
          'Investment plan name is required.',
      });
    }

    const minimum =
      Number(minimumAmount);

    const maximum =
      maximumAmount === '' ||
      maximumAmount === null ||
      maximumAmount === undefined
        ? null
        : Number(maximumAmount);

    const roi =
      Number(roiPercent);

    const duration =
      Number(durationDays);

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      return res.status(400).json({
        message:
          'Minimum investment amount is invalid.',
      });
    }

    if (
      maximum !== null &&
      (
        !Number.isFinite(maximum) ||
        maximum < minimum
      )
    ) {
      return res.status(400).json({
        message:
          'Maximum investment must be greater than or equal to minimum investment.',
      });
    }

    if (
      !Number.isFinite(roi) ||
      roi < 0
    ) {
      return res.status(400).json({
        message:
          'ROI percentage is invalid.',
      });
    }

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    const planStatus =
      normalizeStatus(
        status || 'ACTIVE'
      );

    if (
      planStatus !== 'ACTIVE' &&
      planStatus !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Plan status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        UPDATE investment_plans

        SET
          name = $1,
          description = $2,
          minimum_amount = $3,
          maximum_amount = $4,
          roi_percent = $5,
          duration_days = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $8

        RETURNING
          id,
          name,
          description,
          minimum_amount,
          maximum_amount,
          roi_percent,
          duration_days,
          status,
          created_at,
          updated_at
        `,
        [
          planName,

          description
            ? String(description).trim()
            : null,

          minimum,

          maximum,

          roi,

          duration,

          planStatus,

          planId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Investment plan not found.',
      });
    }

    const plan =
      result.rows[0];

    logger.info(
      `Admin ${req.user.id} updated investment plan ${planId}`
    );

    return res.status(200).json({
      message:
        'Investment plan updated successfully.',

      plan: {
        id:
          plan.id,

        name:
          plan.name,

        description:
          plan.description || '',

        minimumAmount:
          safeNumber(
            plan.minimum_amount
          ),

        maximumAmount:
          plan.maximum_amount === null
            ? null
            : safeNumber(
                plan.maximum_amount
              ),

        roiPercent:
          safeNumber(
            plan.roi_percent
          ),

        durationDays:
          Number(
            plan.duration_days
          ),

        status:
          plan.status,

        createdAt:
          plan.created_at,

        updatedAt:
          plan.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Admin update investment plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// DELETE INVESTMENT PLAN
// ============================================================

const deleteInvestmentPlan = async (
  req,
  res,
  next
) => {
  try {
    const planId =
      Number(req.params.id);

    if (!isPositiveInteger(planId)) {
      return res.status(400).json({
        message:
          'Invalid investment plan ID.',
      });
    }

    const result =
      await pool.query(
        `
        DELETE FROM investment_plans

        WHERE id = $1

        RETURNING
          id,
          name
        `,
        [planId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Investment plan not found.',
      });
    }

    logger.info(
      `Admin ${req.user.id} deleted investment plan ${planId}`
    );

    return res.status(200).json({
      message:
        'Investment plan deleted successfully.',

      plan:
        result.rows[0],
    });

  } catch (error) {
    logger.error(
      'Admin delete investment plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// SIGNAL PLANS
// ============================================================

// ============================================================
// GET SIGNAL PLANS
// ============================================================

const getSignalPlans = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const result =
      await pool.query(`
        SELECT
          id,
          name,
          description,
          strength,
          accuracy_percent,
          duration_days,
          price,
          currency,
          status,
          created_by,
          created_at,
          updated_at
        FROM signal_plans
        ORDER BY created_at DESC
      `);

    const plans =
      result.rows.map(
        (plan) => ({
          id:
            plan.id,

          name:
            plan.name,

          description:
            plan.description || '',

          strength:
            getSignalStrength(
              plan.strength
            ),

          accuracyPercent:
            safeNumber(
              plan.accuracy_percent
            ),

          durationDays:
            Number(
              plan.duration_days || 30
            ),

          price:
            safeNumber(
              plan.price
            ),

          currency:
            plan.currency || 'USD',

          status:
            plan.status,

          createdBy:
            plan.created_by,

          createdAt:
            plan.created_at,

          updatedAt:
            plan.updated_at,
        })
      );

    return res.status(200).json({
      plans,

      count:
        plans.length,
    });

  } catch (error) {
    logger.error(
      'Admin signal plans error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// CREATE SIGNAL PLAN
// ============================================================

const createSignalPlan = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const {
      name,
      description,
      strength,
      accuracyPercent,
      durationDays,
      price,
      currency,
      status,
    } = req.body || {};

    const planName =
      String(name || '').trim();

    if (!planName) {
      return res.status(400).json({
        message:
          'Signal plan name is required.',
      });
    }

    if (planName.length > 150) {
      return res.status(400).json({
        message:
          'Signal plan name is too long.',
      });
    }

    const rawStrength =
      strength === undefined
        ? 50
        : Number(strength);

    if (
      !Number.isFinite(rawStrength) ||
      rawStrength < 0 ||
      rawStrength > 100
    ) {
      return res.status(400).json({
        message:
          'Signal strength must be between 0 and 100.',
      });
    }

    const signalStrength =
      getSignalStrength(
        rawStrength
      );

    const accuracy =
      accuracyPercent === undefined
        ? 0
        : Number(accuracyPercent);

    if (
      !Number.isFinite(accuracy) ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      return res.status(400).json({
        message:
          'Accuracy must be between 0 and 100.',
      });
    }

    const duration =
      durationDays === undefined
        ? 30
        : Number(durationDays);

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    const signalPrice =
      price === undefined ||
      price === '' ||
      price === null
        ? 0
        : Number(price);

    if (
      !Number.isFinite(signalPrice) ||
      signalPrice < 0
    ) {
      return res.status(400).json({
        message:
          'Signal price is invalid.',
      });
    }

    const signalCurrency =
      String(
        currency || 'USD'
      )
        .trim()
        .toUpperCase();

    const signalStatus =
      normalizeStatus(
        status || 'ACTIVE'
      );

    if (
      signalStatus !== 'ACTIVE' &&
      signalStatus !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Signal plan status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        INSERT INTO signal_plans (
          name,
          description,
          strength,
          accuracy_percent,
          duration_days,
          price,
          currency,
          status,
          created_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING
          id,
          name,
          description,
          strength,
          accuracy_percent,
          duration_days,
          price,
          currency,
          status,
          created_by,
          created_at,
          updated_at
        `,
        [
          planName,

          description
            ? String(description).trim()
            : null,

          signalStrength,

          accuracy,

          duration,

          signalPrice,

          signalCurrency,

          signalStatus,

          req.user.id,
        ]
      );

    const plan =
      result.rows[0];

    logger.info(
      `Admin ${req.user.id} created signal plan ${plan.id}`
    );

    return res.status(201).json({
      message:
        'Signal plan created successfully.',

      plan: {
        id:
          plan.id,

        name:
          plan.name,

        description:
          plan.description || '',

        strength:
          getSignalStrength(
            plan.strength
          ),

        accuracyPercent:
          safeNumber(
            plan.accuracy_percent
          ),

        durationDays:
          Number(
            plan.duration_days
          ),

        price:
          safeNumber(
            plan.price
          ),

        currency:
          plan.currency,

        status:
          plan.status,

        createdBy:
          plan.created_by,

        createdAt:
          plan.created_at,

        updatedAt:
          plan.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Admin create signal plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPDATE SIGNAL PLAN
// ============================================================

const updateSignalPlan = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const planId =
      Number(req.params.id);

    if (!isPositiveInteger(planId)) {
      return res.status(400).json({
        message:
          'Invalid signal plan ID.',
      });
    }

    const {
      name,
      description,
      strength,
      accuracyPercent,
      durationDays,
      price,
      currency,
      status,
    } = req.body || {};

    const planName =
      String(name || '').trim();

    if (!planName) {
      return res.status(400).json({
        message:
          'Signal plan name is required.',
      });
    }

    const rawStrength =
      Number(strength);

    if (
      !Number.isFinite(rawStrength) ||
      rawStrength < 0 ||
      rawStrength > 100
    ) {
      return res.status(400).json({
        message:
          'Signal strength must be between 0 and 100.',
      });
    }

    const accuracy =
      accuracyPercent === undefined
        ? 0
        : Number(accuracyPercent);

    if (
      !Number.isFinite(accuracy) ||
      accuracy < 0 ||
      accuracy > 100
    ) {
      return res.status(400).json({
        message:
          'Accuracy must be between 0 and 100.',
      });
    }

    const duration =
      durationDays === undefined
        ? 30
        : Number(durationDays);

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    const signalPrice =
      price === undefined ||
      price === '' ||
      price === null
        ? 0
        : Number(price);

    if (
      !Number.isFinite(signalPrice) ||
      signalPrice < 0
    ) {
      return res.status(400).json({
        message:
          'Signal price is invalid.',
      });
    }

    const signalCurrency =
      String(
        currency || 'USD'
      )
        .trim()
        .toUpperCase();

    const signalStatus =
      normalizeStatus(
        status || 'ACTIVE'
      );

    if (
      signalStatus !== 'ACTIVE' &&
      signalStatus !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Signal plan status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        UPDATE signal_plans

        SET
          name = $1,
          description = $2,
          strength = $3,
          accuracy_percent = $4,
          duration_days = $5,
          price = $6,
          currency = $7,
          status = $8,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $9

        RETURNING
          id,
          name,
          description,
          strength,
          accuracy_percent,
          duration_days,
          price,
          currency,
          status,
          created_by,
          created_at,
          updated_at
        `,
        [
          planName,

          description
            ? String(description).trim()
            : null,

          rawStrength,

          accuracy,

          duration,

          signalPrice,

          signalCurrency,

          signalStatus,

          planId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Signal plan not found.',
      });
    }

    const plan =
      result.rows[0];

    logger.info(
      `Admin ${req.user.id} updated signal plan ${planId}`
    );

    return res.status(200).json({
      message:
        'Signal plan updated successfully.',

      plan: {
        id:
          plan.id,

        name:
          plan.name,

        description:
          plan.description || '',

        strength:
          getSignalStrength(
            plan.strength
          ),

        accuracyPercent:
          safeNumber(
            plan.accuracy_percent
          ),

        durationDays:
          Number(
            plan.duration_days
          ),

        price:
          safeNumber(
            plan.price
          ),

        currency:
          plan.currency,

        status:
          plan.status,

        createdBy:
          plan.created_by,

        createdAt:
          plan.created_at,

        updatedAt:
          plan.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Admin update signal plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// DELETE SIGNAL PLAN
// ============================================================

const deleteSignalPlan = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const planId =
      Number(req.params.id);

    if (!isPositiveInteger(planId)) {
      return res.status(400).json({
        message:
          'Invalid signal plan ID.',
      });
    }

    const result =
      await pool.query(
        `
        DELETE FROM signal_plans

        WHERE id = $1

        RETURNING
          id,
          name
        `,
        [planId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Signal plan not found.',
      });
    }

    logger.info(
      `Admin ${req.user.id} deleted signal plan ${planId}`
    );

    return res.status(200).json({
      message:
        'Signal plan deleted successfully.',

      plan:
        result.rows[0],
    });

  } catch (error) {
    logger.error(
      'Admin delete signal plan error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET USER SIGNAL
// ============================================================

const getUserSignal = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const userId =
      Number(req.params.id);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          u.id AS user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.username,

          us.id AS user_signal_id,
          us.strength,
          us.status AS signal_status,
          us.note,
          us.updated_by,
          us.created_at AS signal_created_at,
          us.updated_at AS signal_updated_at,

          sp.id AS plan_id,
          sp.name AS plan_name,
          sp.description AS plan_description,
          sp.strength AS plan_strength,
          sp.accuracy_percent AS plan_accuracy,
          sp.duration_days AS plan_duration,
          sp.price AS plan_price,
          sp.currency AS plan_currency,
          sp.status AS plan_status

        FROM users u

        LEFT JOIN user_signals us
          ON us.user_id = u.id

        LEFT JOIN signal_plans sp
          ON sp.id = us.signal_plan_id

        WHERE u.id = $1

        LIMIT 1
        `,
        [userId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User not found.',
      });
    }

    const row =
      result.rows[0];

    return res.status(200).json({
      user: {
        id:
          row.user_id,

        email:
          row.email,

        firstName:
          row.first_name,

        lastName:
          row.last_name,

        username:
          row.username || '',
      },

      signal:
        row.user_signal_id
          ? {
              id:
                row.user_signal_id,

              strength:
                getSignalStrength(
                  row.strength
                ),

              status:
                row.signal_status || 'ACTIVE',

              enabled:
                String(
                  row.signal_status || 'ACTIVE'
                ).toUpperCase() === 'ACTIVE',

              note:
                row.note || '',

              updatedBy:
                row.updated_by,

              createdAt:
                row.signal_created_at,

              updatedAt:
                row.signal_updated_at,

              plan:
                row.plan_id
                  ? {
                      id:
                        row.plan_id,

                      name:
                        row.plan_name,

                      description:
                        row.plan_description || '',

                      strength:
                        getSignalStrength(
                          row.plan_strength
                        ),

                      accuracyPercent:
                        safeNumber(
                          row.plan_accuracy
                        ),

                      durationDays:
                        Number(
                          row.plan_duration || 30
                        ),

                      price:
                        safeNumber(
                          row.plan_price
                        ),

                      currency:
                        row.plan_currency || 'USD',

                      status:
                        row.plan_status,
                    }
                  : null,
            }
          : null,
    });

  } catch (error) {
    logger.error(
      'Admin get user signal error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// UPDATE USER SIGNAL
// ============================================================

const updateUserSignal = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const userId =
      Number(req.params.id);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    const {
      signalPlanId,
      strength,
      enabled,
      status,
      note,
    } = req.body || {};

    // --------------------------------------------------------
    // VERIFY USER
    // --------------------------------------------------------

    const userResult =
      await pool.query(
        `
        SELECT
          id,
          email,
          first_name,
          last_name,
          username
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
      );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message:
          'User not found.',
      });
    }

    // --------------------------------------------------------
    // SIGNAL PLAN
    // --------------------------------------------------------

    let planId = null;

    let planStrength = null;

    if (
      signalPlanId !== undefined &&
      signalPlanId !== null &&
      signalPlanId !== ''
    ) {
      planId =
        Number(signalPlanId);

      if (!isPositiveInteger(planId)) {
        return res.status(400).json({
          message:
            'Invalid signal plan ID.',
        });
      }

      const planResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            status,
            strength
          FROM signal_plans
          WHERE id = $1
          LIMIT 1
          `,
          [planId]
        );

      if (
        planResult.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'Signal plan not found.',
        });
      }

      const signalPlan =
        planResult.rows[0];

      if (
        normalizeStatus(
          signalPlan.status
        ) !== 'ACTIVE'
      ) {
        return res.status(400).json({
          message:
            'Cannot assign an inactive signal plan.',
        });
      }

      planStrength =
        getSignalStrength(
          signalPlan.strength
        );
    }

    // --------------------------------------------------------
    // SIGNAL STRENGTH
    // --------------------------------------------------------

    let signalStrength;

    if (strength === undefined) {
      signalStrength =
        planStrength !== null
          ? planStrength
          : 50;
    } else {
      const numericStrength =
        Number(strength);

      if (
        !Number.isFinite(
          numericStrength
        ) ||
        numericStrength < 0 ||
        numericStrength > 100
      ) {
        return res.status(400).json({
          message:
            'Signal strength must be between 0 and 100.',
        });
      }

      signalStrength =
        getSignalStrength(
          numericStrength
        );
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    let signalStatus;

    if (status !== undefined) {
      signalStatus =
        normalizeStatus(status);

      if (
        signalStatus !== 'ACTIVE' &&
        signalStatus !== 'INACTIVE'
      ) {
        return res.status(400).json({
          message:
            'Signal status must be ACTIVE or INACTIVE.',
        });
      }

    } else if (enabled !== undefined) {
      signalStatus =
        enabled === true ||
        String(enabled).toLowerCase() === 'true'
          ? 'ACTIVE'
          : 'INACTIVE';
    } else {
      signalStatus =
        'ACTIVE';
    }

    // --------------------------------------------------------
    // NOTE
    // --------------------------------------------------------

    const signalNote =
      note === undefined ||
      note === null
        ? null
        : String(note).trim();

    // --------------------------------------------------------
    // CREATE OR UPDATE
    // --------------------------------------------------------

    const result =
      await pool.query(
        `
        INSERT INTO user_signals (
          user_id,
          signal_plan_id,
          strength,
          status,
          note,
          updated_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )

        ON CONFLICT (user_id)

        DO UPDATE SET
          signal_plan_id =
            EXCLUDED.signal_plan_id,

          strength =
            EXCLUDED.strength,

          status =
            EXCLUDED.status,

          note =
            EXCLUDED.note,

          updated_by =
            EXCLUDED.updated_by,

          updated_at =
            CURRENT_TIMESTAMP

        RETURNING
          id,
          user_id,
          signal_plan_id,
          strength,
          status,
          note,
          updated_by,
          created_at,
          updated_at
        `,
        [
          userId,

          planId,

          signalStrength,

          signalStatus,

          signalNote,

          req.user.id,
        ]
      );

    const signal =
      result.rows[0];

    logger.info(
      `Admin ${req.user.id} updated signal for user ${userId}: strength=${signalStrength}, plan=${planId}, status=${signalStatus}`
    );

    return res.status(200).json({
      message:
        'User signal updated successfully.',

      signal: {
        id:
          signal.id,

        userId:
          signal.user_id,

        signalPlanId:
          signal.signal_plan_id,

        strength:
          getSignalStrength(
            signal.strength
          ),

        status:
          signal.status,

        enabled:
          normalizeStatus(
            signal.status
          ) === 'ACTIVE',

        note:
          signal.note || '',

        updatedBy:
          signal.updated_by,

        createdAt:
          signal.created_at,

        updatedAt:
          signal.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Admin update user signal error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Authentication
  adminLogin,

  // Dashboard
  getDashboard,

  // Users
  getUsers,
  getUser,
  updateUserStatus,

  // Transactions
  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  // KYC
  getKycRequests,

  // Investment plans
  getInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,

  // Signal plans
  getSignalPlans,
  createSignalPlan,
  updateSignalPlan,
  deleteSignalPlan,

  // User signal
  getUserSignal,
  updateUserSignal,
};
