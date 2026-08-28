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
// GET HOLDINGS
// ============================================================

const getHoldings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(
      `Fetching holdings for user: ${userId}`
    );

    const account = await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        holdings: [],
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        symbol,
        quantity,
        average_cost,
        current_price,
        market_value,
        gain_loss,
        gain_loss_percent,
        last_updated
      FROM portfolio_holdings
      WHERE account_id = $1
      ORDER BY market_value DESC NULLS LAST
      `,
      [account.id]
    );

    return res.status(200).json({
      holdings: result.rows,
    });
  } catch (error) {
    logger.error(
      'Get holdings error:',
      error
    );

    next(error);
  }
};

// ============================================================
// GET PERFORMANCE
// ============================================================

const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(
      `Fetching performance for user: ${userId}`
    );

    const account = await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        totalValue: 0,
        totalGain: 0,
        gainPercentage: 0,

        deposit: 0,
        profits: 0,
        availableBalance: 0,
        bonus: 0,
        referrerBonus: 0,

        buyingPower: 0,
        marginAvailable: 0,
      });
    }

    // ========================================================
    // PORTFOLIO HOLDINGS
    // ========================================================

    const holdingsResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(market_value),
          0
        ) AS total_value,

        COALESCE(
          SUM(gain_loss),
          0
        ) AS total_gain
      FROM portfolio_holdings
      WHERE account_id = $1
      `,
      [account.id]
    );

    const totalHoldingsValue = Number(
      holdingsResult.rows[0].total_value || 0
    );

    const totalGain = Number(
      holdingsResult.rows[0].total_gain || 0
    );

    // ========================================================
    // ACCOUNT VALUES
    // ========================================================

    const deposit = Number(
      account.deposit || 0
    );

    const profits = Number(
      account.profits || 0
    );

    const availableBalance = Number(
      account.available_balance || 0
    );

    const bonus = Number(
      account.bonus || 0
    );

    const referrerBonus = Number(
      account.referrer_bonus || 0
    );

    const buyingPower = Number(
      account.buying_power || 0
    );

    const marginAvailable = Number(
      account.margin_available || 0
    );

    // ========================================================
    // TOTAL PORTFOLIO VALUE
    // ========================================================

    const totalValue =
      availableBalance +
      totalHoldingsValue;

    // ========================================================
    // PERFORMANCE PERCENTAGE
    // ========================================================

    const investedValue =
      totalHoldingsValue - totalGain;

    const gainPercentage =
      investedValue > 0
        ? (totalGain / investedValue) * 100
        : 0;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      totalValue,
      totalGain,
      gainPercentage,

      deposit,
      profits,
      availableBalance,
      bonus,
      referrerBonus,

      buyingPower,
      marginAvailable,

      totalHoldingsValue,
    });

  } catch (error) {
    logger.error(
      'Get performance error:',
      error
    );

    next(error);
  }
};

// ============================================================
// GET ACCOUNT SUMMARY
// ============================================================

const getAccountSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(
      `Fetching account summary for user: ${userId}`
    );

    const account = await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        account: null,
      });
    }

    return res.status(200).json({
      account: {
        id: account.id,
        accountNumber: account.account_number,
        accountType: account.account_type,
        accountName: account.account_name,

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

        status: account.status,

        createdAt: account.created_at,
        updatedAt: account.updated_at,
      },
    });

  } catch (error) {
    logger.error(
      'Get account summary error:',
      error
    );

    next(error);
  }
};

// ============================================================
// GET PORTFOLIO ALLOCATION
// ============================================================

const getAllocation = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(
      `Fetching allocation for user: ${userId}`
    );

    const account = await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        allocation: [],
      });
    }

    const result = await pool.query(
      `
      SELECT
        symbol,
        COALESCE(
          market_value,
          0
        ) AS value
      FROM portfolio_holdings
      WHERE account_id = $1
      ORDER BY market_value DESC NULLS LAST
      `,
      [account.id]
    );

    const total = result.rows.reduce(
      (sum, item) =>
        sum + Number(item.value || 0),
      0
    );

    const allocation = result.rows.map(
      (item) => {
        const value = Number(
          item.value || 0
        );

        return {
          symbol: item.symbol,
          value,

          percentage:
            total > 0
              ? (value / total) * 100
              : 0,
        };
      }
    );

    return res.status(200).json({
      allocation,
    });

  } catch (error) {
    logger.error(
      'Get allocation error:',
      error
    );

    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getHoldings,
  getPerformance,
  getAccountSummary,
  getAllocation,
};
