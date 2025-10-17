package com.doc_app.booking.repository;

import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctorAndDateBetween(Doctor doctor, LocalDate start, LocalDate end);

    boolean existsByDoctorAndDate(Doctor doctor, LocalDate date);
}
