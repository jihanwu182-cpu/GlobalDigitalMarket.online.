const axios = require('axios');
const logger = require('../utils/logger');

const API_KEY = process.env.TWELVE_DATA_API_KEY;

const BASE_URL = 'https://api.twelvedata.com';

/**
 * Convert our frontend symbols to Twelve Data symbols.
 *
 * Examples:
 * EUR/USD  -> EUR/USD
 * BTC/USD  -> BTC/USD
 * AAPL     -> AAPL
 * GOLD/USD -> XAU/USD
 * SILVER/USD -> XAG/USD
 * OIL/USD -> WTI/USD
 */
const normalizeSymbol = (symbol) => {
  const value = String(symbol || '').trim().toUpperCase();

  const symbolMap = {
    'GOLD/USD': 'XAU/USD',
    'SILVER/USD': 'XAG/USD',
    'OIL/USD': 'WTI/USD',
  };

  return symbolMap[value] || value;
};

/**
 * Check API configuration.
 */
const requireApiKey = () => {
  if (!API_KEY) {
    const error = new Error(
      'Market data API key is not configured.'
    );

    error.status = 500;

    throw error;
  }
};

/**
 * GET /api/market/quotes/:symbol
 */
const getQuote = async (req, res, next) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);

    logger.info(
      `Fetching live market quote for: ${symbol}`
    );

    requireApiKey();

    const response = await axios.get(
      `${BASE_URL}/quote`,
      {
        params: {
          symbol,
          apikey: API_KEY,
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    if (data?.status === 'error') {
      return res.status(502).json({
        message:
          data.message ||
          'Market data provider returned an error.',
      });
    }

    const price = Number(data?.close || data?.price);

    if (!Number.isFinite(price)) {
      return res.status(502).json({
        message:
          'Market data provider did not return a valid price.',
      });
    }

    return res.status(200).json({
      symbol: req.params.symbol,
      providerSymbol: symbol,
      price,
      change: Number(data?.change) || 0,
      changePercent:
        Number(data?.percent_change) || 0,
      currency:
        data?.currency ||
        'USD',
      exchange:
        data?.exchange ||
        null,
      timestamp:
        data?.timestamp ||
        null,
    });
  } catch (error) {
    logger.error(
      'MARKET QUOTE ERROR:',
      error?.response?.data || error
    );

    return next(error);
  }
};

/**
 * GET /api/market/chart/:symbol
 *
 * Supported periods:
 * 1m
 * 5m
 * 15m
 * 1h
 * 4h
 * 1day
 */
const getChart = async (req, res, next) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);

    const requestedInterval =
      String(req.query.interval || '1h')
        .toLowerCase();

    const requestedOutputSize =
      Number(req.query.outputsize || 100);

    const intervalMap = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '1h',
      '4h': '4h',
      '1d': '1day',
      '1day': '1day',
    };

    const interval =
      intervalMap[requestedInterval] || '1h';

    const outputsize = Math.min(
      Math.max(
        Number.isFinite(requestedOutputSize)
          ? requestedOutputSize
          : 100,
        20
      ),
      500
    );

    logger.info(
      `Fetching chart for ${symbol}, interval=${interval}, outputsize=${outputsize}`
    );

    requireApiKey();

    const response = await axios.get(
      `${BASE_URL}/time_series`,
      {
        params: {
          symbol,
          interval,
          outputsize,
          apikey: API_KEY,
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    if (data?.status === 'error') {
      return res.status(502).json({
        message:
          data.message ||
          'Market data provider returned an error.',
      });
    }

    if (
      !data?.values ||
      !Array.isArray(data.values)
    ) {
      return res.status(502).json({
        message:
          'Market data provider returned no chart data.',
      });
    }

    const chartData = data.values
      .map((item) => ({
        datetime: item.datetime,
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume:
          item.volume !== undefined
            ? Number(item.volume)
            : null,
      }))
      .filter(
        (item) =>
          Number.isFinite(item.open) &&
          Number.isFinite(item.high) &&
          Number.isFinite(item.low) &&
          Number.isFinite(item.close)
      )
      .reverse();

    return res.status(200).json({
      symbol: req.params.symbol,
      providerSymbol: symbol,
      interval,
      currency:
        data.meta?.currency || 'USD',
      exchange:
        data.meta?.exchange || null,
      chartData,
    });
  } catch (error) {
    logger.error(
      'MARKET CHART ERROR:',
      error?.response?.data || error
    );

    return next(error);
  }
};

/**
 * GET /api/market/search?query=EUR
 */
const searchSecurities = async (req, res, next) => {
  try {
    const query = String(
      req.query.query || ''
    ).trim();

    if (!query) {
      return res.status(400).json({
        message:
          'Search query is required.',
      });
    }

    logger.info(
      `Searching market securities for: ${query}`
    );

    requireApiKey();

    const response = await axios.get(
      `${BASE_URL}/symbol_search`,
      {
        params: {
          symbol: query,
          apikey: API_KEY,
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    if (data?.status === 'error') {
      return res.status(502).json({
        message:
          data.message ||
          'Market data provider returned an error.',
      });
    }

    const results = Array.isArray(data?.data)
      ? data.data.map((item) => ({
          symbol: item.symbol,
          instrumentName:
            item.instrument_name,
          exchange: item.exchange,
          micCode: item.mic_code,
          exchangeTimezone:
            item.exchange_timezone,
          instrumentType:
            item.instrument_type,
        }))
      : [];

    return res.status(200).json({
      results,
    });
  } catch (error) {
    logger.error(
      'MARKET SEARCH ERROR:',
      error?.response?.data || error
    );

    return next(error);
  }
};

module.exports = {
  getQuote,
  getChart,
  searchSecurities,
};
