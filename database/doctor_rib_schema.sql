-- Add RIB (bank account) information for doctors
ALTER TABLE users ADD COLUMN IF NOT EXISTS rib_bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rib_account_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rib_iban TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rib_bic TEXT;
