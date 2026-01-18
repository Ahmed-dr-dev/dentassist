-- Add payment status to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'unpaid')) DEFAULT 'pending';

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
