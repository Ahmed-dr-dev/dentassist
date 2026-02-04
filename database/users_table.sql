-- Users table for both patients and doctors
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'assistant')),
  phone TEXT,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Example: Insert a doctor (manually added, not via signup)
-- INSERT INTO users (email, password, full_name, role, specialty)
-- VALUES ('doctor@example.com', '$2a$10$hashedpassword', 'Dr. John Doe', 'doctor', 'Orthodontics');

-- Default doctor account
INSERT INTO users (email, password, full_name, role, specialty)
VALUES ('imen@gmail.com', '$2b$10$grVn99s8bMTVefeWyqicvOZLIzsNfe0giW8.mofEBKB415eKtrK7q', 'Dr. Imen', 'doctor', NULL);
