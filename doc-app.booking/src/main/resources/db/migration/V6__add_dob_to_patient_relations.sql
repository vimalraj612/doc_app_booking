-- Add date_of_birth column to patient_relations table
ALTER TABLE patient_relations 
ADD COLUMN date_of_birth DATE AFTER full_name;