-- Add 'assistant' role to users table
-- Run this after users_table.sql (table must exist).

-- Drop existing CHECK constraint on role (PostgreSQL does not support altering CHECK)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new CHECK constraint including 'assistant'
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('patient', 'doctor', 'assistant'));

-- Optional: Insert an example assistant account (password: 123456789)
-- INSERT INTO users (email, password, full_name, role, phone)
-- VALUES (
--   'assistant@example.com',
--   '$2b$10$grVn99s8bMTVefeWyqicvOZLIzsNfe0giW8.mofEBKB415eKtrK7q',
--   'Assistant Cabinet',
--   'assistant',
--   NULL
-- );
