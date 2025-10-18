package com.doc_app.booking.controller;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import com.doc_app.booking.dto.response.AuthResponse;
import com.doc_app.booking.service.DoctorService;
import com.doc_app.booking.service.OTPService;
import com.doc_app.booking.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor Management", description = "APIs for managing doctors with public signup")
@SecurityRequirement(name = "Bearer Authentication")
public class DoctorController {

    private final DoctorService doctorService;
    private final OTPService otpService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup/send-otp")
    @Operation(summary = "Send OTP for doctor registration")
    public ResponseEntity<ApiResponse<String>> sendSignupOTP(@RequestParam String phoneNumber) {
        try {
            // Check if doctor already exists
            try {
                doctorService.getDoctorByContact(phoneNumber);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Doctor with this phone number already exists"));
            } catch (Exception e) {
                // Doctor doesn't exist, proceed with OTP
            }
            
            // Generate and send OTP
            otpService.generateAndSendOTP(phoneNumber, "DOCTOR");
            
            return ResponseEntity.ok(
                ApiResponse.success("OTP sent successfully. Please verify to complete doctor registration.")
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to send OTP"));
        }
    }

    @PostMapping("/signup/verify-otp")
    @Operation(summary = "Verify OTP and complete doctor registration")
    public ResponseEntity<ApiResponse<AuthResponse>> verifySignupOTP(
            @RequestParam String phoneNumber,
            @RequestParam String otp,
            @Valid @RequestBody CreateDoctorRequest request) {
        try {
            // Validate OTP
            boolean isValidOTP = otpService.validateOTP(phoneNumber, otp);
            
            if (!isValidOTP) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid or expired OTP"));
            }
            
            // Ensure phone number matches (Doctor uses 'contact' field)
            if (!phoneNumber.equals(request.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Phone number mismatch"));
            }
            
            // Create doctor
            DoctorDTO doctorDTO = doctorService.createDoctor(request);
            
            // Generate JWT token for automatic login as DOCTOR
            String token = jwtUtil.generateToken(phoneNumber, "DOCTOR", doctorDTO.getId());
            
            AuthResponse authResponse = AuthResponse.success(token, "DOCTOR", doctorDTO.getId(), phoneNumber);
            
            return ResponseEntity.ok(
                ApiResponse.success("Doctor registered and logged in successfully", authResponse)
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Doctor registration failed: " + e.getMessage()));
        }
    }

    @Operation(summary = "Create a new doctor - Hospital Admin only (for staff use)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Doctor created successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body")
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> createDoctor(
            @Parameter(description = "Doctor creation request body", required = true) @Valid @RequestBody CreateDoctorRequest request) {
        DoctorDTO doctorDTO = doctorService.createDoctor(request);
        return new ResponseEntity<>(ApiResponse.success("Doctor created successfully", doctorDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update doctor - Doctor themselves or Hospital Admin")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor updated successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(authentication.name, #id))")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(
            @Parameter(description = "ID of the doctor to update", required = true) @PathVariable Long id,
            @Parameter(description = "Doctor update request body", required = true) @Valid @RequestBody UpdateDoctorRequest request,
            HttpServletRequest httpRequest) {
        
        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // If doctor, ensure they can only update their own profile
        if ("DOCTOR".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only update your own profile"));
        }
        
        DoctorDTO doctorDTO = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", doctorDTO));
    }

    @Operation(summary = "Get a doctor by ID", description = "Retrieves detailed information about a specific doctor")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor found successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctor(
            @Parameter(description = "ID of the doctor to retrieve", required = true) @PathVariable Long id) {
        DoctorDTO doctorDTO = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctorDTO));
    }

    @Operation(summary = "Get all doctors", description = "Retrieves a paginated list of all doctors with sorting options")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of doctors retrieved successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PageResponse.class)))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DoctorDTO>>> getAllDoctors(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by", example = "name") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "asc") @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<DoctorDTO> response = doctorService.getAllDoctors(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Delete a doctor", description = "Removes a doctor from the system")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(
            @Parameter(description = "ID of the doctor to delete", required = true) @PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsByHospital(@PathVariable Long hospitalId) {
        List<DoctorDTO> doctors = doctorService.getDoctorsByHospital(hospitalId);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorByEmail(@PathVariable String email) {
        DoctorDTO doctorDTO = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(doctorDTO));
    }
}