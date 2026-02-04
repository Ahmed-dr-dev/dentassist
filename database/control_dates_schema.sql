-- Control / follow-up dates set by the doctor after an appointment
-- Run this in Supabase: SQL Editor → New query → paste and Run

CREATE TABLE IF NOT EXISTS control_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  control_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_control_dates_patient_id ON control_dates(patient_id);
CREATE INDEX IF NOT EXISTS idx_control_dates_doctor_id ON control_dates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_control_dates_control_date ON control_dates(control_date_time);
