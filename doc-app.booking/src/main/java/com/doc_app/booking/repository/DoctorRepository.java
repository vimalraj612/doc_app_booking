package com.doc_app.booking.repository;

import com.doc_app.booking.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Doctor> findByHospitalId(Long hospitalId);
    List<Doctor> findBySpecialization(String specialization);
}