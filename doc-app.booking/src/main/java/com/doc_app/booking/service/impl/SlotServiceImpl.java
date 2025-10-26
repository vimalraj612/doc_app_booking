package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.SlotDTO;
import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Slot;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.SlotTemplate;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.repository.SlotRepository;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.SlotTemplateRepository;
import com.doc_app.booking.service.SlotService;
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
public class SlotServiceImpl implements SlotService {

    @Override
    public long countFreeSlotsToday(Long doctorId) {
        LocalDate today = LocalDate.now();
        List<SlotDTO> slots = getAvailableSlots(doctorId, today);
        // A slot is free if available == true or status == "AVAILABLE"
        return slots.stream().filter(slot -> slot.isAvailable()
                || (slot.getStatus() != null && slot.getStatus().equalsIgnoreCase("AVAILABLE"))).count();
    }

    private final DoctorRepository doctorRepository;
    private final SlotTemplateRepository slotTemplateRepository;
    private final SlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public List<SlotDTO> generateSlotsForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        // find slot templates for the day (support multiple slot template ranges per
        // doctor)
        List<SlotTemplate> slotTemplate = slotTemplateRepository.findByDoctorAndDayOfWeek(doctor, date.getDayOfWeek());
        if (slotTemplate == null || slotTemplate.isEmpty())
            return new ArrayList<>();

        // load existing slots to avoid creating duplicates
        List<Slot> existing = slotRepository.findByDoctorIdAndDate(doctorId, date);
        List<Slot> created = new ArrayList<>();

        for (SlotTemplate slotTemplates : slotTemplate) {
            if (!slotTemplates.isActive())
                continue;

            LocalDateTime cursor = date.atTime(slotTemplates.getStartTime());
            LocalDateTime end = date.atTime(slotTemplates.getEndTime());

            while (!cursor.plusMinutes(slotTemplates.getSlotDurationMinutes()).isAfter(end)) {
                LocalDateTime slotEnd = cursor.plusMinutes(slotTemplates.getSlotDurationMinutes());

                // if a slot already exists with same start time, skip
                java.time.LocalTime candidateStart = cursor.toLocalTime();
                boolean exists = existing.stream()
                        .anyMatch(s -> s.getStartTime().equals(candidateStart) && s.getDate().equals(date));
                if (exists) {
                    cursor = slotEnd;
                    continue;
                }

                Slot slot = new Slot();
                slot.setDoctor(doctor);
                slot.setDate(date);
                slot.setStartTime(cursor.toLocalTime());
                slot.setEndTime(slotEnd.toLocalTime());
                slot.setAvailable(true);
                created.add(slotRepository.save(slot));
                cursor = slotEnd;
            }
        }

        // mark occupied slots from appointments
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId,
                dayStart, dayEnd);

        for (Appointment ap : appointments) {
            if (ap.getStatus() == com.doc_app.booking.model.AppointmentStatus.SCHEDULED
                    || ap.getStatus() == com.doc_app.booking.model.AppointmentStatus.COMPLETED) {
                for (Slot slot : created) {
                    LocalDateTime slotStart = LocalDateTime.of(slot.getDate(), slot.getStartTime());
                    LocalDateTime slotEnd = LocalDateTime.of(slot.getDate(), slot.getEndTime());
                    if (!ap.getAppointmentDateTime().isBefore(slotStart)
                            && ap.getAppointmentDateTime().isBefore(slotEnd)) {
                        slot.setAvailable(false);
                        slotRepository.save(slot);
                    }
                }
            }
        }

        return created.stream().map(s -> new SlotDTO(
                s.getId(),
                LocalDateTime.of(s.getDate(), s.getStartTime()),
                LocalDateTime.of(s.getDate(), s.getEndTime()),
                s.isAvailable())).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotDTO> getAvailableSlots(Long doctorId, LocalDate date) {
        // regenerate if no slots exist
        List<Slot> slots = slotRepository.findByDoctorIdAndDate(doctorId, date);
        if (slots.isEmpty()) {
            return generateSlotsForDoctor(doctorId, date);
        }

        List<com.doc_app.booking.model.AppointmentStatus> bookedStatuses = List.of(
                com.doc_app.booking.model.AppointmentStatus.SCHEDULED,
                com.doc_app.booking.model.AppointmentStatus.COMPLETED);
        return slots.stream().map(s -> {
            boolean booked = !appointmentRepository.findBySlot_IdAndStatusIn(s.getId(), bookedStatuses).isEmpty();
            return new SlotDTO(
                    s.getId(),
                    LocalDateTime.of(s.getDate(), s.getStartTime()),
                    LocalDateTime.of(s.getDate(), s.getEndTime()),
                    !booked,
                    booked ? "BOOKED" : "AVAILABLE");
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotDTO> getAllSlots(Long doctorId) {
        List<Slot> slots = slotRepository.findByDoctorId(doctorId);
        List<com.doc_app.booking.model.AppointmentStatus> bookedStatuses = List.of(
                com.doc_app.booking.model.AppointmentStatus.SCHEDULED,
                com.doc_app.booking.model.AppointmentStatus.COMPLETED);
        return slots.stream().map(s -> {
            boolean booked = !appointmentRepository.findBySlot_IdAndStatusIn(s.getId(), bookedStatuses).isEmpty();
            return new SlotDTO(
                    s.getId(),
                    LocalDateTime.of(s.getDate(), s.getStartTime()),
                    LocalDateTime.of(s.getDate(), s.getEndTime()),
                    !booked,
                    booked ? "BOOKED" : "AVAILABLE");
        }).collect(Collectors.toList());
    }
}
