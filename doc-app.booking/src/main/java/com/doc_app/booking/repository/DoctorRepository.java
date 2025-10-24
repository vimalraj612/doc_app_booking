package com.doc_app.booking.repository;

import com.doc_app.booking.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    Optional<Doctor> findByContact(String contact);

    List<Doctor> findByHospitalId(Long hospitalId);

    List<Doctor> findBySpecialization(String specialization);

    @Query("SELECT d FROM Doctor d JOIN d.hospital h " +
            "WHERE (:query IS NULL OR " +
            "lower(d.firstName) LIKE lower(concat('%', :query, '%')) OR " +
            "lower(d.lastName) LIKE lower(concat('%', :query, '%')) OR " +
            "lower(concat(d.firstName, ' ', d.lastName)) LIKE lower(concat('%', :query, '%')) OR " +
            "lower(d.specialization) LIKE lower(concat('%', :query, '%')) OR " +
            "lower(h.name) LIKE lower(concat('%', :query, '%')) OR " +
            "d.contact LIKE concat('%', :query, '%')) ")
    List<Doctor> searchDoctors(@Param("query") String query);

    @Query("SELECT d FROM Doctor d " +
            "WHERE (:name IS NULL OR " +
            "lower(d.firstName) LIKE lower(concat('%', :name, '%')) OR " +
            "lower(d.lastName) LIKE lower(concat('%', :name, '%')) OR " +
            "lower(concat(d.firstName, ' ', d.lastName)) LIKE lower(concat('%', :name, '%'))) " +
            "AND (:specialization IS NULL OR lower(d.specialization) LIKE lower(concat('%', :specialization, '%'))) " +
            "AND (:hospitalId IS NULL OR d.hospital.id = :hospitalId) ")
    List<Doctor> search(@Param("name") String name,
                       @Param("specialization") String specialization,
                       @Param("hospitalId") Long hospitalId);

    @Query("SELECT d FROM Doctor d JOIN d.hospital h " +
            "WHERE (:name IS NULL OR :name = '' OR " +
            "       lower(d.firstName) LIKE lower(concat('%', :name, '%')) OR " +
            "       lower(d.lastName) LIKE lower(concat('%', :name, '%')) OR " +
            "       lower(concat(d.firstName, ' ', d.lastName)) LIKE lower(concat('%', :name, '%'))) " +
            "AND (:specialization IS NULL OR :specialization = '' OR lower(d.specialization) LIKE lower(concat('%', :specialization, '%'))) " +
            "AND (:department IS NULL OR :department = '' OR lower(d.department) LIKE lower(concat('%', :department, '%'))) " +
            "AND (:hospitalId IS NULL OR d.hospital.id = :hospitalId) " +
            "AND (:minExperience IS NULL OR d.experienceYears >= :minExperience) " +
            "AND (:maxExperience IS NULL OR d.experienceYears <= :maxExperience) " +
            "AND (:email IS NULL OR :email = '' OR lower(d.email) LIKE lower(concat('%', :email, '%'))) " +
            "AND (:phoneNumber IS NULL OR :phoneNumber = '' OR d.contact LIKE concat('%', :phoneNumber, '%'))")
    Page<Doctor> findWithFilters(
            @Param("name") String name,
            @Param("specialization") String specialization,
            @Param("department") String department,
            @Param("hospitalId") Long hospitalId,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("email") String email,
            @Param("phoneNumber") String phoneNumber,
            Pageable pageable
    );

    @Query("SELECT COUNT(d) FROM Doctor d JOIN d.hospital h " +
            "WHERE (:name IS NULL OR :name = '' OR " +
            "       lower(d.firstName) LIKE lower(concat('%', :name, '%')) OR " +
            "       lower(d.lastName) LIKE lower(concat('%', :name, '%')) OR " +
            "       lower(concat(d.firstName, ' ', d.lastName)) LIKE lower(concat('%', :name, '%'))) " +
            "AND (:specialization IS NULL OR :specialization = '' OR lower(d.specialization) LIKE lower(concat('%', :specialization, '%'))) " +
            "AND (:department IS NULL OR :department = '' OR lower(d.department) LIKE lower(concat('%', :department, '%'))) " +
            "AND (:hospitalId IS NULL OR d.hospital.id = :hospitalId) " +
            "AND (:minExperience IS NULL OR d.experienceYears >= :minExperience) " +
            "AND (:maxExperience IS NULL OR d.experienceYears <= :maxExperience) " +
            "AND (:email IS NULL OR :email = '' OR lower(d.email) LIKE lower(concat('%', :email, '%'))) " +
            "AND (:phoneNumber IS NULL OR :phoneNumber = '' OR d.contact LIKE concat('%', :phoneNumber, '%'))")
    long countWithFilters(
            @Param("name") String name,
            @Param("specialization") String specialization,
            @Param("department") String department,
            @Param("hospitalId") Long hospitalId,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("email") String email,
            @Param("phoneNumber") String phoneNumber
    );
}