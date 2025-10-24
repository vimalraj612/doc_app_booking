package com.doc_app.booking.controller;

import com.doc_app.booking.dto.SlotDTO;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.service.SlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
@RequiredArgsConstructor
@Slf4j
public class SlotController {

    private final SlotService slotService;
    private final DoctorRepository doctorRepository;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getSlotsByDoctorAndDate(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotDTO> slots;
        if (date != null) {
            slots = slotService.getAvailableSlots(doctorId, date);
        } else {
            slots = slotService.getAllSlots(doctorId);
        }
        // Remove past slots (end time before now)
        var now = java.time.LocalDateTime.now();
        var filtered = new ArrayList<SlotDTO>();
        for (SlotDTO slot : slots) {
            if (slot.getEnd() != null && slot.getEnd().isAfter(now)) {
                filtered.add(slot);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(filtered));
    }

    @GetMapping("/doctor/{doctorId}/all")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getAllSlotsByDoctor(@PathVariable Long doctorId) {
        var slots = slotService.getAllSlots(doctorId);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @PostMapping("/generate-slots")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> generateSlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date == null ? LocalDate.now() : date;
        List<SlotDTO> generated = new ArrayList<>();
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            for (Doctor d : doctors) {
                try {
                    generated.addAll(slotService.generateSlotsForDoctor(d.getId(), target));
                } catch (Exception ex) {
                    log.error("Failed to generate slots for doctor {} on {}: {}", d.getId(), target,
                            ex.getMessage());
                }
            }
            ApiResponse<List<SlotDTO>> resp = ApiResponse
                    .success("Generated " + generated.size() + " slots for " + target, generated);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("Manual slot generation failed: {}", e.getMessage(), e);
            ApiResponse<List<SlotDTO>> resp = ApiResponse.error("Slot generation failed: " + e.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }

    @PostMapping("/doctor/{doctorId}/slots/generate")
    public ResponseEntity<List<SlotDTO>> generateSlots(@PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        var slots = slotService.generateSlotsForDoctor(doctorId, date);
        return ResponseEntity.ok(slots);
    }
}
