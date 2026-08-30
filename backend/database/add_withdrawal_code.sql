ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS withdrawal_code VARCHAR(32);
