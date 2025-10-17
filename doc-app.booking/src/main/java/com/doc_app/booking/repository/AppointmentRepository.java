package com.doc_app.booking.repository;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentDateTimeBetweenAndStatus(LocalDateTime startDateTime, LocalDateTime endDateTime,
            AppointmentStatus status);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = ?1 AND a.appointmentDateTime BETWEEN ?2 AND ?3")
    List<Appointment> findByDoctorIdAndDateRange(Long doctorId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime start,
            LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = ?1 AND a.appointmentDateTime BETWEEN ?2 AND ?3")
    List<Appointment> findByPatientIdAndDateRange(Long patientId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.hospital.id = ?1 AND a.appointmentDateTime BETWEEN ?2 AND ?3")
    List<Appointment> findByHospitalIdAndDateRange(Long hospitalId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = ?1 AND a.appointmentDateTime = ?2")
    boolean existsByDoctorAndDateTime(Long doctorId, LocalDateTime dateTime);
}