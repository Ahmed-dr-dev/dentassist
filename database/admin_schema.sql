-- ============================================================
-- Admin Role Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Step 1: Drop existing role constraint and add 'admin' to allowed roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('patient', 'doctor', 'assistant', 'admin'));

-- ============================================================
-- Step 2: Create the first admin account
-- After running the ALTER TABLE above, visit:
--   POST /api/admin/setup
--   Body: { "email": "admin@dentassist.com", "password": "YourStrongPassword", "fullName": "Admin DentAssist", "setupKey": "<ADMIN_SETUP_KEY from .env>" }
--
-- Add ADMIN_SETUP_KEY=your_secret_key to your .env.local file first.
-- This endpoint only works if no admin account exists yet.
-- ============================================================
