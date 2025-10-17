package com.doc_app.booking.repository;

import com.doc_app.booking.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    Optional<Slot> findByDoctorIdAndDateAndStartTime(Long doctorId, LocalDate date, LocalTime startTime);

    List<Slot> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<Slot> findByDoctorId(Long doctorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Slot a WHERE a.id = ?1")
    Optional<Slot> findByIdForUpdate(Long id);
}
