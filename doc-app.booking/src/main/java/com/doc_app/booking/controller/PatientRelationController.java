package com.doc_app.booking.controller;

import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PatientRelationDTO;
import com.doc_app.booking.dto.request.CreatePatientRelationRequest;
import com.doc_app.booking.dto.request.UpdatePatientRelationRequest;
import com.doc_app.booking.service.PatientRelationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PatientRelationController {

    private final PatientRelationService relationService;

    public PatientRelationController(PatientRelationService relationService) {
        this.relationService = relationService;
    }

    @PostMapping("/patients/{patientId}/relations")
    public ResponseEntity<ApiResponse<PatientRelationDTO>> create(@PathVariable Long patientId,
                                                     @Valid @RequestBody CreatePatientRelationRequest request) {
        PatientRelationDTO dto = relationService.create(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Patient relation created successfully", dto));
    }

    @GetMapping("/patients/{patientId}/relations")
    public ResponseEntity<List<PatientRelationDTO>> listByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(relationService.getByPatientId(patientId));
    }

    @GetMapping("/patient-relations/{id}")
    public ResponseEntity<PatientRelationDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(relationService.getById(id));
    }

    @PutMapping("/patient-relations/{id}")
    public ResponseEntity<ApiResponse<PatientRelationDTO>> update(@PathVariable Long id,
                                                      @Valid @RequestBody UpdatePatientRelationRequest request) {
        PatientRelationDTO updated = relationService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient relation updated successfully", updated));
    }

    @DeleteMapping("/patient-relations/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        relationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Patient relation deleted successfully", null));
    }
}
