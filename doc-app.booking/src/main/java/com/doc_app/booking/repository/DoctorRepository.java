package com.doc_app.booking.repository;

import com.doc_app.booking.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Doctor> findByHospitalId(Long hospitalId);

    List<Doctor> findBySpecialization(String specialization);

    @Query("SELECT d FROM Doctor d JOIN d.hospital h " +
            "WHERE (:name IS NULL OR lower(d.name) LIKE lower(concat('%', :name, '%'))) " +
            "AND (:specialization IS NULL OR lower(d.specialization) LIKE lower(concat('%', :specialization, '%'))) " +
            "AND (:hospitalName IS NULL OR lower(h.name) LIKE lower(concat('%', :hospitalName, '%'))) ")
    List<Doctor> searchByNameSpecializationHospital(@Param("name") String name,
                                                   @Param("specialization") String specialization,
                                                   @Param("hospitalName") String hospitalName);
}