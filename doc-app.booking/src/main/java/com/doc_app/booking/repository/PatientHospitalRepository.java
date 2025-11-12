package com.doc_app.booking.repository;

import com.doc_app.booking.model.PatientHospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientHospitalRepository extends JpaRepository<PatientHospital, Long> {

    @Query("SELECT COUNT(ph) > 0 FROM PatientHospital ph WHERE ph.patient.id = :patientId AND ph.hospital.id = :hospitalId")
    boolean existsByPatientIdAndHospitalId(@Param("patientId") Long patientId, @Param("hospitalId") Long hospitalId);
}
