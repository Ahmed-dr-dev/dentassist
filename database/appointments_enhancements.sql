-- Add appointment notes/observations field to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS observations TEXT;

-- Add cancellation reason
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add medical history fields for patient
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS medical_history TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS current_medications TEXT;

-- Index for completed appointments (for history)
CREATE INDEX IF NOT EXISTS idx_appointments_completed ON appointments(status, confirmed_date_time) WHERE status IN ('completed', 'cancelled');
