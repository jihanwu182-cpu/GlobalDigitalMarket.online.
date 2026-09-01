-- ============================================================
-- GlobalDigitalMarket.online
-- Database Schema
-- Safe for existing database
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  phone VARCHAR(50),
  date_of_birth DATE,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  referral_code VARCHAR(100),
  referrer_code VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  identity_verification_status VARCHAR(50) DEFAULT 'PENDING',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS referrer_code VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(50)
DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_status
ON users(status);

-- ============================================================
-- ACCOUNTS
-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  account_name VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',

  balance DECIMAL(20, 2) DEFAULT 0,
  deposit DECIMAL(20, 2) DEFAULT 0,
  profits DECIMAL(20, 2) DEFAULT 0,
  available_balance DECIMAL(20, 2) DEFAULT 0,

  bonus DECIMAL(20, 2) DEFAULT 0,
  referrer_bonus DECIMAL(20, 2) DEFAULT 0,

  buying_power DECIMAL(20, 2) DEFAULT 0,
  margin_available DECIMAL(20, 2) DEFAULT 0,

  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS deposit DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS profits DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS bonus DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS referrer_bonus DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS buying_power DECIMAL(20, 2) DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS margin_available DECIMAL(20, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_accounts_user_id
ON accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_status
ON accounts(status);

-- ============================================================
-- PORTFOLIO HOLDINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  average_cost DECIMAL(20, 2),
  current_price DECIMAL(20, 2),
  market_value DECIMAL(20, 2),
  gain_loss DECIMAL(20, 2),
  gain_loss_percent DECIMAL(10, 4),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holdings_account_id
ON portfolio_holdings(account_id);

CREATE INDEX IF NOT EXISTS idx_holdings_symbol
ON portfolio_holdings(symbol);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 2),
  status VARCHAR(50) DEFAULT 'pending',
  filled_quantity DECIMAL(20, 8) DEFAULT 0,
  average_fill_price DECIMAL(20, 2),
  commission DECIMAL(20, 2) DEFAULT 0,
  total_value DECIMAL(20, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_account_id
ON orders(account_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_symbol
ON orders(symbol);

-- ============================================================
-- TRADES
-- ============================================================

CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  trade_number VARCHAR(50) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  execution_price DECIMAL(20, 2) NOT NULL,
  commission DECIMAL(20, 2) DEFAULT 0,
  total_value DECIMAL(20, 2),
  settlement_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trades_account_id
ON trades(account_id);

CREATE INDEX IF NOT EXISTS idx_trades_symbol
ON trades(symbol);

CREATE INDEX IF NOT EXISTS idx_trades_created_at
ON trades(created_at);

-- ============================================================
-- MARKET DATA
-- ============================================================

CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  current_price DECIMAL(20, 2),
  previous_close DECIMAL(20, 2),
  open_price DECIMAL(20, 2),
  high_price DECIMAL(20, 2),
  low_price DECIMAL(20, 2),
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(10, 4),
  dividend_yield DECIMAL(10, 4),
  week_52_high DECIMAL(20, 2),
  week_52_low DECIMAL(20, 2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol
ON market_data(symbol);

CREATE INDEX IF NOT EXISTS idx_market_data_last_updated
ON market_data(last_updated);

-- ============================================================
-- PRICE HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price_date DATE NOT NULL,
  open_price DECIMAL(20, 2),
  high_price DECIMAL(20, 2),
  low_price DECIMAL(20, 2),
  close_price DECIMAL(20, 2),
  volume BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, price_date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_symbol
ON price_history(symbol);

CREATE INDEX IF NOT EXISTS idx_price_history_date
ON price_history(price_date);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  transaction_number VARCHAR(100) UNIQUE,
  transaction_reference VARCHAR(100) UNIQUE,

  type VARCHAR(50),
  transaction_type VARCHAR(50),

  amount DECIMAL(20, 2) NOT NULL,

  currency VARCHAR(10) DEFAULT 'USD',

  status VARCHAR(50) DEFAULT 'PENDING',

  method VARCHAR(100),
  payment_method VARCHAR(100),

  reference_id VARCHAR(255),

  description TEXT,

  metadata JSONB DEFAULT '{}'::jsonb,

  proof_of_payment_url TEXT,

  withdrawal_code VARCHAR(32),

  verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,

  admin_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_number VARCHAR(100);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS withdrawal_code VARCHAR(32);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_by INTEGER;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS admin_note TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
ON transactions(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type
ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type
ON transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_transactions_status
ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_withdrawal_code
ON transactions(withdrawal_code);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(100),
  related_entity_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(100);

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS related_entity_id INTEGER;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at);

-- ============================================================
-- WATCHLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  alert_price DECIMAL(20, 2),
  alert_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id
ON watchlist(user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_symbol
ON watchlist(symbol);

-- ============================================================
-- IDENTITY DOCUMENTS / KYC
-- ============================================================

CREATE TABLE IF NOT EXISTS identity_documents (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  document_type VARCHAR(100) NOT NULL,

  document_number VARCHAR(255),

  document_url TEXT NOT NULL,

  status VARCHAR(50) DEFAULT 'PENDING',

  reviewed_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  reviewed_at TIMESTAMP,

  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_identity_documents_user_id
ON identity_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_identity_documents_status
ON identity_documents(status);

-- ============================================================
-- INVESTMENT PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS investment_plans (
  id SERIAL PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  description TEXT,

  minimum_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,

  maximum_amount DECIMAL(20, 2),

  roi_percent DECIMAL(10, 4) NOT NULL DEFAULT 0,

  duration_days INTEGER NOT NULL DEFAULT 30,

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  created_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_plans_status
ON investment_plans(status);

-- ============================================================
-- SIGNAL PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS signal_plans (
  id SERIAL PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  description TEXT,

  strength INTEGER NOT NULL DEFAULT 50,

  accuracy_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,

  duration_days INTEGER NOT NULL DEFAULT 30,

  price DECIMAL(20, 2) NOT NULL DEFAULT 0,

  currency VARCHAR(10) NOT NULL DEFAULT 'USD',

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  created_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signal_plans_status
ON signal_plans(status);

-- ============================================================
-- USER SIGNALS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_signals (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  signal_plan_id INTEGER
    REFERENCES signal_plans(id)
    ON DELETE SET NULL,

  strength INTEGER NOT NULL DEFAULT 50,

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  note TEXT,

  updated_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_signals_user_id
ON user_signals(user_id);

CREATE INDEX IF NOT EXISTS idx_user_signals_plan_id
ON user_signals(signal_plan_id);

-- ============================================================
-- PAYMENT METHODS
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  type VARCHAR(50) NOT NULL DEFAULT 'OTHER',

  currency VARCHAR(20) NOT NULL DEFAULT 'USD',

  details TEXT,

  account_name VARCHAR(150),

  account_number VARCHAR(150),

  bank_name VARCHAR(150),

  wallet_address TEXT,

  instructions TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  created_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_status
ON payment_methods(status);

-- ============================================================
-- PAYMENT METHODS
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  ...
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_status
ON payment_methods(status);


-- ============================================================
-- WITHDRAWAL CODES
-- ============================================================

CREATE TABLE IF NOT EXISTS withdrawal_codes (
  id SERIAL PRIMARY KEY,

  transaction_id INTEGER NOT NULL
    REFERENCES transactions(id)
    ON DELETE CASCADE,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  code_hash VARCHAR(255) NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  expires_at TIMESTAMP NOT NULL,

  used_at TIMESTAMP,

  generated_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- ADMIN FINANCIAL ACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_financial_actions (
  id SERIAL PRIMARY KEY,

  admin_id INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  user_id INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  account_id INTEGER
    REFERENCES accounts(id)
    ON DELETE SET NULL,

  action_type VARCHAR(100) NOT NULL,

  amount DECIMAL(20, 2) NOT NULL DEFAULT 0,

  balance_before DECIMAL(20, 2),

  balance_after DECIMAL(20, 2),

  description TEXT,

  transaction_id INTEGER
    REFERENCES transactions(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- DONE
-- ============================================================
