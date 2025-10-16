package com.doc_app.booking.service;

import com.doc_app.booking.dto.TimeSlotDTO;
import com.doc_app.booking.dto.ScheduleDTO;

import java.time.LocalDate;
import java.util.List;

public interface DoctorScheduleService {
    ScheduleDTO createOrUpdateSchedule(ScheduleDTO dto);
    List<ScheduleDTO> getSchedulesByDoctor(Long doctorId);
    List<TimeSlotDTO> getAvailableSlots(Long doctorId, LocalDate date);
}
