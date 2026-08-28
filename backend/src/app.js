require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const pool = require('./config/database');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// =====================================
// MIDDLEWARE
// =====================================

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true
  })
);

// =====================================
// PROJECT ROOT
// =====================================

const projectRoot = path.resolve(__dirname, '../..');

// =====================================
// FRONTEND PAGES
// =====================================

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(projectRoot, 'signup.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// =====================================
// SERVER HEALTH CHECK
// =====================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    platform: 'GlobalDigitalMarket.online',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// DATABASE HEALTH CHECK
// =====================================

app.get('/health/db', async (req, res) => {
  try {
    // Test PostgreSQL connection
    const result = await pool.query(
      'SELECT NOW() AS database_time'
    );

    // Check users table
    const usersTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) AS users_table_exists
    `);

    const usersTableExists =
      usersTable.rows[0].users_table_exists;

    res.status(200).json({
      status: 'OK',
      database: 'connected',
      usersTableExists: usersTableExists,
      databaseTime: result.rows[0].database_time,
      message: usersTableExists
        ? 'PostgreSQL connected and users table exists.'
        : 'PostgreSQL connected, but users table does not exist yet.'
    });

  } catch (error) {
    console.error(
      'DATABASE HEALTH CHECK FAILED:',
      error
    );

    logger.error(
      'Database health check failed:',
      error
    );

    res.status(500).json({
      status: 'ERROR',
      database: 'not connected',
      message:
        error.message ||
        'Unknown database connection error',
      code: error.code || null
    });
  }
});

// =====================================
// API ROUTES
// =====================================

app.use(
  `${process.env.API_PREFIX || '/api'}/auth`,
  require('./routes/authRoutes')
);

app.use(
  `${process.env.API_PREFIX || '/api'}/users`,
  require('./routes/userRoutes')
);

app.use(
  `${process.env.API_PREFIX || '/api'}/portfolio`,
  require('./routes/portfolioRoutes')
);

app.use(
  `${process.env.API_PREFIX || '/api'}/trades`,
  require('./routes/tradeRoutes')
);

app.use(
  `${process.env.API_PREFIX || '/api'}/market`,
  require('./routes/marketRoutes')
);

app.use(
  `${process.env.API_PREFIX || '/api'}/wallet`,
  require('./routes/walletRoutes')
);

// =====================================
// 404
// =====================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// =====================================
// ERROR HANDLER
// =====================================

app.use(errorHandler);

// =====================================
// SERVER
// =====================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    logger.info(
      `GlobalDigitalMarket.online server running on port ${PORT}`
    );

    console.log(
      `GlobalDigitalMarket.online server running on ${HOST}:${PORT}`
    );
  });
}

module.exports = app;
