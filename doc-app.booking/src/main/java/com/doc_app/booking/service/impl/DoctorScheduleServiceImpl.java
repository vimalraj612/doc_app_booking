package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.ScheduleDTO;
import com.doc_app.booking.dto.TimeSlotDTO;
import com.doc_app.booking.exception.BusinessException;
import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.DoctorSchedule;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.DoctorScheduleRepository;
import com.doc_app.booking.service.DoctorScheduleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public ScheduleDTO createOrUpdateSchedule(ScheduleDTO dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        DoctorSchedule schedule;
        if (dto.getId() != null) {
            schedule = scheduleRepository.findById(dto.getId())
                    .orElse(new DoctorSchedule());
        } else {
            schedule = new DoctorSchedule();
        }

        // validation
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            log.warn("Invalid schedule request: missing start/end time for doctor {}", dto.getDoctorId());
            throw new BusinessException("Start and end time must be provided");
        }
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            log.warn("Invalid schedule request: start >= end for doctor {}", dto.getDoctorId());
            throw new BusinessException("Start time must be before end time");
        }
        if (dto.getSlotDurationMinutes() == null || dto.getSlotDurationMinutes() <= 0) {
            log.warn("Invalid schedule request: non-positive slot duration for doctor {}", dto.getDoctorId());
            throw new BusinessException("Slot duration must be positive");
        }

        // ensure slot fits at least once
        long minutes = java.time.Duration.between(dto.getStartTime(), dto.getEndTime()).toMinutes();
        if (minutes < dto.getSlotDurationMinutes()) {
            log.warn("Slot duration {} is larger than schedule window {} minutes for doctor {}", dto.getSlotDurationMinutes(), minutes, dto.getDoctorId());
            throw new BusinessException("Slot duration is larger than the schedule window");
        }

        // check overlapping schedules for same doctor and dayOfWeek
        List<DoctorSchedule> existing = scheduleRepository.findByDoctor(doctor);
        for (DoctorSchedule ex : existing) {
            if (ex.getId() != null && dto.getId() != null && ex.getId().equals(dto.getId())) continue; // skip self
            if (!ex.getDayOfWeek().equals(dto.getDayOfWeek())) continue;

            // overlap if start < ex.end && ex.start < end
            if (dto.getStartTime().isBefore(ex.getEndTime()) && ex.getStartTime().isBefore(dto.getEndTime())) {
                log.warn("Overlap detected when creating schedule for doctor {}: {}-{} overlaps with existing {}-{}", dto.getDoctorId(), dto.getStartTime(), dto.getEndTime(), ex.getStartTime(), ex.getEndTime());
                throw new BusinessException("Provided schedule overlaps with an existing schedule for this doctor on the same day");
            }
        }

        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        schedule.setActive(dto.isActive());

        schedule = scheduleRepository.save(schedule);

        dto.setId(schedule.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getSchedulesByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return scheduleRepository.findByDoctor(doctor).stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();
            dto.setId(s.getId());
            dto.setDoctorId(doctorId);
            dto.setDayOfWeek(s.getDayOfWeek());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setSlotDurationMinutes(s.getSlotDurationMinutes());
            dto.setActive(s.isActive());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        DoctorSchedule schedule = scheduleRepository.findByDoctorAndDayOfWeek(doctor, date.getDayOfWeek())
                .orElse(null);

        if (schedule == null || !schedule.isActive()) {
            return new ArrayList<>();
        }

        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalDateTime cursor = date.atTime(schedule.getStartTime());
        LocalDateTime end = date.atTime(schedule.getEndTime());

        while (!cursor.plusMinutes(schedule.getSlotDurationMinutes()).isAfter(end)) {
            LocalDateTime slotEnd = cursor.plusMinutes(schedule.getSlotDurationMinutes());
            slots.add(new TimeSlotDTO(cursor, slotEnd, true));
            cursor = slotEnd;
        }

    // mark occupied
    LocalDateTime dayStart = date.atStartOfDay();
    LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
    List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, dayStart, dayEnd);

        for (Appointment ap : appointments) {
            for (TimeSlotDTO slot : slots) {
                if (!slot.isAvailable()) continue;
                if (!ap.getAppointmentDateTime().isBefore(slot.getStart()) && ap.getAppointmentDateTime().isBefore(slot.getEnd())) {
                    slot.setAvailable(false);
                }
            }
        }

        return slots;
    }
}
