-- Add alternative dates storage for rejections
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS alternative_dates TEXT[];

-- Add nearest dentist information for rejections
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS suggested_dentist_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS suggested_dentist_address TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS suggested_dentist_phone TEXT;
