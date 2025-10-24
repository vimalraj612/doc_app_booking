-- Add slot_id column to appointments table and set up foreign key
ALTER TABLE appointments ADD COLUMN slot_id BIGINT;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES slots(id);