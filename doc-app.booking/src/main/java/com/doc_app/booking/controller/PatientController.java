package com.doc_app.booking.controller;

import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;
import com.doc_app.booking.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management APIs")
@SecurityRequirement(name = "Bearer Authentication")
@Slf4j
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Create patient - Hospital Admin only (for staff use)")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        // This endpoint is for Hospital Admin to create patients directly
        PatientDTO patientDTO = patientService.createPatient(request);
        return new ResponseEntity<>(ApiResponse.success("Patient created successfully", patientDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patient - Patient themselves or Hospital Admin")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('PATIENT') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request,
            HttpServletRequest httpRequest) {
        
        // Get user ID from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // If patient, ensure they can only update their own profile
        if ("PATIENT".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only update your own profile"));
        }
        
        PatientDTO patientDTO = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patientDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient details - Patient themselves, Doctor or Hospital Admin")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatient(@PathVariable Long id, HttpServletRequest httpRequest) {
        
        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // If patient, ensure they can only view their own profile
        if ("PATIENT".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only view your own profile"));
        }
        
        PatientDTO patientDTO = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }

    @GetMapping("/{id}/dashboard")
    @Operation(summary = "Get patient dashboard with last visited doctor - Patient themselves only")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientDashboard(
            @PathVariable Long id, 
            HttpServletRequest httpRequest) {
        
        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // Ensure patient can only view their own dashboard
        if ("PATIENT".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only view your own dashboard"));
        }
        
        PatientDTO patientDTO = patientService.getPatientWithLastVisitedDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Patient dashboard retrieved successfully", patientDTO));
    }

    @PutMapping("/{id}/last-visited-doctor")
    @Operation(summary = "Update patient's preferred/last visited doctor - Patient themselves only")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<String>> updateLastVisitedDoctor(
            @PathVariable Long id,
            @RequestParam Long doctorId,
            HttpServletRequest httpRequest) {
        
        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // Ensure patient can only update their own preferred doctor
        if ("PATIENT".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only update your own preferred doctor"));
        }
        
        patientService.updateLastVisitedDoctor(id, doctorId);
        return ResponseEntity.ok(ApiResponse.success("Preferred doctor updated successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all patients - Doctor and Hospital Admin only")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PatientDTO>>> getAllPatients(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<PatientDTO> response = patientService.getAllPatients(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete patient - Hospital Admin only")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get patient by email - Doctor and Hospital Admin only")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByEmail(@PathVariable String email) {
        PatientDTO patientDTO = patientService.getPatientByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }

    @GetMapping("/phone/{phoneNumber}")
    @Operation(summary = "Get patient by phone - Doctor and Hospital Admin only")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByPhoneNumber(@PathVariable String phoneNumber) {
        PatientDTO patientDTO = patientService.getPatientByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current patient's profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientDTO>> getCurrentPatientProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        PatientDTO patientDTO = patientService.getPatientById(userId);
        return ResponseEntity.ok(ApiResponse.success(patientDTO));
    }
}