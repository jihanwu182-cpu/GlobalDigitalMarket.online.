const crypto = require('crypto');

const pool = require('../config/database');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

const {
  generateAccessToken,
} = require('../utils/jwt');

const {
  hashPassword,
  comparePassword,
} = require('../utils/bcrypt');

// ============================================================
// HELPERS
// ============================================================

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
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

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

const getSignalStrength = (value) => {
  const strength = Number(value);

  if (!Number.isFinite(strength)) {
    return 0;
  }

  return Math.max(0, Math.min(100, strength));
};

// ============================================================
// FINANCIAL CATEGORIES
// ============================================================

const normalizeFinancialCategory = (value) => {
  const category = cleanString(value)
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  const aliases = {
    DEPOSIT: 'DEPOSIT',
    DEPOSITS: 'DEPOSIT',

    PROFIT: 'PROFIT',
    PROFITS: 'PROFIT',

    BONUS: 'BONUS',

    REFERRAL: 'REFERRAL_BONUS',
    REFERRAL_BONUS: 'REFERRAL_BONUS',
    REFERRER_BONUS: 'REFERRAL_BONUS',
  };

  return aliases[category] || '';
};

const FINANCIAL_CATEGORIES = [
  'DEPOSIT',
  'PROFIT',
  'BONUS',
  'REFERRAL_BONUS',
];

const getAccountCategoryColumn = (category) => {
  switch (category) {
    case 'DEPOSIT':
      return 'deposit';

    case 'PROFIT':
      return 'profits';

    case 'BONUS':
      return 'bonus';

    case 'REFERRAL_BONUS':
      return 'referrer_bonus';

    default:
      return null;
  }
};

// ============================================================
// ADMIN LOGIN
// ============================================================

const adminLogin = async (req, res, next) => {
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

    const normalizedEmail = cleanString(email).toLowerCase();

    const result = await pool.query(
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

    const admin = result.rows[0];

    const passwordMatches = await comparePassword(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          'Invalid administrator email or password.',
      });
    }

    const role = cleanString(admin.role).toLowerCase();

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

    const status = cleanString(admin.status).toLowerCase();

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

    const accessToken = generateAccessToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    logger.info(
      `Successful admin login for email: ${normalizedEmail}`
    );

    return res.status(200).json({
      message:
        'Administrator login successful.',

      token: accessToken,

      accessToken,

      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        username: admin.username || '',
        phone: admin.phone || '',
        role: admin.role,
        status: admin.status,
      },
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

const getDashboard = async (req, res, next) => {
  try {
    const [
      usersResult,
      activeUsersResult,
      accountsResult,
      transactionsResult,
      pendingTransactionsResult,
      depositsResult,
      withdrawalsResult,
      pendingDepositsResult,
      pendingWithdrawalsResult,
      kycResult,
      balanceResult,
      plansResult,
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE LOWER(status) = 'active'
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM accounts
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE status IN ('PENDING', 'PROCESSING')
      `),

      pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE transaction_type = 'DEPOSIT'
        AND status = 'COMPLETED'
      `),

      pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE transaction_type = 'WITHDRAWAL'
        AND status = 'COMPLETED'
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE transaction_type = 'DEPOSIT'
        AND status IN ('PENDING', 'PROCESSING')
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM transactions
        WHERE transaction_type = 'WITHDRAWAL'
        AND status IN ('PENDING', 'PROCESSING')
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM identity_documents
        WHERE status = 'PENDING'
      `),

      pool.query(`
        SELECT COALESCE(SUM(balance), 0) AS total
        FROM accounts
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM investment_plans
        WHERE status = 'ACTIVE'
      `),
    ]);

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

const getUsers = async (req, res, next) => {
  try {
    const result = await pool.query(`
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

      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map((user) => ({
      id: user.id,

      email: user.email,

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
        Boolean(user.email_verified),

      identityVerificationStatus:
        user.identity_verification_status,

      createdAt:
        user.created_at,

      account: user.account_id
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
              safeNumber(user.balance),

            availableBalance:
              safeNumber(
                user.available_balance
              ),
          }
        : null,
    }));

    return res.status(200).json({
      users,
      count: users.length,
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

const getUser = async (req, res, next) => {
  try {
    const userId =
      Number(req.params.id);

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    const result = await pool.query(
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

    const user = result.rows[0];

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
          Boolean(user.email_verified),

        identityVerificationStatus:
          user.identity_verification_status,

        createdAt:
          user.created_at,

        account: user.account_id
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
                safeNumber(user.balance),

              deposit:
                safeNumber(user.deposit),

              profits:
                safeNumber(user.profits),

              availableBalance:
                safeNumber(
                  user.available_balance
                ),

              bonus:
                safeNumber(user.bonus),

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

    const status =
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

    if (!allowedStatuses.includes(status)) {
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
        [status, userId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User not found.',
      });
    }

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
// FUND / CREDIT USER ACCOUNT
// ============================================================

const fundUserAccount = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const userId =
      Number(req.params.id);

    const amount =
      Number(req.body?.amount);

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const category =
      normalizeFinancialCategory(
        req.body?.category ||
        req.body?.type ||
        req.body?.fundingType
      );

    const description =
      cleanString(
        req.body?.description
      ) ||
      'Account credited by administrator.';

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message:
          'Credit amount must be greater than zero.',
      });
    }

    if (!FINANCIAL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message:
          'A valid credit category is required.',
        allowedCategories:
          FINANCIAL_CATEGORIES,
      });
    }

    const accountColumn =
      getAccountCategoryColumn(category);

    if (!accountColumn) {
      return res.status(400).json({
        message:
          'Invalid account credit category.',
      });
    }

    await client.query('BEGIN');
    
    const accountResult =
      await client.query(
        `
        SELECT
          u.id AS user_id,
          u.email,
          u.first_name,
          u.last_name,

          a.id AS account_id,
          a.account_number,
          a.account_type,
          a.account_name,
          a.currency,
          a.balance,
          a.deposit,
          a.profits,
          a.available_balance,
          a.bonus,
          a.referrer_bonus,
          a.buying_power,
          a.margin_available,
          a.status

        FROM users u

        INNER JOIN accounts a
          ON a.user_id = u.id

        WHERE u.id = $1

        LIMIT 1

        FOR UPDATE OF a
        `,
        [userId]
      );

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const account =
      accountResult.rows[0];

    const accountCurrency =
      cleanString(
        account.currency || 'USD'
      ).toUpperCase();

    if (accountCurrency !== currency) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          `Account currency is ${accountCurrency}. Credit currency must match the account currency.`,

        accountCurrency,

        requestedCurrency:
          currency,
      });
    }

    const reference =
      `ADMIN-CREDIT-${Date.now()}-${userId}-${crypto.randomInt(
        10000,
        99999
      )}`;

    const transactionResult =
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
          verified_by,
          verified_at,
          admin_note
        )

        VALUES (
          $1,
          $2,
          'DEPOSIT',
          $3,
          $4,
          $5,
          'COMPLETED',
          $6,
          $7,
          CURRENT_TIMESTAMP,
          $6
        )

        RETURNING *
        `,
        [
          account.account_id,
          reference,
          amount,
          currency,
          `ADMIN_CREDIT_${category}`,
          description,
          req.user.id,
        ]
      );

    const updatedAccountResult =
      await client.query(
        `
        UPDATE accounts

        SET
          balance =
            COALESCE(balance, 0) + $1,

          ${accountColumn} =
            COALESCE(${accountColumn}, 0) + $1,

          available_balance =
            COALESCE(available_balance, 0) + $1,

          buying_power =
            COALESCE(buying_power, 0) + $1,

          margin_available =
            COALESCE(margin_available, 0) + $1,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
        `,
        [
          amount,
          account.account_id,
        ]
      );

    await client.query('COMMIT');

    const transaction =
      transactionResult.rows[0];

    const updatedAccount =
      updatedAccountResult.rows[0];

    logger.info(
      `Admin ${req.user.id} credited user ${userId} ${amount} ${currency} as ${category}`
    );

    return res.status(200).json({
      message:
        'User account credited successfully.',

      credit: {
        userId,

        accountId:
          account.account_id,

        accountNumber:
          account.account_number,

        amount,

        currency,

        category,

        accountField:
          accountColumn,

        transactionReference:
          transaction.transaction_reference,

        status:
          'COMPLETED',
      },

      transaction,

      account: {
        id:
          updatedAccount.id,

        accountNumber:
          updatedAccount.account_number,

        accountType:
          updatedAccount.account_type,

        accountName:
          updatedAccount.account_name,

        currency:
          updatedAccount.currency,

        balance:
          safeNumber(
            updatedAccount.balance
          ),

        deposit:
          safeNumber(
            updatedAccount.deposit
          ),

        profits:
          safeNumber(
            updatedAccount.profits
          ),

        availableBalance:
          safeNumber(
            updatedAccount.available_balance
          ),

        bonus:
          safeNumber(
            updatedAccount.bonus
          ),

        referrerBonus:
          safeNumber(
            updatedAccount.referrer_bonus
          ),

        buyingPower:
          safeNumber(
            updatedAccount.buying_power
          ),

        marginAvailable:
          safeNumber(
            updatedAccount.margin_available
          ),

        status:
          updatedAccount.status,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Credit rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Admin credit account error:',
      error
    );

    return next(error);
  } finally {
    client.release();
  }
};

// ============================================================
// DEBIT USER ACCOUNT
// ONLY PROFIT CAN BE DEBITED
// ============================================================

const debitUserAccount = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const userId =
      Number(req.params.id);

    const amount =
      Number(req.body?.amount);

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const category =
      normalizeFinancialCategory(
        req.body?.category ||
        req.body?.type ||
        req.body?.fundingType
      );

    const description =
      cleanString(
        req.body?.description
      ) ||
      'Account debited by administrator.';

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message:
          'Invalid user ID.',
      });
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message:
          'Debit amount must be greater than zero.',
      });
    }

    // ========================================================
    // CRITICAL RULE:
    // ADMIN DEBIT CAN ONLY REMOVE PROFIT
    // ========================================================

    if (category !== 'PROFIT') {
      return res.status(403).json({
        message:
          'Admin Debit is only allowed for Profit. Deposit, Bonus and Referral Bonus cannot be debited.',

        category,

        allowedDebitCategories: [
          'PROFIT',
        ],
      });
    }

    await client.query('BEGIN');

    const accountResult =
      await client.query(
        `
        SELECT
          u.id AS user_id,
          u.email,
          u.first_name,
          u.last_name,

          a.id AS account_id,
          a.account_number,
          a.account_type,
          a.account_name,
          a.currency,
          a.balance,
          a.deposit,
          a.profits,
          a.bonus,
          a.referrer_bonus,
          a.available_balance,
          a.buying_power,
          a.margin_available,
          a.status

        FROM users u

        INNER JOIN accounts a
          ON a.user_id = u.id

        WHERE u.id = $1

        LIMIT 1

        FOR UPDATE OF a
        `,
        [userId]
      );

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const account =
      accountResult.rows[0];

    const accountCurrency =
      cleanString(
        account.currency || 'USD'
      ).toUpperCase();

    if (accountCurrency !== currency) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          `Account currency is ${accountCurrency}. Debit currency must match the account currency.`,

        accountCurrency,

        requestedCurrency:
          currency,
      });
    }

    const profitBalance =
      safeNumber(account.profits);

    const currentBalance =
      safeNumber(account.balance);

    const availableBalance =
      safeNumber(account.available_balance);

    if (profitBalance < amount) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Insufficient profit balance.',

        category:
          'PROFIT',

        profitBalance,

        requestedAmount:
          amount,
      });
    }

    if (currentBalance < amount) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Insufficient account balance.',

        balance:
          currentBalance,

        requestedAmount:
          amount,
      });
    }

    if (availableBalance < amount) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Insufficient available account balance.',

        availableBalance,

        requestedAmount:
          amount,
      });
    }

    const reference =
      `ADMIN-DEBIT-${Date.now()}-${userId}-${crypto.randomInt(
        10000,
        99999
      )}`;

    const transactionResult =
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
          verified_by,
          verified_at,
          admin_note
        )

        VALUES (
          $1,
          $2,
          'WITHDRAWAL',
          $3,
          $4,
          'ADMIN_DEBIT_PROFIT',
          'COMPLETED',
          $5,
          $6,
          CURRENT_TIMESTAMP,
          $5
        )

        RETURNING *
        `,
        [
          account.account_id,
          reference,
          amount,
          currency,
          description,
          req.user.id,
        ]
      );

    const updatedAccountResult =
      await client.query(
        `
        UPDATE accounts

        SET
          balance =
            COALESCE(balance, 0) - $1,

          profits =
            COALESCE(profits, 0) - $1,

          available_balance =
            COALESCE(available_balance, 0) - $1,

          buying_power =
            COALESCE(buying_power, 0) - $1,

          margin_available =
            COALESCE(margin_available, 0) - $1,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
        `,
        [
          amount,
          account.account_id,
        ]
      );

    await client.query('COMMIT');

    const transaction =
      transactionResult.rows[0];

    const updatedAccount =
      updatedAccountResult.rows[0];

    logger.info(
      `Admin ${req.user.id} debited user ${userId} ${amount} ${currency} as PROFIT`
    );

    return res.status(200).json({
      message:
        'Profit debited successfully.',

      debit: {
        userId,

        accountId:
          account.account_id,

        accountNumber:
          account.account_number,

        amount,

        currency,

        category:
          'PROFIT',

        accountField:
          'profits',

        transactionReference:
          transaction.transaction_reference,

        status:
          'COMPLETED',
      },

      transaction,

      account: {
        id:
          updatedAccount.id,

        accountNumber:
          updatedAccount.account_number,

        accountType:
          updatedAccount.account_type,

        accountName:
          updatedAccount.account_name,

        currency:
          updatedAccount.currency,

        balance:
          safeNumber(
            updatedAccount.balance
          ),

        deposit:
          safeNumber(
            updatedAccount.deposit
          ),

        profits:
          safeNumber(
            updatedAccount.profits
          ),

        availableBalance:
          safeNumber(
            updatedAccount.available_balance
          ),

        bonus:
          safeNumber(
            updatedAccount.bonus
          ),

        referrerBonus:
          safeNumber(
            updatedAccount.referrer_bonus
          ),

        buyingPower:
          safeNumber(
            updatedAccount.buying_power
          ),

        marginAvailable:
          safeNumber(
            updatedAccount.margin_available
          ),

        status:
          updatedAccount.status,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Debit rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Admin debit account error:',
      error
    );

    return next(error);
  } finally {
    client.release();
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
          t.*,

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
      result.rows.map((row) => ({
        id:
          row.id,

        accountId:
          row.account_id,

        transactionReference:
          row.transaction_reference,

        transactionType:
          row.transaction_type,

        amount:
          safeNumber(row.amount),

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

        verifiedBy:
          row.verified_by,

        verifiedAt:
          row.verified_at,

        adminNote:
          row.admin_note || '',

        createdAt:
          row.created_at,

        updatedAt:
          row.updated_at,

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
      }));

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
          t.*,

          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username,

          a.account_number,
          a.currency AS account_currency

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
        result.rows.map((row) => ({
          id:
            row.id,

          accountId:
            row.account_id,

          accountNumber:
            row.account_number,

          transactionReference:
            row.transaction_reference,

          amount:
            safeNumber(row.amount),

          currency:
            row.currency,

          accountCurrency:
            row.account_currency,

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

          verifiedBy:
            row.verified_by,

          verifiedAt:
            row.verified_at,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,

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
        })),
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
// REJECT DEPOSIT
// ============================================================

const rejectDeposit = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const transactionId =
      Number(req.params.id);

    const reason =
      cleanString(
        req.body?.reason ||
        req.body?.adminNote
      );

    if (!isPositiveInteger(transactionId)) {
      return res.status(400).json({
        message:
          'Invalid deposit transaction ID.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message:
          'A reason is required when rejecting a deposit.',
      });
    }

    await client.query('BEGIN');

    const result =
      await client.query(
        `
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.amount,
          t.currency,
          t.status,
          t.proof_of_payment_url,

          a.user_id,
          a.account_number,

          u.email,
          u.first_name,
          u.last_name

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        INNER JOIN users u
          ON u.id = a.user_id

        WHERE t.id = $1

        FOR UPDATE OF t
        `,
        [transactionId]
      );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'Deposit transaction not found.',
      });
    }

    const transaction =
      result.rows[0];

    if (
      normalizeStatus(
        transaction.transaction_type
      ) !== 'DEPOSIT'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only deposit transactions can be rejected using this endpoint.',
      });
    }

    const currentStatus =
      normalizeStatus(
        transaction.status
      );

    if (
      currentStatus !== 'PENDING' &&
      currentStatus !== 'PROCESSING'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only pending or processing deposits can be rejected.',
      });
    }

    await client.query(
      `
      UPDATE transactions

      SET
        status = 'CANCELLED',

        admin_note = $1,

        verified_by = $2,

        verified_at = CURRENT_TIMESTAMP,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $3
      `,
      [
        `REJECTED: ${reason}`,
        req.user.id,
        transactionId,
      ]
    );

    await client.query('COMMIT');

    logger.info(
      `Admin ${req.user.id} rejected deposit ${transactionId}`
    );

    return res.status(200).json({
      message:
        'Deposit rejected successfully.',

      deposit: {
        id:
          transaction.id,

        transactionReference:
          transaction.transaction_reference,

        status:
          'CANCELLED',

        action:
          'REJECTED',

        amount:
          safeNumber(
            transaction.amount
          ),

        currency:
          transaction.currency,

        reason,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Deposit rejection rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Admin reject deposit error:',
      error
    );

    return next(error);
  } finally {
    client.release();
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
          t.*,

          u.id AS user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username,

          a.account_number

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
        result.rows.map((row) => ({
          id:
            row.id,

          accountId:
            row.account_id,

          accountNumber:
            row.account_number,

          transactionReference:
            row.transaction_reference,

          amount:
            safeNumber(row.amount),

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

          proofOfPaymentUrl:
            row.proof_of_payment_url || '',

          verifiedBy:
            row.verified_by,

          verifiedAt:
            row.verified_at,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,

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
        })),
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
// UPDATE TRANSACTION STATUS
// ============================================================

const updateTransactionStatus = async (
  req,
  res,
  next
) => {
  const client = await pool.connect();

  try {
    const transactionId = Number(
      req.params.id
    );

    const status = normalizeStatus(
      req.body?.status
    );

    const adminNote = cleanString(
      req.body?.adminNote ||
      req.body?.reason
    );

    const allowedStatuses = [
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];

    if (!isPositiveInteger(transactionId)) {
      return res.status(400).json({
        message:
          'Invalid transaction ID.',
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          'Invalid transaction status.',
        allowedStatuses,
      });
    }

    // --------------------------------------------------------
    // GET ADMIN ID
    // --------------------------------------------------------

    const rawAdminId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id ||
      null;

    const adminId =
      Number(rawAdminId);

    if (!isPositiveInteger(adminId)) {
      return res.status(401).json({
        message:
          'Administrator authentication information is missing or invalid.',
      });
    }

    await client.query('BEGIN');

    // --------------------------------------------------------
    // GET AND LOCK TRANSACTION + ACCOUNT
    // --------------------------------------------------------

    const transactionResult =
      await client.query(
        `
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.amount,
          t.currency,
          t.status,
          t.description,
          t.admin_note,
          t.verified_by,
          t.verified_at,

          a.id AS locked_account_id,
          a.balance,

           u.email,
         u.first_name,
          u.last_name,
          a.deposit,
          a.profits,
          a.available_balance,
          a.bonus,
          a.referrer_bonus,
          a.buying_power,
          a.margin_available

        FROM transactions t

      INNER JOIN accounts a
    ON a.id = t.account_id

      INNER JOIN users u
       ON u.id = a.user_id

     WHERE t.id = $1::INTEGER

        FOR UPDATE OF t, a
        `,
        [transactionId]
      );

    if (transactionResult.rows.length === 0) {
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
    // SAME STATUS
    // --------------------------------------------------------

    if (previousStatus === status) {
      const sameStatusResult =
        await client.query(
          `
          UPDATE transactions

          SET
            admin_note =
              CASE
                WHEN $1::TEXT <> ''
                THEN $1::TEXT
                ELSE admin_note
              END,

            updated_at =
              CURRENT_TIMESTAMP

          WHERE id = $2::INTEGER

          RETURNING *
          `,
          [
            adminNote,
            transactionId,
          ]
        );

      await client.query('COMMIT');

      return res.status(200).json({
        message:
          'Transaction already has this status.',

        transaction:
          sameStatusResult.rows[0],
      });
    }

    // --------------------------------------------------------
    // COMPLETED TRANSACTIONS CANNOT BE CHANGED
    // --------------------------------------------------------

    if (
      previousStatus === 'COMPLETED'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'A completed transaction cannot be changed to another status.',

        currentStatus:
          previousStatus,
      });
    }

    // --------------------------------------------------------
    // COMPLETE DEPOSIT
    // --------------------------------------------------------

    if (
      status === 'COMPLETED' &&
      transactionType === 'DEPOSIT'
    ) {
      if (
        previousStatus !== 'PENDING' &&
        previousStatus !== 'PROCESSING'
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'Only pending or processing deposits can be completed.',

          currentStatus:
            previousStatus,
        });
      }

      // Make sure the account still exists.
      const accountCheck =
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

          WHERE id = $1::INTEGER

          FOR UPDATE
          `,
          [transaction.account_id]
        );

      if (accountCheck.rows.length === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          message:
            'The account connected to this deposit was not found.',
        });
      }

      // ------------------------------------------------------
      // CREDIT MAIN ACCOUNT BALANCE
      // ------------------------------------------------------

      await client.query(
        `
        UPDATE accounts

        SET
          balance =
            COALESCE(balance, 0) + $1::NUMERIC,

          deposit =
            COALESCE(deposit, 0) + $1::NUMERIC,

          available_balance =
            COALESCE(available_balance, 0) + $1::NUMERIC,

          buying_power =
            COALESCE(buying_power, 0) + $1::NUMERIC,

          margin_available =
            COALESCE(margin_available, 0) + $1::NUMERIC,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2::INTEGER
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
      status === 'COMPLETED' &&
      transactionType === 'WITHDRAWAL'
    ) {
      if (
        previousStatus !== 'PENDING' &&
        previousStatus !== 'PROCESSING'
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'Only pending or processing withdrawals can be completed.',

          currentStatus:
            previousStatus,
        });
      }

      const currentBalance =
        safeNumber(
          transaction.balance
        );

      if (currentBalance < amount) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'Insufficient account balance to complete this withdrawal.',

          balance:
            currentBalance,

          requestedAmount:
            amount,
        });
      }

      await client.query(
        `
        UPDATE accounts

        SET
          balance =
            COALESCE(balance, 0) - $1::NUMERIC,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2::INTEGER
        `,
        [
          amount,
          transaction.account_id,
        ]
      );
    }

    // --------------------------------------------------------
    // UPDATE TRANSACTION
    // --------------------------------------------------------

    const updatedResult =
      await client.query(
        `
        UPDATE transactions

        SET
          status = $1::VARCHAR,

          admin_note =
            CASE
              WHEN $2::TEXT <> ''
              THEN $2::TEXT
              ELSE admin_note
            END,

          verified_by =
            CASE
              WHEN $1::VARCHAR = 'COMPLETED'
              THEN $3::INTEGER
              ELSE verified_by
            END,

          verified_at =
            CASE
              WHEN $1::VARCHAR = 'COMPLETED'
              THEN CURRENT_TIMESTAMP
              ELSE verified_at
            END,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $4::INTEGER

        RETURNING *
        `,
        [
          status,
          adminNote,
          adminId,
          transactionId,
        ]
      );

    if (updatedResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'Transaction could not be updated.',
      });
    }

    await client.query('COMMIT');
    if (
  transactionType === 'DEPOSIT' &&
  (status === 'COMPLETED' || status === 'CANCELLED') &&
  transaction.email
) {
  const action =
    status === 'COMPLETED'
      ? 'approved'
      : 'rejected';

  await sendEmail({
    to: transaction.email,

    subject:
      `Deposit ${action} - GlobalDigitalMarket`,

    text:
      `Hello ${transaction.first_name || ''},\n\n` +
      `Your deposit of ${amount.toFixed(2)} ${transaction.currency || ''} ` +
      `has been ${action}.\n\n` +
      `Transaction reference: ${transaction.transaction_reference}\n\n` +
      `${
        adminNote
          ? `Admin note: ${adminNote}\n\n`
          : ''
      }` +
      `GlobalDigitalMarket.online`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Deposit ${action}</h2>

        <p>
          Hello ${transaction.first_name || ''},
        </p>

        <p>
          Your deposit has been
          <strong>${action}</strong>.
        </p>

        <p>
          <strong>Amount:</strong>
          ${amount.toFixed(2)}
          ${transaction.currency || ''}
        </p>

        <p>
          <strong>Transaction reference:</strong>
          ${transaction.transaction_reference}
        </p>

        ${
          adminNote
            ? `
              <p>
                <strong>Admin note:</strong>
                ${adminNote}
              </p>
            `
            : ''
        }

        <p>
          GlobalDigitalMarket.online
        </p>
      </div>
    `,
  });
}

    logger.info(
      `Admin ${adminId} changed transaction ${transactionId} from ${previousStatus} to ${status}`
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
      {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        table: error.table,
        column: error.column,
        constraint: error.constraint,
        stack: error.stack,
      }
    );

    return res.status(500).json({
      message:
        'Failed to update transaction status.',

      error:
        error.message ||
        'Unknown database error.',

      code:
        error.code || null,

      detail:
        error.detail || null,

      hint:
        error.hint || null,
    });

  } finally {
    client.release();
  }
};

// ============================================================
// KYC
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
        result.rows.map((row) => ({
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
        })),
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
// INVESTMENT PLANS
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

        ORDER BY
          created_at DESC
      `);

    const plans =
      result.rows.map((plan) => ({
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
      }));

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

const createInvestmentPlan = async (
  req,
  res,
  next
) => {
  try {
    const name =
      cleanString(
        req.body?.name
      );

    const description =
      cleanString(
        req.body?.description
      );

    const minimum =
      Number(
        req.body?.minimumAmount
      );

    const maximum =
      req.body?.maximumAmount === '' ||
      req.body?.maximumAmount === null ||
      req.body?.maximumAmount === undefined
        ? null
        : Number(
            req.body.maximumAmount
          );

    const roi =
      Number(
        req.body?.roiPercent
      );

    const duration =
      Number(
        req.body?.durationDays
      );

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Investment plan name is required.',
      });
    }

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

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
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

        RETURNING *
        `,
        [
          name,
          description || null,
          minimum,
          maximum,
          roi,
          duration,
          status,
          req.user.id,
        ]
      );

    return res.status(201).json({
      message:
        'Investment plan created successfully.',

      plan:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin create investment plan error:',
      error
    );

    return next(error);
  }
};

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

    const name =
      cleanString(
        req.body?.name
      );

    const description =
      cleanString(
        req.body?.description
      );

    const minimum =
      Number(
        req.body?.minimumAmount
      );

    const maximum =
      req.body?.maximumAmount === '' ||
      req.body?.maximumAmount === null ||
      req.body?.maximumAmount === undefined
        ? null
        : Number(
            req.body.maximumAmount
          );

    const roi =
      Number(
        req.body?.roiPercent
      );

    const duration =
      Number(
        req.body?.durationDays
      );

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Investment plan name is required.',
      });
    }

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

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
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

        RETURNING *
        `,
        [
          name,
          description || null,
          minimum,
          maximum,
          roi,
          duration,
          status,
          planId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Investment plan not found.',
      });
    }

    return res.status(200).json({
      message:
        'Investment plan updated successfully.',

      plan:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin update investment plan error:',
      error
    );

    return next(error);
  }
};

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
// SIGNAL TABLES
// ============================================================

const ensureSignalTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_plans (
      id SERIAL PRIMARY KEY,

      name VARCHAR(150) NOT NULL,

      description TEXT,

      strength INTEGER
        NOT NULL DEFAULT 50,

      accuracy_percent NUMERIC(6,2)
        NOT NULL DEFAULT 0,

      duration_days INTEGER
        NOT NULL DEFAULT 30,

      price NUMERIC(20,2)
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
    )
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

      updated_by INTEGER,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(user_id)
    )
  `);
};

// ============================================================
// SIGNAL PLANS
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
        SELECT *
        FROM signal_plans
        ORDER BY created_at DESC
      `);

    const plans =
      result.rows.map((plan) => ({
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
      }));

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

const createSignalPlan = async (
  req,
  res,
  next
) => {
  try {
    await ensureSignalTables();

    const name =
      cleanString(
        req.body?.name
      );

    const description =
      cleanString(
        req.body?.description
      );

    const strength =
      req.body?.strength === undefined
        ? 50
        : Number(
            req.body.strength
          );

    const accuracy =
      req.body?.accuracyPercent === undefined
        ? 0
        : Number(
            req.body.accuracyPercent
          );

    const duration =
      req.body?.durationDays === undefined
        ? 30
        : Number(
            req.body.durationDays
          );

    const price =
      req.body?.price === undefined ||
      req.body?.price === '' ||
      req.body?.price === null
        ? 0
        : Number(
            req.body.price
          );

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Signal plan name is required.',
      });
    }

    if (
      !Number.isFinite(strength) ||
      strength < 0 ||
      strength > 100
    ) {
      return res.status(400).json({
        message:
          'Signal strength must be between 0 and 100.',
      });
    }

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

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message:
          'Signal price is invalid.',
      });
    }

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
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

        RETURNING *
        `,
        [
          name,
          description || null,
          getSignalStrength(strength),
          accuracy,
          duration,
          price,
          currency,
          status,
          req.user.id,
        ]
      );

    return res.status(201).json({
      message:
        'Signal plan created successfully.',

      plan:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin create signal plan error:',
      error
    );

    return next(error);
  }
};

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

    const name =
      cleanString(
        req.body?.name
      );

    const description =
      cleanString(
        req.body?.description
      );

    const strength =
      Number(
        req.body?.strength
      );

    const accuracy =
      req.body?.accuracyPercent === undefined
        ? 0
        : Number(
            req.body.accuracyPercent
          );

    const duration =
      req.body?.durationDays === undefined
        ? 30
        : Number(
            req.body.durationDays
          );

    const price =
      req.body?.price === undefined ||
      req.body?.price === '' ||
      req.body?.price === null
        ? 0
        : Number(
            req.body.price
          );

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Signal plan name is required.',
      });
    }

    if (
      !Number.isFinite(strength) ||
      strength < 0 ||
      strength > 100
    ) {
      return res.status(400).json({
        message:
          'Signal strength must be between 0 and 100.',
      });
    }

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

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return res.status(400).json({
        message:
          'Duration must be a positive number of days.',
      });
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message:
          'Signal price is invalid.',
      });
    }

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
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

        RETURNING *
        `,
        [
          name,
          description || null,
          getSignalStrength(strength),
          accuracy,
          duration,
          price,
          currency,
          status,
          planId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Signal plan not found.',
      });
    }

    return res.status(200).json({
      message:
        'Signal plan updated successfully.',

      plan:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin update signal plan error:',
      error
    );

    return next(error);
  }
};

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
        RETURNING id, name
        `,
        [planId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Signal plan not found.',
      });
    }

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
// USER SIGNAL
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
                row.signal_status,

              enabled:
                normalizeStatus(
                  row.signal_status
                ) === 'ACTIVE',

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
                        row.plan_description ||
                        '',

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
                        row.plan_currency ||
                        'USD',

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

    const userResult =
      await pool.query(
        `
        SELECT id
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

    const signalPlanId =
      req.body?.signalPlanId === undefined ||
      req.body?.signalPlanId === null ||
      req.body?.signalPlanId === ''
        ? null
        : Number(
            req.body.signalPlanId
          );

    if (
      signalPlanId !== null &&
      !isPositiveInteger(signalPlanId)
    ) {
      return res.status(400).json({
        message:
          'Invalid signal plan ID.',
      });
    }

    let planStrength = null;

    if (signalPlanId !== null) {
      const planResult =
        await pool.query(
          `
          SELECT
            id,
            strength,
            status
          FROM signal_plans
          WHERE id = $1
          LIMIT 1
          `,
          [signalPlanId]
        );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          message:
            'Signal plan not found.',
        });
      }

      const plan =
        planResult.rows[0];

      if (
        normalizeStatus(
          plan.status
        ) !== 'ACTIVE'
      ) {
        return res.status(400).json({
          message:
            'Cannot assign an inactive signal plan.',
        });
      }

      planStrength =
        getSignalStrength(
          plan.strength
        );
    }

    let strength;

    if (
      req.body?.strength === undefined
    ) {
      strength =
        planStrength !== null
          ? planStrength
          : 50;
    } else {
      strength =
        Number(
          req.body.strength
        );

      if (
        !Number.isFinite(strength) ||
        strength < 0 ||
        strength > 100
      ) {
        return res.status(400).json({
          message:
            'Signal strength must be between 0 and 100.',
        });
      }
    }

    let status;

    if (
      req.body?.status !== undefined
    ) {
      status =
        normalizeStatus(
          req.body.status
        );
    } else if (
      req.body?.enabled !== undefined
    ) {
      status =
        req.body.enabled === true ||
        String(
          req.body.enabled
        ).toLowerCase() === 'true'
          ? 'ACTIVE'
          : 'INACTIVE';
    } else {
      status =
        'ACTIVE';
    }

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Signal status must be ACTIVE or INACTIVE.',
      });
    }

    const note =
      req.body?.note === undefined ||
      req.body?.note === null
        ? null
        : cleanString(
            req.body.note
          );

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

        RETURNING *
        `,
        [
          userId,
          signalPlanId,
          getSignalStrength(strength),
          status,
          note,
          req.user.id,
        ]
      );

    return res.status(200).json({
      message:
        'User signal updated successfully.',

      signal:
        result.rows[0],
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
// PAYMENT METHODS
// ============================================================

const ensurePaymentMethodTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id SERIAL PRIMARY KEY,

      name VARCHAR(150) NOT NULL,

      type VARCHAR(50)
        NOT NULL DEFAULT 'OTHER',

      currency VARCHAR(20)
        NOT NULL DEFAULT 'USD',

      details TEXT,

      account_name VARCHAR(150),

      account_number VARCHAR(150),

      bank_name VARCHAR(150),

      wallet_address TEXT,

      instructions TEXT,

      status VARCHAR(20)
        NOT NULL DEFAULT 'ACTIVE',

      created_by INTEGER,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getPaymentMethods = async (
  req,
  res,
  next
) => {
  try {
    await ensurePaymentMethodTable();

    const result =
      await pool.query(`
        SELECT *
        FROM payment_methods
        ORDER BY created_at DESC
      `);

    const paymentMethods =
      result.rows.map((method) => ({
        id:
          method.id,

        name:
          method.name,

        type:
          method.type,

        currency:
          method.currency,

        details:
          method.details || '',

        accountName:
          method.account_name || '',

        accountNumber:
          method.account_number || '',

        bankName:
          method.bank_name || '',

        walletAddress:
          method.wallet_address || '',

        instructions:
          method.instructions || '',

        status:
          method.status,

        createdBy:
          method.created_by,

        createdAt:
          method.created_at,

        updatedAt:
          method.updated_at,
      }));

    return res.status(200).json({
      paymentMethods,

      count:
        paymentMethods.length,
    });
  } catch (error) {
    logger.error(
      'Admin get payment methods error:',
      error
    );

    return next(error);
  }
};

const createPaymentMethod = async (
  req,
  res,
  next
) => {
  try {
    await ensurePaymentMethodTable();

    const name =
      cleanString(
        req.body?.name
      );

    const type =
      cleanString(
        req.body?.type || 'OTHER'
      ).toUpperCase();

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const details =
      cleanString(
        req.body?.details
      );

    const accountName =
      cleanString(
        req.body?.accountName
      );

    const accountNumber =
      cleanString(
        req.body?.accountNumber
      );

    const bankName =
      cleanString(
        req.body?.bankName
      );

    const walletAddress =
      cleanString(
        req.body?.walletAddress
      );

    const instructions =
      cleanString(
        req.body?.instructions
      );

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Payment method name is required.',
      });
    }

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Payment method status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        INSERT INTO payment_methods (
          name,
          type,
          currency,
          details,
          account_name,
          account_number,
          bank_name,
          wallet_address,
          instructions,
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
          $9,
          $10,
          $11
        )

        RETURNING *
        `,
        [
          name,
          type,
          currency,
          details || null,
          accountName || null,
          accountNumber || null,
          bankName || null,
          walletAddress || null,
          instructions || null,
          status,
          req.user.id,
        ]
      );

    return res.status(201).json({
      message:
        'Payment method created successfully.',

      paymentMethod:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin create payment method error:',
      error
    );

    return next(error);
  }
};

const updatePaymentMethod = async (
  req,
  res,
  next
) => {
  try {
    await ensurePaymentMethodTable();

    const methodId =
      Number(req.params.id);

    if (!isPositiveInteger(methodId)) {
      return res.status(400).json({
        message:
          'Invalid payment method ID.',
      });
    }

    const name =
      cleanString(
        req.body?.name
      );

    const type =
      cleanString(
        req.body?.type || 'OTHER'
      ).toUpperCase();

    const currency =
      cleanString(
        req.body?.currency || 'USD'
      ).toUpperCase();

    const details =
      cleanString(
        req.body?.details
      );

    const accountName =
      cleanString(
        req.body?.accountName
      );

    const accountNumber =
      cleanString(
        req.body?.accountNumber
      );

    const bankName =
      cleanString(
        req.body?.bankName
      );

    const walletAddress =
      cleanString(
        req.body?.walletAddress
      );

    const instructions =
      cleanString(
        req.body?.instructions
      );

    const status =
      normalizeStatus(
        req.body?.status || 'ACTIVE'
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Payment method name is required.',
      });
    }

    if (
      status !== 'ACTIVE' &&
      status !== 'INACTIVE'
    ) {
      return res.status(400).json({
        message:
          'Payment method status must be ACTIVE or INACTIVE.',
      });
    }

    const result =
      await pool.query(
        `
        UPDATE payment_methods

        SET
          name = $1,
          type = $2,
          currency = $3,
          details = $4,
          account_name = $5,
          account_number = $6,
          bank_name = $7,
          wallet_address = $8,
          instructions = $9,
          status = $10,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $11

        RETURNING *
        `,
        [
          name,
          type,
          currency,
          details || null,
          accountName || null,
          accountNumber || null,
          bankName || null,
          walletAddress || null,
          instructions || null,
          status,
          methodId,
        ]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Payment method not found.',
      });
    }

    return res.status(200).json({
      message:
        'Payment method updated successfully.',

      paymentMethod:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin update payment method error:',
      error
    );

    return next(error);
  }
};

const deletePaymentMethod = async (
  req,
  res,
  next
) => {
  try {
    await ensurePaymentMethodTable();

    const methodId =
      Number(req.params.id);

    if (!isPositiveInteger(methodId)) {
      return res.status(400).json({
        message:
          'Invalid payment method ID.',
      });
    }

    const result =
      await pool.query(
        `
        DELETE FROM payment_methods

        WHERE id = $1

        RETURNING
          id,
          name
        `,
        [methodId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Payment method not found.',
      });
    }

    return res.status(200).json({
      message:
        'Payment method deleted successfully.',

      paymentMethod:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Admin delete payment method error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// WITHDRAWAL CODE
// ============================================================

const generateWithdrawalCode = () => {
  return String(
    crypto.randomInt(
      10000000,
      100000000
    )
  );
};

// ============================================================
// ADMIN GENERATES CODE FOR USER
// ============================================================

const generateWithdrawalCodeForUser = async (
  req,
  res,
  next
) => {
  const client = await pool.connect();

  try {
    const userId = Number(
      req.body?.userId || req.body?.user_id
    );

    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        message: 'A valid user ID is required.',
      });
    }

    await client.query('BEGIN');

    const userResult = await client.query(
      `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.username
      FROM users u
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const user = userResult.rows[0];

    // --------------------------------------------------------
    // EXPIRE ANY PREVIOUS ACTIVE CODE FOR THIS USER
    // --------------------------------------------------------

    await client.query(
      `
      UPDATE withdrawal_codes
      SET
        status = 'REVOKED',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
        AND status = 'ACTIVE'
      `,
      [userId]
    );

    const code = generateWithdrawalCode();

    const codeHash = await hashPassword(code);

    // Code valid for 24 hours.
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const codeResult = await client.query(
      `
      INSERT INTO withdrawal_codes (
        transaction_id,
        user_id,
        code_hash,
        status,
        expires_at,
        generated_by,
        created_at,
        updated_at
      )
      VALUES (
        NULL,
        $1,
        $2,
        'ACTIVE',
        $3,
        $4,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING
        id,
        user_id,
        status,
        expires_at,
        generated_by,
        created_at
      `,
      [
        userId,
        codeHash,
        expiresAt,
        req.user.id,
      ]
    );

    await client.query('COMMIT');

    logger.info(
      `Admin ${req.user.id} generated withdrawal code ${codeResult.rows[0].id} for user ${userId}`
    );

    return res.status(201).json({
      message:
        'Withdrawal code generated successfully.',

      withdrawalCode: {
        id:
          codeResult.rows[0].id,

        code,

        userId: user.id,

        user: {
          firstName:
            user.first_name,

          lastName:
            user.last_name,

          username:
            user.username || '',

          email:
            user.email,
        },

        status:
          'ACTIVE',

        expiresAt:
          codeResult.rows[0].expires_at,

        generatedAt:
          codeResult.rows[0].created_at,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Withdrawal code generation rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Generate withdrawal code for user error:',
      error
    );

    return next(error);
  } finally {
    client.release();
  }
};

// ============================================================
// ADMIN SENDS CODE TO USER EMAIL
// ============================================================
//
// IMPORTANT:
// The plaintext code is NOT stored in the database.
// The admin frontend sends the code that was just generated.
// The endpoint verifies that the supplied code matches the
// active hashed code before sending it.
//

const sendWithdrawalCodeEmail = async (
  req,
  res,
  next
) => {
  try {
    const codeId = Number(
      req.params.id
    );

    const code = cleanString(
      req.body?.code
    );

    if (!isPositiveInteger(codeId)) {
      return res.status(400).json({
        message:
          'Invalid withdrawal code ID.',
      });
    }

    if (!code) {
      return res.status(400).json({
        message:
          'The withdrawal code is required.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        wc.id,
        wc.user_id,
        wc.code_hash,
        wc.status,
        wc.expires_at,

        u.email,
        u.first_name,
        u.last_name

      FROM withdrawal_codes wc

      INNER JOIN users u
        ON u.id = wc.user_id

      WHERE wc.id = $1

      LIMIT 1
      `,
      [codeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Withdrawal code not found.',
      });
    }

    const withdrawalCode =
      result.rows[0];

    if (
      withdrawalCode.status !== 'ACTIVE'
    ) {
      return res.status(400).json({
        message:
          'This withdrawal code is no longer active.',
      });
    }

    if (
      new Date(
        withdrawalCode.expires_at
      ).getTime() <= Date.now()
    ) {
      await pool.query(
        `
        UPDATE withdrawal_codes

        SET
          status = 'EXPIRED',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
          AND status = 'ACTIVE'
        `,
        [codeId]
      );

      return res.status(400).json({
        message:
          'This withdrawal code has expired.',
      });
    }

    const matches =
      await comparePassword(
        code,
        withdrawalCode.code_hash
      );

    if (!matches) {
      return res.status(400).json({
        message:
          'The supplied withdrawal code is incorrect.',
      });
    }

    const {
      sendEmail,
    } = require('../utils/email');

    await sendEmail({
      to: withdrawalCode.email,

      subject:
        'Your GlobalDigitalMarket Withdrawal Code',

      text:
        `Hello ${withdrawalCode.first_name || ''},\n\n` +
        `Your withdrawal authorization code is: ${code}\n\n` +
        `This code is valid until ${new Date(
          withdrawalCode.expires_at
        ).toLocaleString()}.\n\n` +
        `The code can only be used once.\n\n` +
        `If you did not request this code, please contact support.\n\n` +
        `GlobalDigitalMarket.online`,

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Withdrawal Authorization Code</h2>

          <p>
            Hello ${withdrawalCode.first_name || ''},
          </p>

          <p>
            Your withdrawal authorization code is:
          </p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            padding: 16px;
            background: #f4f4f4;
            display: inline-block;
            border-radius: 8px;
          ">
            ${code}
          </div>

          <p>
            This code is valid until
            <strong>
              ${new Date(
                withdrawalCode.expires_at
              ).toLocaleString()}
            </strong>.
          </p>

          <p>
            <strong>
              This code can only be used once.
            </strong>
          </p>

          <p>
            If you did not request this code,
            please contact support immediately.
          </p>

          <p>
            GlobalDigitalMarket.online
          </p>
        </div>
      `,
    });

    logger.info(
      `Admin ${req.user.id} sent withdrawal code ${codeId} to user ${withdrawalCode.user_id}`
    );

    return res.status(200).json({
      message:
        'Withdrawal code sent to the user email successfully.',

      sentTo:
        withdrawalCode.email,
    });
  } catch (error) {
    logger.error(
      'Send withdrawal code email error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// LEGACY ENDPOINT
// ============================================================
//
// We deliberately no longer generate codes for completed
// withdrawals. The new workflow generates the code BEFORE
// the withdrawal exists.
//

const generateWithdrawalCodeForTransaction =
  async (req, res) => {
    return res.status(410).json({
      message:
        'This withdrawal-code endpoint has been replaced. Generate a withdrawal code for the user before the withdrawal is submitted.',
    });
  };

// ============================================================
// GET WITHDRAWAL DETAILS
// ============================================================

const getWithdrawalDetails = async (
  req,
  res,
  next
) => {
  try {
    const transactionId =
      Number(req.params.id);

    if (!isPositiveInteger(transactionId)) {
      return res.status(400).json({
        message:
          'Invalid withdrawal transaction ID.',
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          t.*,

          a.account_number,
          a.user_id,

          u.first_name,
          u.last_name,
          u.email,
          u.username,

          wc.id AS withdrawal_code_id,
          wc.status AS withdrawal_code_status,
          wc.expires_at AS withdrawal_code_expires_at,
          wc.used_at AS withdrawal_code_used_at,
          wc.generated_by AS withdrawal_code_generated_by,
          wc.created_at AS withdrawal_code_created_at

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        INNER JOIN users u
          ON u.id = a.user_id

        LEFT JOIN LATERAL (
          SELECT *
          FROM withdrawal_codes
          WHERE transaction_id = t.id
          ORDER BY created_at DESC
          LIMIT 1
        ) wc
          ON TRUE

        WHERE
          t.id = $1

          AND t.transaction_type =
            'WITHDRAWAL'

        LIMIT 1
        `,
        [transactionId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'Withdrawal not found.',
      });
    }

    const row =
      result.rows[0];

    return res.status(200).json({
      withdrawal: {
        id:
          row.id,

        accountId:
          row.account_id,

        accountNumber:
          row.account_number,

        transactionReference:
          row.transaction_reference,

        amount:
          safeNumber(row.amount),

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

        verifiedBy:
          row.verified_by,

        verifiedAt:
          row.verified_at,

        createdAt:
          row.created_at,

        updatedAt:
          row.updated_at,

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

        withdrawalCode:
          row.withdrawal_code_id
            ? {
                id:
                  row.withdrawal_code_id,

                status:
                  row.withdrawal_code_status,

                expiresAt:
                  row.withdrawal_code_expires_at,

                usedAt:
                  row.withdrawal_code_used_at,

                generatedBy:
                  row.withdrawal_code_generated_by,

                createdAt:
                  row.withdrawal_code_created_at,
              }
            : null,
      },
    });
  } catch (error) {
    logger.error(
      'Get withdrawal details error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// REVERSE COMPLETED WITHDRAWAL
// ============================================================

const reverseWithdrawal = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const transactionId =
      Number(req.params.id);

    const reason =
      cleanString(
        req.body?.reason ||
        req.body?.adminNote
      );

    if (!isPositiveInteger(transactionId)) {
      return res.status(400).json({
        message:
          'Invalid withdrawal transaction ID.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message:
          'A reason is required when reversing a withdrawal.',
      });
    }

    await client.query('BEGIN');

    const result =
      await client.query(
        `
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.amount,
          t.currency,
          t.status,

          a.user_id,
          a.balance,
          a.available_balance,
          a.buying_power,
          a.margin_available

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        WHERE t.id = $1

        FOR UPDATE OF t, a
        `,
        [transactionId]
      );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'Withdrawal transaction not found.',
      });
    }

    const transaction =
      result.rows[0];

    if (
      normalizeStatus(
        transaction.transaction_type
      ) !== 'WITHDRAWAL'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only withdrawals can be reversed.',
      });
    }

    if (
      normalizeStatus(
        transaction.status
      ) !== 'COMPLETED'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only a completed withdrawal can be reversed.',
      });
    }

    const amount =
      safeNumber(
        transaction.amount
      );

    const balanceBefore =
      safeNumber(
        transaction.balance
      );

    const balanceAfter =
      balanceBefore + amount;

    await client.query(
      `
      UPDATE accounts

      SET
        balance =
          COALESCE(balance, 0) + $1,

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

    await client.query(
      `
      UPDATE transactions

      SET
        status = 'CANCELLED',

        admin_note = $1,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = $2
      `,
      [
        `REVERSED: ${reason}`,
        transactionId,
      ]
    );

    await client.query(
      `
      UPDATE withdrawal_codes

      SET
        status = 'REVOKED'

      WHERE transaction_id = $1
        AND status = 'ACTIVE'
      `,
      [transactionId]
    );

    await client.query(
      `
      INSERT INTO admin_financial_actions (
        admin_id,
        user_id,
        account_id,
        action_type,
        amount,
        balance_before,
        balance_after,
        description,
        transaction_id
      )

      VALUES (
        $1,
        $2,
        $3,
        'WITHDRAWAL_REVERSED',
        $4,
        $5,
        $6,
        $7,
        $8
      )
      `,
      [
        req.user.id,
        transaction.user_id,
        transaction.account_id,
        amount,
        balanceBefore,
        balanceAfter,
        reason,
        transactionId,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message:
        'Withdrawal reversed successfully.',

      transaction: {
        id:
          transactionId,

        transactionReference:
          transaction.transaction_reference,

        status:
          'CANCELLED',

        action:
          'REVERSED',

        amount,

        currency:
          transaction.currency,

        reason,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Withdrawal reversal rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Reverse withdrawal error:',
      error
    );

    return next(error);
  } finally {
    client.release();
  }
};

// ============================================================
// REJECT WITHDRAWAL
// ============================================================

const rejectWithdrawal = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const transactionId =
      Number(req.params.id);

    const reason =
      cleanString(
        req.body?.reason ||
        req.body?.adminNote
      );

    if (!isPositiveInteger(transactionId)) {
      return res.status(400).json({
        message:
          'Invalid withdrawal transaction ID.',
      });
    }

    if (!reason) {
      return res.status(400).json({
        message:
          'A reason is required when rejecting a withdrawal.',
      });
    }

    await client.query('BEGIN');

    const result =
      await client.query(
        `
        SELECT
          t.id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.amount,
          t.status,

          a.user_id,
          a.available_balance

        FROM transactions t

        INNER JOIN accounts a
          ON a.id = t.account_id

        WHERE t.id = $1

        FOR UPDATE OF t, a
        `,
        [transactionId]
      );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message:
          'Withdrawal transaction not found.',
      });
    }

    const transaction =
      result.rows[0];

    if (
      normalizeStatus(
        transaction.transaction_type
      ) !== 'WITHDRAWAL'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only withdrawals can be rejected.',
      });
    }

    const currentStatus =
      normalizeStatus(
        transaction.status
      );

    if (
      currentStatus !== 'PENDING' &&
      currentStatus !== 'PROCESSING'
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message:
          'Only pending or processing withdrawals can be rejected.',
      });
    }

    const amount =
      safeNumber(
        transaction.amount
      );

    const availableBefore =
      safeNumber(
        transaction.available_balance
      );

    const availableAfter =
      availableBefore + amount;

    await client.query(
      `
      UPDATE accounts

      SET
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

    await client.query(
      `
      UPDATE transactions

      SET
        status = 'CANCELLED',

        admin_note = $1,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = $2
      `,
      [
        `REJECTED: ${reason}`,
        transactionId,
      ]
    );

    await client.query(
      `
      UPDATE withdrawal_codes

      SET
        status = 'REVOKED'

      WHERE transaction_id = $1
        AND status = 'ACTIVE'
      `,
      [transactionId]
    );

    await client.query(
      `
      INSERT INTO admin_financial_actions (
        admin_id,
        user_id,
        account_id,
        action_type,
        amount,
        balance_before,
        balance_after,
        description,
        transaction_id
      )

      VALUES (
        $1,
        $2,
        $3,
        'WITHDRAWAL_REJECTED',
        $4,
        $5,
        $6,
        $7,
        $8
      )
      `,
      [
        req.user.id,
        transaction.user_id,
        transaction.account_id,
        amount,
        availableBefore,
        availableAfter,
        reason,
        transactionId,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message:
        'Withdrawal rejected successfully.',

      transaction: {
        id:
          transactionId,

        transactionReference:
          transaction.transaction_reference,

        status:
          'CANCELLED',

        action:
          'REJECTED',

        amount,

        reason,
      },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Withdrawal rejection rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Reject withdrawal error:',
      error
    );

    return next(error);
  } finally {
    client.release();
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

  // Account Credit / Debit
  fundUserAccount,
  debitUserAccount,

  // Transactions
  getTransactions,
  getDeposits,
  getWithdrawals,
  updateTransactionStatus,

  // Deposits
  rejectDeposit,

  // KYC
  getKycRequests,

  // Investment Plans
  getInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,

  // Signal Plans
  getSignalPlans,
  createSignalPlan,
  updateSignalPlan,
  deleteSignalPlan,

  // User Signal
  getUserSignal,
  updateUserSignal,

  // Payment Methods
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,

  // Withdrawal Codes
  generateWithdrawalCodeForUser,
  sendWithdrawalCodeEmail,

  // Withdrawals
  getWithdrawalDetails,
  reverseWithdrawal,
  rejectWithdrawal,
};
