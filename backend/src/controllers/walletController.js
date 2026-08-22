const logger = require('../utils/logger');

const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching wallet balance for user: ${userId}`);

    // TODO: Fetch wallet balance from database
    res.status(200).json({ balance: 0, currency: 'USD' });
  } catch (error) {
    next(error);
  }
};

const depositFunds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, method } = req.body;
    logger.info(`Deposit request for user: ${userId}, amount: ${amount}`);

    // TODO: Process deposit
    // TODO: Integrate with payment gateway
    res.status(201).json({ transactionId: 'tx_id', status: 'PENDING' });
  } catch (error) {
    next(error);
  }
};

const withdrawFunds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, method } = req.body;
    logger.info(`Withdrawal request for user: ${userId}, amount: ${amount}`);

    // TODO: Validate balance
    // TODO: Process withdrawal
    res.status(201).json({ transactionId: 'tx_id', status: 'PENDING' });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching transactions for user: ${userId}`);

    // TODO: Fetch transaction history
    res.status(200).json({ transactions: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  depositFunds,
  withdrawFunds,
  getTransactions,
};
