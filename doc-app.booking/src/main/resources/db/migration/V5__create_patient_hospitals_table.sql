-- Flyway migration: create patient_hospitals join table
CREATE TABLE IF NOT EXISTS patient_hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    UNIQUE KEY unique_patient_hospital (patient_id, hospital_id),
    CONSTRAINT fk_patient_hospitals_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_hospitals_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
