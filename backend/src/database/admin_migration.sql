-- ============================================================
-- GLOBAL DIGITAL MARKET
-- ADMIN SYSTEM DATABASE MIGRATION
-- NON-DESTRUCTIVE
-- ============================================================

BEGIN;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10)
DEFAULT 'USD';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS referrer_code VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(50)
DEFAULT 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
ON users(username)
WHERE username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code_unique
ON users(referral_code)
WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_identity_verification_status
ON users(identity_verification_status);


-- ============================================================
-- 2. ACCOUNTS TABLE
-- ============================================================

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS deposit DECIMAL(20, 2)
DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS profits DECIMAL(20, 2)
DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS bonus DECIMAL(20, 2)
DEFAULT 0;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS referrer_bonus DECIMAL(20, 2)
DEFAULT 0;


-- ============================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_by INTEGER
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS admin_note TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50);

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);


-- ============================================================
-- 4. COPY EXISTING TRANSACTION VALUES
-- ============================================================

UPDATE transactions
SET
  transaction_reference = transaction_number
WHERE
  transaction_reference IS NULL
  AND transaction_number IS NOT NULL;

UPDATE transactions
SET
  transaction_type = UPPER(type)
WHERE
  transaction_type IS NULL
  AND type IS NOT NULL;

UPDATE transactions
SET
  payment_method = method
WHERE
  payment_method IS NULL
  AND method IS NOT NULL;


-- ============================================================
-- 5. IDENTITY DOCUMENTS / KYC
-- ============================================================

CREATE TABLE IF NOT EXISTS identity_documents (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  document_type VARCHAR(100) NOT NULL,

  document_number VARCHAR(255),

  document_url TEXT NOT NULL,

  status VARCHAR(50)
    NOT NULL DEFAULT 'PENDING',

  reviewed_by INTEGER
    REFERENCES users(id)
    ON DELETE SET NULL,

  reviewed_at TIMESTAMP,

  rejection_reason TEXT,

  created_at TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_identity_documents_user_id
ON identity_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_identity_documents_status
ON identity_documents(status);


-- ============================================================
-- 6. INVESTMENT PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS investment_plans (
  id SERIAL PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  description TEXT,

  minimum_amount DECIMAL(20, 2)
    NOT NULL DEFAULT 0,

  maximum_amount DECIMAL(20, 2),

  roi_percent DECIMAL(10, 4)
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
    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_plans_status
ON investment_plans(status);

CREATE INDEX IF NOT EXISTS idx_investment_plans_created_at
ON investment_plans(created_at);


-- ============================================================
-- 7. SIGNAL PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS signal_plans (
  id SERIAL PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  description TEXT,

  strength INTEGER
    NOT NULL DEFAULT 50,

  accuracy_percent DECIMAL(6, 2)
    NOT NULL DEFAULT 0,

  duration_days INTEGER
    NOT NULL DEFAULT 30,

  price DECIMAL(20, 2)
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

  CONSTRAINT signal_plans_strength_check
    CHECK (strength >= 0 AND strength <= 100),

  CONSTRAINT signal_plans_accuracy_check
    CHECK (
      accuracy_percent >= 0
      AND accuracy_percent <= 100
    ),

  CONSTRAINT signal_plans_price_check
    CHECK (price >= 0),

  CONSTRAINT signal_plans_duration_check
    CHECK (duration_days > 0)
);

CREATE INDEX IF NOT EXISTS idx_signal_plans_status
ON signal_plans(status);

CREATE INDEX IF NOT EXISTS idx_signal_plans_created_at
ON signal_plans(created_at);


-- ============================================================
-- 8. USER SIGNALS
-- ============================================================

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
    NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 9. USER SIGNAL UNIQUE INDEX
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_signals_user_unique
ON user_signals(user_id);

CREATE INDEX IF NOT EXISTS idx_user_signals_plan_id
ON user_signals(signal_plan_id);

CREATE INDEX IF NOT EXISTS idx_user_signals_status
ON user_signals(status);


-- ============================================================
-- 10. TRANSACTION REFERENCE INDEX
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique
ON transactions(transaction_reference)
WHERE transaction_reference IS NOT NULL;


-- ============================================================
-- 11. NORMALIZE EXISTING USER DATA
-- ============================================================

UPDATE users
SET preferred_currency = 'USD'
WHERE preferred_currency IS NULL
   OR TRIM(preferred_currency) = '';


UPDATE users
SET identity_verification_status = 'PENDING'
WHERE identity_verification_status IS NULL
   OR TRIM(identity_verification_status) = '';


-- ============================================================
-- 12. NORMALIZE EXISTING ACCOUNT DATA
-- ============================================================

UPDATE accounts
SET deposit = COALESCE(deposit, 0);

UPDATE accounts
SET profits = COALESCE(profits, 0);

UPDATE accounts
SET bonus = COALESCE(bonus, 0);

UPDATE accounts
SET referrer_bonus = COALESCE(referrer_bonus, 0);


-- ============================================================
-- 13. NORMALIZE EXISTING TRANSACTION DATA
-- ============================================================

UPDATE transactions
SET transaction_type = UPPER(transaction_type)
WHERE transaction_type IS NOT NULL;

UPDATE transactions
SET status = UPPER(status)
WHERE status IS NOT NULL;


-- ============================================================
-- 14. KYC STATUS INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_kyc_status
ON users(identity_verification_status);


-- ============================================================
-- COMPLETE
-- ============================================================

COMMIT;
