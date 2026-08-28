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
  logger.error(
    'Unexpected PostgreSQL pool error:',
    error
  );
});

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

const initializeDatabase = async () => {
  try {
    logger.info('Initializing PostgreSQL database...');

    // ========================================================
    // USERS TABLE
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255) UNIQUE NOT NULL,

        password_hash VARCHAR(255) NOT NULL,

        first_name VARCHAR(100) NOT NULL,

        last_name VARCHAR(100) NOT NULL,

        phone VARCHAR(50),

        date_of_birth DATE,

        address TEXT,

        city VARCHAR(100),

        state VARCHAR(100),

        postal_code VARCHAR(30),

        country VARCHAR(100),

        role VARCHAR(50) NOT NULL DEFAULT 'user',

        status VARCHAR(50) NOT NULL DEFAULT 'active',

        email_verified BOOLEAN NOT NULL DEFAULT FALSE,

        two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ========================================================
    // ADD MISSING USER COLUMNS
    // ========================================================

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS city VARCHAR(100);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS state VARCHAR(100);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS country VARCHAR(100);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS two_factor_enabled
      BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
    `);

    logger.info('Users table is ready');

    // ========================================================
    // ACCOUNTS TABLE
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        account_number VARCHAR(100) UNIQUE NOT NULL,

        account_type VARCHAR(50)
          NOT NULL DEFAULT 'standard',

        account_name VARCHAR(150)
          NOT NULL DEFAULT 'Global Digital Market Account',

        balance NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        deposit NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        profits NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        available_balance NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        bonus NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        referrer_bonus NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        buying_power NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        margin_available NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        status VARCHAR(50)
          NOT NULL DEFAULT 'active',

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ========================================================
    // ADD NEW ACCOUNT COLUMNS TO EXISTING DATABASES
    // ========================================================

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS deposit
      NUMERIC(20, 2) NOT NULL DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS profits
      NUMERIC(20, 2) NOT NULL DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS bonus
      NUMERIC(20, 2) NOT NULL DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS referrer_bonus
      NUMERIC(20, 2) NOT NULL DEFAULT 0;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id
      ON accounts(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_status
      ON accounts(status);
    `);

    logger.info('Accounts table is ready');

    // ========================================================
    // PORTFOLIO HOLDINGS TABLE
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
        id SERIAL PRIMARY KEY,

        account_id INTEGER NOT NULL
          REFERENCES accounts(id)
          ON DELETE CASCADE,

        symbol VARCHAR(30) NOT NULL,

        quantity NUMERIC(30, 10)
          NOT NULL DEFAULT 0,

        average_cost NUMERIC(20, 8)
          NOT NULL DEFAULT 0,

        current_price NUMERIC(20, 8)
          NOT NULL DEFAULT 0,

        market_value NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        gain_loss NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        gain_loss_percent NUMERIC(20, 8)
          NOT NULL DEFAULT 0,

        last_updated TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(account_id, symbol)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_portfolio_holdings_account
      ON portfolio_holdings(account_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_portfolio_holdings_symbol
      ON portfolio_holdings(symbol);
    `);

    logger.info(
      'Portfolio holdings table is ready'
    );

    // ========================================================
    // CREATE DEFAULT ACCOUNT FOR EXISTING USERS
    // ========================================================

    await pool.query(`
      INSERT INTO accounts (
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
        status
      )
      SELECT
        u.id,
        'GDM-' ||
        u.id ||
        '-' ||
        FLOOR(EXTRACT(EPOCH FROM NOW()))::BIGINT,
        'standard',
        'Global Digital Market Account',
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'active'
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1
        FROM accounts a
        WHERE a.user_id = u.id
      );
    `);

    logger.info(
      'Default trading accounts checked/created'
    );

    // ========================================================
    // FINISHED
    // ========================================================

    logger.info(
      'PostgreSQL database initialization completed successfully'
    );

    return true;

  } catch (error) {
    logger.error(
      'Database initialization failed:',
      error
    );

    throw error;
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = pool;
module.exports.initializeDatabase =
  initializeDatabase;
