-- Add follow_up_date column to appointments table
ALTER TABLE appointments ADD COLUMN follow_up_date TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN appointments.follow_up_date IS 'Optional follow-up appointment date set by doctor/admin';
