require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const pool = require('./config/database');
const { initializeDatabase } = require('./config/database');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
  })
);

// ============================================================
// PROJECT PATHS
// ============================================================

const projectRoot = path.resolve(
  __dirname,
  '../..'
);

const frontendBuildPath = path.join(
  projectRoot,
  'frontend',
  'build'
);

// ============================================================
// API PREFIX
// ============================================================

const API_PREFIX =
  process.env.API_PREFIX || '/api';

// ============================================================
// SERVER HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    platform: 'GlobalDigitalMarket.online',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// DATABASE HEALTH CHECK
// ============================================================

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS database_time'
    );

    const usersTable = await pool.query(`
      SELECT EXISTS (
        SELECT
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) AS users_table_exists
    `);

    return res.status(200).json({
      status: 'OK',
      database: 'connected',
      usersTableExists:
        usersTable.rows[0].users_table_exists,
      databaseTime:
        result.rows[0].database_time,
      message:
        usersTable.rows[0].users_table_exists
          ? 'PostgreSQL connected and users table exists.'
          : 'PostgreSQL connected but users table does not exist.',
    });
  } catch (error) {
    logger.error(
      'DATABASE HEALTH CHECK FAILED:',
      error
    );

    return res.status(500).json({
      status: 'ERROR',
      database: 'not connected',
      message: error.message,
      code: error.code || null,
    });
  }
});

// ============================================================
// API ROUTES
// ============================================================

// AUTH
app.use(
  `${API_PREFIX}/auth`,
  require('./routes/authRoutes')
);

// USERS
app.use(
  `${API_PREFIX}/users`,
  require('./routes/userRoutes')
);

// PORTFOLIO
app.use(
  `${API_PREFIX}/portfolio`,
  require('./routes/portfolioRoutes')
);

// TRADING
app.use(
  `${API_PREFIX}/trades`,
  require('./routes/tradeRoutes')
);

// MARKET
app.use(
  `${API_PREFIX}/market`,
  require('./routes/marketRoutes')
);

// WALLET
app.use(
  `${API_PREFIX}/wallet`,
  require('./routes/walletRoutes')
);

// ADMIN
app.use(
  `${API_PREFIX}/admin`,
  require('./routes/adminRoutes')
);

// ============================================================
// REACT FRONTEND
// ============================================================
//
// The new React application is built into:
//
// frontend/build
//
// Serve that folder instead of the old root index.html.
//

app.use(
  express.static(frontendBuildPath)
);

// ============================================================
// LEGACY SIGNUP REDIRECT
// ============================================================

app.get('/signup.html', (req, res) => {
  res.redirect('/#/register');
});

// ============================================================
// LEGACY INDEX REDIRECT
// ============================================================
//
// If somebody opens /index.html, serve the NEW React app.
//

app.get('/index.html', (req, res, next) => {
  res.sendFile(
    path.join(
      frontendBuildPath,
      'index.html'
    ),
    (error) => {
      if (error) {
        logger.error(
          'Could not serve React index.html:',
          error
        );

        next(error);
      }
    }
  );
});

// ============================================================
// REACT APPLICATION FALLBACK
// ============================================================
//
// Non-API browser requests receive the React application.
//
// Your React app uses HashRouter, so routes such as:
//
// /#/login
// /#/register
// /#/admin/login
// /#/admin
//
// are handled by React in the browser.
//

app.get(
  /^\/(?!api(?:\/|$)).*/,
  (req, res, next) => {
    res.sendFile(
      path.join(
        frontendBuildPath,
        'index.html'
      ),
      (error) => {
        if (error) {
          logger.error(
            'Could not serve React frontend:',
            error
          );

          next(error);
        }
      }
    );
  }
);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT || 5000;

const HOST =
  process.env.HOST || '0.0.0.0';

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
  try {
    await initializeDatabase();

    logger.info(
      'Database initialization completed successfully'
    );

    logger.info(
      `React frontend build path: ${frontendBuildPath}`
    );

    app.listen(
      PORT,
      HOST,
      () => {
        logger.info(
          `GlobalDigitalMarket.online server running on ${HOST}:${PORT}`
        );
      }
    );
  } catch (error) {
    logger.error(
      'Server startup failed:',
      error
    );

    process.exit(1);
  }
};

// ============================================================
// START
// ============================================================

if (require.main === module) {
  startServer();
}

module.exports = app;
