const pool = require('../config/database');
const logger = require('../utils/logger');

const getAccount = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
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

const getHoldings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(`Fetching holdings for user: ${userId}`);

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

    res.status(200).json({
      holdings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(`Fetching performance for user: ${userId}`);

    const account = await getAccount(userId);

    if (!account) {
      return res.status(200).json({
        totalValue: 0,
        totalGain: 0,
        gainPercentage: 0,
        availableBalance: 0,
      });
    }

    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(market_value), 0) AS total_value,
        COALESCE(SUM(gain_loss), 0) AS total_gain
      FROM portfolio_holdings
      WHERE account_id = $1
      `,
      [account.id]
    );

    const totalValue = Number(result.rows[0].total_value || 0);
    const totalGain = Number(result.rows[0].total_gain || 0);

    const investedValue = totalValue - totalGain;

    const gainPercentage =
      investedValue > 0
        ? (totalGain / investedValue) * 100
        : 0;

    res.status(200).json({
      totalValue,
      totalGain,
      gainPercentage,
      availableBalance: Number(account.available_balance || 0),
      buyingPower: Number(account.buying_power || 0),
    });
  } catch (error) {
    next(error);
  }
};

const getAllocation = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info(`Fetching allocation for user: ${userId}`);

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
        COALESCE(market_value, 0) AS value
      FROM portfolio_holdings
      WHERE account_id = $1
      ORDER BY market_value DESC NULLS LAST
      `,
      [account.id]
    );

    const total = result.rows.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0
    );

    const allocation = result.rows.map((item) => ({
      symbol: item.symbol,
      value: Number(item.value || 0),
      percentage:
        total > 0
          ? (Number(item.value || 0) / total) * 100
          : 0,
    }));

    res.status(200).json({
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHoldings,
  getPerformance,
  getAllocation,
};
