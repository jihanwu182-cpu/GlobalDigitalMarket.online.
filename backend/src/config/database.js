const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,

  host: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_HOST,

  port: process.env.DATABASE_URL
    ? undefined
    : Number(process.env.DB_PORT || 5432),

  database: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_NAME,

  user: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_USER,

  password: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_PASSWORD,

  ssl:
    process.env.DB_SSL === 'true' || process.env.DATABASE_URL
      ? {
          rejectUnauthorized: false,
        }
      : false,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  logger.info('PostgreSQL connected successfully');
});

pool.on('error', (error) => {
  logger.error('Unexpected PostgreSQL pool error:', error);
});

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

const initializeDatabase = async () => {
  try {
    logger.info('Initializing PostgreSQL database...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255) UNIQUE NOT NULL,

        password_hash VARCHAR(255) NOT NULL,

        first_name VARCHAR(100) NOT NULL,

        last_name VARCHAR(100) NOT NULL,

        role VARCHAR(50) NOT NULL DEFAULT 'user',

        status VARCHAR(50) NOT NULL DEFAULT 'active',

        email_verified BOOLEAN NOT NULL DEFAULT FALSE,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
    `);

    logger.info('Users table is ready');

    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
