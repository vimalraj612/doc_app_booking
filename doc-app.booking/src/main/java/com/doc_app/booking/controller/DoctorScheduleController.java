package com.doc_app.booking.controller;

import com.doc_app.booking.dto.ScheduleDTO;
import com.doc_app.booking.dto.TimeSlotDTO;
import com.doc_app.booking.exception.BusinessException;
import com.doc_app.booking.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<ScheduleDTO> createOrUpdate(@PathVariable Long doctorId, @Valid @RequestBody ScheduleDTO dto) {
        try {
            dto.setDoctorId(doctorId);
            ScheduleDTO result = scheduleService.createOrUpdateSchedule(dto);
            return ResponseEntity.ok(result);
        } catch (BusinessException ex) {
            log.warn("Business error while creating/updating schedule: {}", ex.getMessage());
            throw ex;
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleDTO>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<List<TimeSlotDTO>> getSlots(@PathVariable Long doctorId,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(scheduleService.getAvailableSlots(doctorId, date));
    }
}
