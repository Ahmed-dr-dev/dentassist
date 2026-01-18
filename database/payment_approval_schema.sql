-- Add payment approval file path to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_approval_path TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_approval_file_name TEXT;
