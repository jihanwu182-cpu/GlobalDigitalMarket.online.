const { Pool } = require('pg');
const logger = require('../utils/logger');

// =====================================
// DATABASE CONNECTION
// =====================================

// Render PostgreSQL provides DATABASE_URL.
// This is the preferred connection method.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error(
    'DATABASE_URL is not set. PostgreSQL connection cannot be established.'
  );
}

const pool = new Pool({
  connectionString: databaseUrl,

  // Render PostgreSQL requires SSL.
  ssl: databaseUrl
    ? {
        rejectUnauthorized: false
      }
    : false,

  // Keep connections healthy on Render.
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// =====================================
// DATABASE EVENTS
// =====================================

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error:', err);
});

// =====================================
// EXPORT
// =====================================

module.exports = pool;
