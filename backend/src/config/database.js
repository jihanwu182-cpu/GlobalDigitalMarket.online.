const { Pool } = require('pg');
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/bcrypt');

// ============================================================
// POSTGRESQL CONNECTION
// ============================================================

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || undefined,

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
    process.env.DATABASE_URL ||
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  max: 10,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000,
});

// ============================================================
// DATABASE EVENTS
// ============================================================

pool.on('connect', () => {
  logger.info(
    'PostgreSQL connected successfully'
  );
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
    logger.info(
      'Initializing PostgreSQL database...'
    );

    // ========================================================
    // USERS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255) UNIQUE NOT NULL,

        password_hash VARCHAR(255) NOT NULL,

        first_name VARCHAR(100) NOT NULL,

        last_name VARCHAR(100) NOT NULL,

        username VARCHAR(100) UNIQUE,

        phone VARCHAR(50),

        date_of_birth DATE,

        address TEXT,

        city VARCHAR(100),

        state VARCHAR(100),

        postal_code VARCHAR(30),

        country VARCHAR(100),

        preferred_currency VARCHAR(10)
          NOT NULL DEFAULT 'USD',

        referral_code VARCHAR(50) UNIQUE,

        referrer_code VARCHAR(50),

        identity_document_type VARCHAR(30),

        identity_document_number VARCHAR(150),

        identity_document_url TEXT,

        identity_verification_status VARCHAR(30)
          NOT NULL DEFAULT 'PENDING',

        role VARCHAR(50)
          NOT NULL DEFAULT 'user',

        status VARCHAR(50)
          NOT NULL DEFAULT 'active',

        email_verified BOOLEAN
          NOT NULL DEFAULT FALSE,

        two_factor_enabled BOOLEAN
          NOT NULL DEFAULT FALSE,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ========================================================
    // USERS - SAFE MIGRATIONS
    // ========================================================

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(100);
    `);

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
      ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10)
      DEFAULT 'USD';
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referrer_code VARCHAR(50);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS identity_document_type VARCHAR(30);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS identity_document_number VARCHAR(150);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS identity_document_url TEXT;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(30)
      DEFAULT 'PENDING';
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN
      DEFAULT FALSE;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username
      ON users(username);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_country
      ON users(country);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_currency
      ON users(preferred_currency);
    `);

    logger.info(
      'Users table is ready'
    );

    // ========================================================
    // ACCOUNTS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        account_number VARCHAR(100)
          UNIQUE NOT NULL,

        account_type VARCHAR(50)
          NOT NULL DEFAULT 'standard',

        account_name VARCHAR(150)
          NOT NULL DEFAULT
          'Global Digital Market Account',

        currency VARCHAR(10)
          NOT NULL DEFAULT 'USD',

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
    // ACCOUNTS - SAFE MIGRATIONS
    // ========================================================

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10)
      DEFAULT 'USD';
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS deposit NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS profits NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS available_balance NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS bonus NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS referrer_bonus NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS buying_power NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS margin_available NUMERIC(20, 2)
      DEFAULT 0;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id
      ON accounts(user_id);
    `);

    logger.info(
      'Accounts table is ready'
    );

    // ========================================================
    // PORTFOLIO HOLDINGS
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
      CREATE INDEX IF NOT EXISTS idx_portfolio_account
      ON portfolio_holdings(account_id);
    `);

    logger.info(
      'Portfolio holdings table is ready'
    );

    // ========================================================
    // TRANSACTIONS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,

        account_id INTEGER NOT NULL
          REFERENCES accounts(id)
          ON DELETE CASCADE,

        transaction_reference VARCHAR(120)
          UNIQUE NOT NULL,

        transaction_type VARCHAR(30)
          NOT NULL,

        amount NUMERIC(20, 2)
          NOT NULL,

        currency VARCHAR(10)
          NOT NULL DEFAULT 'USD',

        payment_method VARCHAR(80),

        status VARCHAR(30)
          NOT NULL DEFAULT 'PENDING',

        description TEXT,

        metadata JSONB
          NOT NULL DEFAULT '{}'::jsonb,

        proof_of_payment_url TEXT,

        verified_by INTEGER,

        verified_at TIMESTAMP,

        admin_note TEXT,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT transactions_type_check
        CHECK (
          transaction_type IN (
            'DEPOSIT',
            'WITHDRAWAL',
            'BONUS',
            'PROFIT',
            'REFERRER_BONUS'
          )
        ),

        CONSTRAINT transactions_status_check
        CHECK (
          status IN (
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'FAILED',
            'CANCELLED',
            'REVERSED'
          )
        ),

        CONSTRAINT transactions_amount_check
        CHECK (amount > 0)
      );
    `);

    // ========================================================
    // TRANSACTION STATUS MIGRATION
    // ========================================================

    await pool.query(`
      ALTER TABLE transactions
      DROP CONSTRAINT IF EXISTS transactions_status_check;
    `);

    await pool.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_status_check
      CHECK (
        status IN (
          'PENDING',
          'PROCESSING',
          'COMPLETED',
          'FAILED',
          'CANCELLED',
          'REVERSED'
        )
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_account
      ON transactions(account_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_status
      ON transactions(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_created
      ON transactions(created_at DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON transactions(transaction_type);
    `);

    logger.info(
      'Transactions table is ready'
    );

    // ========================================================
    // WITHDRAWAL CODES
    // ========================================================
    //
    // IMPORTANT WORKFLOW:
    //
    // ADMIN generates the code first.
    //
    // transaction_id is therefore allowed to be NULL
    // until the user submits the withdrawal request.
    //
    // The actual code is NEVER stored as plain text.
    // Only code_hash is stored.
    //
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_codes (
        id SERIAL PRIMARY KEY,

        transaction_id INTEGER
          REFERENCES transactions(id)
          ON DELETE CASCADE,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        code_hash VARCHAR(255) NOT NULL,

        status VARCHAR(30)
          NOT NULL DEFAULT 'ACTIVE',

        expires_at TIMESTAMP,

        used_at TIMESTAMP,

        generated_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ========================================================
    // WITHDRAWAL CODE MIGRATIONS
    // ========================================================

    await pool.query(`
      ALTER TABLE withdrawal_codes
      ALTER COLUMN transaction_id DROP NOT NULL;
    `);

    await pool.query(`
      ALTER TABLE withdrawal_codes
      ADD COLUMN IF NOT EXISTS generated_by INTEGER;
    `);

    await pool.query(`
      ALTER TABLE withdrawal_codes
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    `);

    await pool.query(`
      ALTER TABLE withdrawal_codes
      ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
    `);

    await pool.query(`
      ALTER TABLE withdrawal_codes
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_withdrawal_codes_transaction
      ON withdrawal_codes(transaction_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_withdrawal_codes_user
      ON withdrawal_codes(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_withdrawal_codes_active_user
      ON withdrawal_codes(user_id, status);
    `);

    logger.info(
      'Withdrawal codes table is ready'
    );

    // ========================================================
    // IDENTITY DOCUMENTS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS identity_documents (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        document_type VARCHAR(30)
          NOT NULL,

        document_number VARCHAR(150),

        document_url TEXT NOT NULL,

        status VARCHAR(30)
          NOT NULL DEFAULT 'PENDING',

        reviewed_by INTEGER,

        reviewed_at TIMESTAMP,

        rejection_reason TEXT,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_identity_documents_user
      ON identity_documents(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_identity_documents_status
      ON identity_documents(status);
    `);

    logger.info(
      'Identity documents table is ready'
    );

    // ========================================================
    // INVESTMENT PLANS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS investment_plans (
        id SERIAL PRIMARY KEY,

        name VARCHAR(150) NOT NULL,

        description TEXT,

        minimum_amount NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        maximum_amount NUMERIC(20, 2),

        roi_percent NUMERIC(10, 4)
          NOT NULL DEFAULT 0,

        duration_days INTEGER
          NOT NULL DEFAULT 30,

        status VARCHAR(20)
          NOT NULL DEFAULT 'ACTIVE',

        created_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT investment_plan_status_check
        CHECK (
          status IN (
            'ACTIVE',
            'INACTIVE'
          )
        ),

        CONSTRAINT investment_plan_minimum_check
        CHECK (
          minimum_amount >= 0
        ),

        CONSTRAINT investment_plan_maximum_check
        CHECK (
          maximum_amount IS NULL
          OR maximum_amount >= minimum_amount
        ),

        CONSTRAINT investment_plan_roi_check
        CHECK (
          roi_percent >= 0
        ),

        CONSTRAINT investment_plan_duration_check
        CHECK (
          duration_days > 0
        )
      );
    `);

    await pool.query(`
      ALTER TABLE investment_plans
      ADD COLUMN IF NOT EXISTS created_by INTEGER;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_plans_status
      ON investment_plans(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_investment_plans_created
      ON investment_plans(created_at DESC);
    `);

    logger.info(
      'Investment plans table is ready'
    );

    // ========================================================
    // USER INVESTMENTS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_investments (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        account_id INTEGER NOT NULL
          REFERENCES accounts(id)
          ON DELETE CASCADE,

        plan_id INTEGER NOT NULL
          REFERENCES investment_plans(id)
          ON DELETE RESTRICT,

        amount NUMERIC(20, 2)
          NOT NULL,

        expected_profit NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        roi_percent NUMERIC(10, 4)
          NOT NULL DEFAULT 0,

        duration_days INTEGER
          NOT NULL,

        start_date TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        end_date TIMESTAMP,

        status VARCHAR(30)
          NOT NULL DEFAULT 'ACTIVE',

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT user_investments_amount_check
        CHECK (amount > 0),

        CONSTRAINT user_investments_status_check
        CHECK (
          status IN (
            'ACTIVE',
            'COMPLETED',
            'CANCELLED'
          )
        )
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_investments_user
      ON user_investments(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_investments_account
      ON user_investments(account_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_investments_plan
      ON user_investments(plan_id);
    `);

    logger.info(
      'User investments table is ready'
    );

    // ========================================================
    // SIGNAL PLANS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS signal_plans (
        id SERIAL PRIMARY KEY,

        name VARCHAR(150) NOT NULL,

        description TEXT,

        strength INTEGER
          NOT NULL DEFAULT 50,

        accuracy_percent NUMERIC(6, 2)
          NOT NULL DEFAULT 0,

        duration_days INTEGER
          NOT NULL DEFAULT 30,

        price NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        currency VARCHAR(10)
          NOT NULL DEFAULT 'USD',

        status VARCHAR(20)
          NOT NULL DEFAULT 'ACTIVE',

        created_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT signal_plan_strength_check
        CHECK (
          strength >= 0
          AND strength <= 100
        ),

        CONSTRAINT signal_plan_accuracy_check
        CHECK (
          accuracy_percent >= 0
          AND accuracy_percent <= 100
        ),

        CONSTRAINT signal_plan_duration_check
        CHECK (
          duration_days > 0
        ),

        CONSTRAINT signal_plan_price_check
        CHECK (
          price >= 0
        ),

        CONSTRAINT signal_plan_status_check
        CHECK (
          status IN (
            'ACTIVE',
            'INACTIVE'
          )
        )
      );
    `);

    await pool.query(`
      ALTER TABLE signal_plans
      ADD COLUMN IF NOT EXISTS created_by INTEGER;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_signal_plans_status
      ON signal_plans(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_signal_plans_created
      ON signal_plans(created_at DESC);
    `);

    logger.info(
      'Signal plans table is ready'
    );

    // ========================================================
    // USER SIGNAL SETTINGS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_signals (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        signal_plan_id INTEGER
          REFERENCES signal_plans(id)
          ON DELETE SET NULL,

        strength INTEGER
          NOT NULL DEFAULT 50,

        status VARCHAR(20)
          NOT NULL DEFAULT 'ACTIVE',

        note TEXT,

        updated_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id),

        CONSTRAINT user_signal_strength_check
        CHECK (
          strength >= 0
          AND strength <= 100
        ),

        CONSTRAINT user_signal_status_check
        CHECK (
          status IN (
            'ACTIVE',
            'INACTIVE'
          )
        )
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_signals_user
      ON user_signals(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_signals_plan
      ON user_signals(signal_plan_id);
    `);

    logger.info(
      'User signals table is ready'
    );

    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        title VARCHAR(200) NOT NULL,

        message TEXT NOT NULL,

        type VARCHAR(50)
          NOT NULL DEFAULT 'INFO',

        is_read BOOLEAN
          NOT NULL DEFAULT FALSE,

        created_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        read_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user
      ON notifications(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_unread
      ON notifications(user_id, is_read);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created
      ON notifications(created_at DESC);
    `);

    logger.info(
      'Notifications table is ready'
    );

    // ========================================================
    // ADMIN FINANCIAL AUDIT LOG
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_financial_actions (
        id SERIAL PRIMARY KEY,

        admin_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE RESTRICT,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE RESTRICT,

        account_id INTEGER NOT NULL
          REFERENCES accounts(id)
          ON DELETE RESTRICT,

        action_type VARCHAR(50) NOT NULL,

        amount NUMERIC(20, 2) NOT NULL,

        balance_before NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        balance_after NUMERIC(20, 2)
          NOT NULL DEFAULT 0,

        description TEXT,

        transaction_id INTEGER
          REFERENCES transactions(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT admin_financial_amount_check
        CHECK (
          amount > 0
        )
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_financial_admin
      ON admin_financial_actions(admin_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_financial_user
      ON admin_financial_actions(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_financial_created
      ON admin_financial_actions(created_at DESC);
    `);

    logger.info(
      'Admin financial audit table is ready'
    );

    // ========================================================
    // ADMIN EMAIL LOG
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,

        user_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        admin_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        recipient_email VARCHAR(255) NOT NULL,

        subject VARCHAR(255) NOT NULL,

        message TEXT NOT NULL,

        status VARCHAR(30)
          NOT NULL DEFAULT 'PENDING',

        provider_message_id VARCHAR(255),

        error_message TEXT,

        sent_at TIMESTAMP,

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_user
      ON email_logs(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_created
      ON email_logs(created_at DESC);
    `);

    logger.info(
      'Email logs table is ready'
    );

    // ========================================================
    // ADMIN USER ACCESS LOG
    // ========================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_user_access_logs (
        id SERIAL PRIMARY KEY,

        admin_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE RESTRICT,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE RESTRICT,

        action VARCHAR(50)
          NOT NULL DEFAULT 'LOGIN_AS_USER',

        created_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_user_access_admin
      ON admin_user_access_logs(admin_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_user_access_user
      ON admin_user_access_logs(user_id);
    `);

    // ========================================================
    // CREATE ACCOUNTS FOR USERS WITHOUT ACCOUNTS
    // ========================================================

    const usersWithoutAccounts =
      await pool.query(`
        SELECT
          u.id,
          COALESCE(
            NULLIF(
              u.preferred_currency,
              ''
            ),
            'USD'
          ) AS currency

        FROM users u

        LEFT JOIN accounts a
          ON a.user_id = u.id

        WHERE a.id IS NULL;
      `);

    for (
      const user
      of usersWithoutAccounts.rows
    ) {
      const accountNumber =
        `GDM-${user.id}-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;

      await pool.query(
        `
        INSERT INTO accounts (
          user_id,
          account_number,
          account_type,
          account_name,
          currency,
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
        VALUES (
          $1,
          $2,
          'standard',
          'Global Digital Market Account',
          $3,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          'active'
        );
        `,
        [
          user.id,
          accountNumber,
          user.currency,
        ]
      );
    }

    if (
      usersWithoutAccounts.rows.length > 0
    ) {
      logger.info(
        `Created ${usersWithoutAccounts.rows.length} default account(s)`
      );
    }

    // ========================================================
    // CREATE DEFAULT USER SIGNAL SETTINGS
    // ========================================================

    await pool.query(`
      INSERT INTO user_signals (
        user_id,
        strength,
        status
      )

      SELECT
        u.id,
        50,
        'ACTIVE'

      FROM users u

      LEFT JOIN user_signals us
        ON us.user_id = u.id

      WHERE us.id IS NULL

      ON CONFLICT (user_id)
      DO NOTHING;
    `);

    // ========================================================
    // ADMIN ACCOUNT
    // ========================================================

    const adminEmail =
      String(
        process.env.ADMIN_EMAIL || ''
      )
        .trim()
        .toLowerCase();

    const adminPassword =
      String(
        process.env.ADMIN_PASSWORD || ''
      ).trim();

    if (
      adminEmail &&
      adminPassword
    ) {
      if (
        adminPassword.length < 8
      ) {
        throw new Error(
          'ADMIN_PASSWORD must contain at least 8 characters.'
        );
      }

      logger.info(
        'Checking administrator account...'
      );

      const adminPasswordHash =
        await hashPassword(
          adminPassword
        );

      const existingAdminResult =
        await pool.query(
          `
          SELECT
            id,
            email,
            role,
            status,
            username

          FROM users

          WHERE LOWER(email) = $1

          LIMIT 1
          `,
          [adminEmail]
        );

      let adminUserId;

      // ======================================================
      // CREATE ADMIN
      // ======================================================

      if (
        existingAdminResult.rows.length ===
        0
      ) {
        let adminUsername =
          String(
            process.env.ADMIN_USERNAME ||
              'admin'
          )
            .trim()
            .toLowerCase();

        if (
          !adminUsername
        ) {
          adminUsername = 'admin';
        }

        const usernameCheck =
          await pool.query(
            `
            SELECT id

            FROM users

            WHERE LOWER(username)
              = LOWER($1)

            LIMIT 1
            `,
            [adminUsername]
          );

        if (
          usernameCheck.rows.length > 0
        ) {
          adminUsername =
            `admin_${Date.now()
              .toString()
              .slice(-6)}`;
        }

        const referralCode =
          `GDMADMIN${Date.now()
            .toString()
            .slice(-8)}`;

        const adminResult =
          await pool.query(
            `
            INSERT INTO users (
              email,
              password_hash,
              first_name,
              last_name,
              username,
              phone,
              country,
              preferred_currency,
              referral_code,
              role,
              status,
              email_verified,
              identity_verification_status
            )

            VALUES (
              $1,
              $2,
              'Global',
              'Administrator',
              $3,
              $4,
              'Global',
              'USD',
              $5,
              'admin',
              'active',
              TRUE,
              'APPROVED'
            )

            RETURNING
              id,
              email,
              role,
              status,
              username
            `,
            [
              adminEmail,
              adminPasswordHash,
              adminUsername,
              process.env.ADMIN_PHONE ||
                '0000000000',
              referralCode,
            ]
          );

        adminUserId =
          adminResult.rows[0].id;

        logger.info(
          'Administrator account created successfully.'
        );
      } else {
        // ====================================================
        // UPDATE EXISTING ADMIN
        // ====================================================

        adminUserId =
          existingAdminResult.rows[0].id;

        await pool.query(
          `
          UPDATE users

          SET
            password_hash = $1,
            role = 'admin',
            status = 'active',
            email_verified = TRUE,
            identity_verification_status = 'APPROVED',
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
          `,
          [
            adminPasswordHash,
            adminUserId,
          ]
        );

        logger.info(
          'Existing administrator account updated successfully.'
        );
      }

      // ======================================================
      // CREATE ADMIN WALLET
      // ======================================================

      const adminAccountResult =
        await pool.query(
          `
          SELECT
            id,
            account_number

          FROM accounts

          WHERE user_id = $1

          LIMIT 1
          `,
          [adminUserId]
        );

      if (
        adminAccountResult.rows.length ===
        0
      ) {
        const adminAccountNumber =
          `GDM-ADMIN-${adminUserId}-${Date.now()
            .toString()
            .slice(-8)}`;

        await pool.query(
          `
          INSERT INTO accounts (
            user_id,
            account_number,
            account_type,
            account_name,
            currency,
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

          VALUES (
            $1,
            $2,
            'admin',
            'Global Digital Market Admin Account',
            'USD',
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            'active'
          )
          `,
          [
            adminUserId,
            adminAccountNumber,
          ]
        );

        logger.info(
          'Administrator account wallet created successfully.'
        );
      } else {
        logger.info(
          'Administrator already has an account wallet.'
        );
      }

      logger.info(
        'Administrator provisioning completed successfully.'
      );
    } else {
      logger.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD is not configured. Administrator provisioning skipped.'
      );
    }

    // ========================================================
    // COMPLETE
    // ========================================================

    logger.info(
      'PostgreSQL database initialization completed successfully.'
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
