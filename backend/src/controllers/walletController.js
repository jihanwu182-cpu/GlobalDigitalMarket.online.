const pool = require('../config/database');
const logger = require('../utils/logger');

// ============================================================
// GET ACTIVE ACCOUNT
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
      balance,
      deposit,
      profits,
      available_balance,
      bonus,
      referrer_bonus,
      buying_power,
      margin_available,
      status,
      created_at,
      updated_at
    FROM accounts
    WHERE user_id = $1
      AND status = 'active'
    ORDER BY id ASC
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

// ============================================================
// CREATE TRANSACTION REFERENCE
// ============================================================

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

// ============================================================
// GET WALLET BALANCE
// ============================================================

const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(
      `Fetching wallet balance for user: ${userId}`
    );

    const account = await getAccount(userId);

    if (!account) {
      return res.status(404).json({
        message: 'Active trading account not found.',
        balance: 0,
        deposit: 0,
        profits: 0,
        availableBalance: 0,
        bonus: 0,
        referrerBonus: 0,
        buyingPower: 0,
        currency: 'USD',
      });
    }

    return res.status(200).json({
      balance: Number(account.balance || 0),

      deposit: Number(
        account.deposit || 0
      ),

      profits: Number(
        account.profits || 0
      ),

      availableBalance: Number(
        account.available_balance || 0
      ),

      bonus: Number(
        account.bonus || 0
      ),

      referrerBonus: Number(
        account.referrer_bonus || 0
      ),

      buyingPower: Number(
        account.buying_power || 0
      ),

      marginAvailable: Number(
        account.margin_available || 0
      ),

      currency: 'USD',

      accountNumber:
        account.account_number,

      accountType:
        account.account_type,

      status:
        account.status,
    });
  } catch (error) {
    logger.error(
      'Get wallet balance error:',
      error
    );

    next(error);
  }
};

// ============================================================
// DEPOSIT FUNDS
// ============================================================

const depositFunds = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      amount,
      method,
    } = req.body;

    logger.info(
      `Deposit request for user: ${userId}, amount: ${amount}, method: ${method}`
    );

    // --------------------------------------------------------
    // VALIDATE AMOUNT
    // --------------------------------------------------------

    const numericAmount = Number(amount);

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
          'Minimum deposit amount is $10.00.',
      });
    }

    if (numericAmount > 1000000) {
      return res.status(400).json({
        message:
          'Deposit amount exceeds the maximum allowed amount.',
      });
    }

    // --------------------------------------------------------
    // VALIDATE METHOD
    // --------------------------------------------------------

    const paymentMethod =
      typeof method === 'string' &&
      method.trim()
        ? method.trim()
        : 'Not specified';

    // --------------------------------------------------------
    // FIND ACCOUNT
    // --------------------------------------------------------

    const account = await getAccount(userId);

    if (!account) {
      return res.status(404).json({
        message:
          'Active trading account not found.',
      });
    }

    // --------------------------------------------------------
    // CREATE PENDING TRANSACTION
    // --------------------------------------------------------

    const transactionReference =
      createTransactionReference(
        'DEPOSIT'
      );

    const result = await pool.query(
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
        'DEPOSIT',
        $3,
        'USD',
        $4,
        'PENDING',
        $5,
        $6::jsonb
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
        paymentMethod,
        'Deposit request submitted and awaiting payment verification.',
        JSON.stringify({
          userId,
          accountId: account.id,
        }),
      ]
    );

    const transaction =
      result.rows[0];

    return res.status(201).json({
      message:
        'Deposit request created successfully. Payment verification is required before your balance is updated.',

      transaction: {
        id: transaction.id,

        transactionReference:
          transaction.transaction_reference,

        transactionType:
          transaction.transaction_type,

        amount: Number(
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
    });
  } catch (error) {
    logger.error(
      'Deposit funds error:',
      error
    );

    next(error);
  }
};

// ============================================================
// WITHDRAW FUNDS
// ============================================================

const withdrawFunds = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const {
      amount,
      method,
    } = req.body;

    logger.info(
      `Withdrawal request for user: ${userId}, amount: ${amount}, method: ${method}`
    );

    // --------------------------------------------------------
    // VALIDATE AMOUNT
    // --------------------------------------------------------

    const numericAmount = Number(amount);

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
          'Minimum withdrawal amount is $10.00.',
      });
    }

    // --------------------------------------------------------
    // VALIDATE METHOD
    // --------------------------------------------------------

    const withdrawalMethod =
      typeof method === 'string' &&
      method.trim()
        ? method.trim()
        : 'Not specified';

    // --------------------------------------------------------
    // FIND ACCOUNT
    // --------------------------------------------------------

    const account =
      await getAccount(userId);

    if (!account) {
      return res.status(404).json({
        message:
          'Active trading account not found.',
      });
    }

    // --------------------------------------------------------
    // CHECK AVAILABLE BALANCE
    // --------------------------------------------------------

    const availableBalance =
      Number(
        account.available_balance || 0
      );

    if (
      numericAmount >
      availableBalance
    ) {
      return res.status(400).json({
        message:
          'Insufficient available balance.',
        availableBalance,
        requestedAmount:
          numericAmount,
      });
    }

    // --------------------------------------------------------
    // CREATE PENDING WITHDRAWAL
    // --------------------------------------------------------

    const transactionReference =
      createTransactionReference(
        'WITHDRAWAL'
      );

    const result = await pool.query(
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
        'USD',
        $4,
        'PENDING',
        $5,
        $6::jsonb
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
        withdrawalMethod,
        'Withdrawal request submitted and awaiting processing.',
        JSON.stringify({
          userId,
          accountId: account.id,
        }),
      ]
    );

    const transaction =
      result.rows[0];

    return res.status(201).json({
      message:
        'Withdrawal request submitted successfully and is awaiting processing.',

      transaction: {
        id: transaction.id,

        transactionReference:
          transaction.transaction_reference,

        transactionType:
          transaction.transaction_type,

        amount: Number(
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
    });
  } catch (error) {
    logger.error(
      'Withdraw funds error:',
      error
    );

    next(error);
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
    const userId = req.user.id;

    logger.info(
      `Fetching transactions for user: ${userId}`
    );

    const account =
      await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        transactions: [],
      });
    }

    const result = await pool.query(
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
        created_at,
        updated_at
      FROM transactions
      WHERE account_id = $1
      ORDER BY created_at DESC
      LIMIT 100
      `,
      [account.id]
    );

    const transactions =
      result.rows.map(
        (transaction) => ({
          id: transaction.id,

          transactionReference:
            transaction.transaction_reference,

          transactionType:
            transaction.transaction_type,

          amount: Number(
            transaction.amount || 0
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

    next(error);
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
};
