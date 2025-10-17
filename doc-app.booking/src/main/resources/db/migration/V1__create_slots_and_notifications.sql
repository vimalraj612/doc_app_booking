-- Flyway migration: create appointment_slots and notifications tables

CREATE TABLE IF NOT EXISTS appointment_slots (
  id BIGSERIAL PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_slots_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  appointment_id BIGINT NOT NULL,
  type VARCHAR(255) NOT NULL,
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_for TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_notification_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);
