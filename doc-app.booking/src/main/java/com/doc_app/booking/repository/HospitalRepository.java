package com.doc_app.booking.repository;

import com.doc_app.booking.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByEmail(String email);

    boolean existsByEmail(String email);
    
    Optional<Hospital> findByPhoneNumber(String phoneNumber);

    long count();
}