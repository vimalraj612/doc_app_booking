-- Flyway migration: create patient_relations table
CREATE TABLE IF NOT EXISTS patient_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    age INT,
    phone_number VARCHAR(20),
    gender VARCHAR(20),
    relationship VARCHAR(50) NOT NULL,
    CONSTRAINT fk_patient_relation_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
