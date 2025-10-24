-- Fix foreign key constraint in appointments table to reference correct table name
-- Drop the incorrect constraint that references 'doctor' table
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS fkgpgce3qtc5fajyl4j5srcjkcf;

-- Add the correct constraint that references 'doctors' table
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_doctor 
FOREIGN KEY (doctor_id) REFERENCES doctors(id);