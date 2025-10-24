package com.doc_app.booking.controller;

import com.doc_app.booking.dto.SlotTemplateDTO;
import com.doc_app.booking.dto.request.SlotTemplateRequestDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.exception.BusinessException;
import com.doc_app.booking.service.SlotTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slot-templates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Slot Template Management", description = "APIs for managing doctor slot templates")
public class SlotTemplateController {

    private final SlotTemplateService slotTemplateService;

    @Operation(summary = "Create or update slot template for a doctor", description = "Creates a new slot template or updates an existing one for the specified doctor")
    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<SlotTemplateRequestDTO>> createOrUpdate(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId,
            @Valid @RequestBody SlotTemplateRequestDTO dto) {
        try {
            dto.setDoctorId(doctorId);
            SlotTemplateRequestDTO result = slotTemplateService.createOrUpdateSlotTemplate(dto);
            return ResponseEntity.ok(ApiResponse.success("Slot template created/updated successfully", result));
        } catch (BusinessException ex) {
            log.warn("Business error while creating/updating schedule: {}", ex.getMessage());
            throw ex;
        }
    }

    @Operation(summary = "Get slot templates by doctor", description = "Retrieves all slot templates for the specified doctor")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<SlotTemplateDTO>>> getByDoctor(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId) {
        List<SlotTemplateDTO> templates = slotTemplateService.getSlotTemplateByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Slot templates retrieved successfully", templates));
    }
}
