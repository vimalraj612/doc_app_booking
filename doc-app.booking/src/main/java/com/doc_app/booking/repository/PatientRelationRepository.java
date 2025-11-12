package com.doc_app.booking.repository;

import com.doc_app.booking.model.PatientRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientRelationRepository extends JpaRepository<PatientRelation, Long> {
    List<PatientRelation> findByPatientId(Long patientId);
}
