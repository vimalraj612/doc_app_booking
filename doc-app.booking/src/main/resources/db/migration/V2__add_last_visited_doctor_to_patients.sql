-- Add last_visited_doctor_id column to patients table
ALTER TABLE patients ADD COLUMN last_visited_doctor_id BIGINT;

-- Add foreign key constraint
ALTER TABLE patients ADD CONSTRAINT fk_patients_last_visited_doctor 
FOREIGN KEY (last_visited_doctor_id) REFERENCES doctors(id);

-- Add index for performance
CREATE INDEX idx_patients_last_visited_doctor ON patients(last_visited_doctor_id);