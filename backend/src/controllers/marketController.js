const logger = require('../utils/logger');

const getQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    logger.info(`Fetching quote for symbol: ${symbol}`);

    // TODO: Fetch from market data API or cache
    res.status(200).json({
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
    });
  } catch (error) {
    next(error);
  }
};

const getChart = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period } = req.query;
    logger.info(`Fetching chart for symbol: ${symbol}, period: ${period}`);

    // TODO: Fetch chart data from market data source
    res.status(200).json({ symbol, chartData: [] });
  } catch (error) {
    next(error);
  }
};

const searchSecurities = async (req, res, next) => {
  try {
    const { query } = req.query;
    logger.info(`Searching securities for query: ${query}`);

    // TODO: Search in securities database
    res.status(200).json({ results: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuote,
  getChart,
  searchSecurities,
};
