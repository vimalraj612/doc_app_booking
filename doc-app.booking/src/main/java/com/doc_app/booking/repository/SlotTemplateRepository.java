package com.doc_app.booking.repository;

import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.SlotTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface SlotTemplateRepository extends JpaRepository<SlotTemplate, Long> {
    List<SlotTemplate> findByDoctorAndDayOfWeek(Doctor doctor, DayOfWeek dayOfWeek);

    List<SlotTemplate> findByDoctor(Doctor doctor);
}
