package com.doc_app.booking.controller;

import com.doc_app.booking.dto.SlotTemplateDTO;
import com.doc_app.booking.dto.request.SlotTemplateRequestDTO;
import com.doc_app.booking.exception.BusinessException;
import com.doc_app.booking.service.SlotTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slot-template")
@RequiredArgsConstructor
@Slf4j
public class SlotTemplateController {

    private final SlotTemplateService slotTemplateService;

    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<SlotTemplateRequestDTO> createOrUpdate(@PathVariable Long doctorId,
            @Valid @RequestBody SlotTemplateRequestDTO dto) {
        try {
            dto.setDoctorId(doctorId);
            SlotTemplateRequestDTO result = slotTemplateService.createOrUpdateSlotTemplate(dto);
            return ResponseEntity.ok(result);
        } catch (BusinessException ex) {
            log.warn("Business error while creating/updating schedule: {}", ex.getMessage());
            throw ex;
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<SlotTemplateDTO>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(slotTemplateService.getSlotTemplateByDoctor(doctorId));
    }
}
