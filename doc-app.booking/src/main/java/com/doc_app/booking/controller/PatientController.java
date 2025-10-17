package com.doc_app.booking.controller;

import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;
import com.doc_app.booking.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        PatientDTO patientDTO = patientService.createPatient(request);
        return new ResponseEntity<>(ApiResponse.success("Patient created successfully", patientDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request) {
        PatientDTO patientDTO = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patientDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatient(@PathVariable Long id) {
        PatientDTO patientDTO = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PatientDTO>>> getAllPatients(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<PatientDTO> response = patientService.getAllPatients(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByEmail(@PathVariable String email) {
        PatientDTO patientDTO = patientService.getPatientByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }

    @GetMapping("/phone/{phoneNumber}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByPhoneNumber(@PathVariable String phoneNumber) {
        PatientDTO patientDTO = patientService.getPatientByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }
}