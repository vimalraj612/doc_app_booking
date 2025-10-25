package com.doc_app.booking.controller;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import com.doc_app.booking.dto.response.AuthResponse;
import com.doc_app.booking.service.DoctorService;
import com.doc_app.booking.service.OTPService;
import com.doc_app.booking.service.SlotTemplateService;
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
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor Management", description = "APIs for managing doctors with public signup")
@SecurityRequirement(name = "Bearer Authentication")
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;
    private final OTPService otpService;
    private final JwtUtil jwtUtil;
    private final SlotTemplateService slotTemplateService;

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

            // TODO: Re-enable OTP generation and sending
            // otpService.generateAndSendOTP(phoneNumber, "DOCTOR");

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "OTP bypassed. Proceed to complete doctor registration (OTP verification disabled)."));

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
            // TODO: Re-enable OTP validation
            // boolean isValidOTP = otpService.validateOTP(phoneNumber, otp);
            //
            // if (!isValidOTP) {
            // return ResponseEntity.badRequest()
            // .body(ApiResponse.error("Invalid or expired OTP"));
            // }

            // TEMPORARY: Accept any OTP for development (bypass validation)
            log.info("OTP validation bypassed for doctor signup: {} (OTP verification disabled)", phoneNumber);

            // Ensure phone number matches (Doctor uses 'contact' field)
            if (!phoneNumber.equals(request.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Phone number mismatch"));
            }

            // Create doctor
            DoctorDTO doctorDTO = doctorService.createDoctor(request);

            // Generate JWT token for automatic login as DOCTOR
            String doctorName = (doctorDTO.getFirstName() != null && doctorDTO.getLastName() != null)
                    ? doctorDTO.getFirstName() + " " + doctorDTO.getLastName()
                    : (doctorDTO.getFirstName() != null ? doctorDTO.getFirstName()
                            : (doctorDTO.getLastName() != null ? doctorDTO.getLastName() : ""));
            String token = jwtUtil.generateToken(phoneNumber, "DOCTOR", doctorDTO.getId(), doctorName);

            AuthResponse authResponse = AuthResponse.success(token, "DOCTOR", doctorDTO.getId(), phoneNumber,
                    doctorName);

            return ResponseEntity.ok(
                    ApiResponse.success("Doctor registered and logged in successfully", authResponse));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Doctor registration failed: " + e.getMessage()));
        }
    }

    @Operation(summary = "Create a new doctor - Hospital Admin only (for staff use)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Doctor created successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body")
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> createDoctor(
            @Parameter(description = "Doctor creation request body", required = true) @Valid @RequestBody CreateDoctorRequest request) {
        DoctorDTO doctorDTO = doctorService.createDoctor(request);
        return new ResponseEntity<>(ApiResponse.success("Doctor created successfully", doctorDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update doctor - Doctor themselves or Hospital Admin")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor updated successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('SUPERADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(authentication.name, #id))")
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

    @Operation(summary = "Get all doctors with filters", description = "Retrieves a paginated list of doctors with filtering, searching and sorting options")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of doctors retrieved successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PageResponse.class)))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DoctorDTO>>> getAllDoctors(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by", example = "firstName") @RequestParam(defaultValue = "firstName") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "asc") @RequestParam(defaultValue = "asc") String sortDir,

            // Filter options
            @Parameter(description = "Search by name (first name or last name)", example = "John") @RequestParam(required = false) String name,
            @Parameter(description = "Filter by specialization", example = "Cardiology") @RequestParam(required = false) String specialization,
            @Parameter(description = "Filter by department", example = "Emergency") @RequestParam(required = false) String department,
            @Parameter(description = "Filter by hospital ID", example = "1") @RequestParam(required = false) Long hospitalId,
            @Parameter(description = "Filter by minimum experience years", example = "5") @RequestParam(required = false) Integer minExperience,
            @Parameter(description = "Filter by maximum experience years", example = "20") @RequestParam(required = false) Integer maxExperience,
            @Parameter(description = "Search by email", example = "doctor@example.com") @RequestParam(required = false) String email,
            @Parameter(description = "Search by phone number", example = "+1234567890") @RequestParam(required = false) String phoneNumber) {

        PageResponse<DoctorDTO> response = doctorService.getAllDoctors(
                pageNo, pageSize, sortBy, sortDir,
                name, specialization, department, hospitalId,
                minExperience, maxExperience, email, phoneNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get doctor count with filters", description = "Returns the total count of doctors matching the specified filter criteria")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor count retrieved successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getDoctorCount(
            @Parameter(description = "Search by name (first name or last name)", example = "John") @RequestParam(required = false) String name,
            @Parameter(description = "Filter by specialization", example = "Cardiology") @RequestParam(required = false) String specialization,
            @Parameter(description = "Filter by department", example = "Emergency") @RequestParam(required = false) String department,
            @Parameter(description = "Filter by hospital ID", example = "1") @RequestParam(required = false) Long hospitalId,
            @Parameter(description = "Filter by minimum experience years", example = "5") @RequestParam(required = false) Integer minExperience,
            @Parameter(description = "Filter by maximum experience years", example = "20") @RequestParam(required = false) Integer maxExperience,
            @Parameter(description = "Search by email", example = "doctor@example.com") @RequestParam(required = false) String email,
            @Parameter(description = "Search by phone number", example = "+1234567890") @RequestParam(required = false) String phoneNumber) {

        long count = doctorService.getDoctorCount(
                name, specialization, department, hospitalId,
                minExperience, maxExperience, email, phoneNumber);
        return ResponseEntity.ok(ApiResponse.success("Doctor count retrieved successfully", count));
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

    @Operation(summary = "Get doctor by phone number", description = "Retrieves doctor information by phone number - Public access")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor found successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @GetMapping("/phone/{phoneNumber}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorByPhoneNumber(
            @Parameter(description = "Phone number of the doctor", required = true) @PathVariable String phoneNumber) {
        DoctorDTO doctorDTO = doctorService.getDoctorByContact(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved successfully", doctorDTO));
    }

    @Operation(summary = "Get slot templates for a doctor", description = "Retrieves all slot templates for the specified doctor")
    @GetMapping("/{doctorId}/slot-templates")
    public ResponseEntity<ApiResponse<List<com.doc_app.booking.dto.SlotTemplateDTO>>> getDoctorSlotTemplates(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId) {

        List<com.doc_app.booking.dto.SlotTemplateDTO> templates = slotTemplateService.getSlotTemplateByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Slot templates retrieved successfully", templates));
    }

    @Operation(summary = "Get total count of all doctors", description = "Returns the total number of doctors in the system (no filters)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Total doctor count retrieved successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    @GetMapping("/all/count")
    public ResponseEntity<ApiResponse<Long>> getAllDoctorCount() {
        long count = doctorService.getDoctorCount(null, null, null, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("Total doctor count retrieved successfully", count));
    }
}