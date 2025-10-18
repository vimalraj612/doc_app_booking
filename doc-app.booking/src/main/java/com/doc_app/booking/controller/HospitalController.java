package com.doc_app.booking.controller;

import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.dto.response.AuthResponse;
import com.doc_app.booking.service.HospitalService;
import com.doc_app.booking.service.OTPService;
import com.doc_app.booking.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
@Tag(name = "Hospitals", description = "Hospital management APIs with public signup")
@SecurityRequirement(name = "Bearer Authentication")
public class HospitalController {

    private final HospitalService hospitalService;
    private final OTPService otpService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup/send-otp")
    @Operation(summary = "Send OTP for hospital registration")
    public ResponseEntity<ApiResponse<String>> sendSignupOTP(@RequestParam String phoneNumber) {
        try {
            // Check if hospital already exists
            try {
                hospitalService.getHospitalByPhoneNumber(phoneNumber);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Hospital with this phone number already exists"));
            } catch (Exception e) {
                // Hospital doesn't exist, proceed with OTP
            }
            
            // Generate and send OTP
            otpService.generateAndSendOTP(phoneNumber, "HOSPITAL_ADMIN");
            
            return ResponseEntity.ok(
                ApiResponse.success("OTP sent successfully. Please verify to complete hospital registration.")
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to send OTP"));
        }
    }

    @PostMapping("/signup/verify-otp")
    @Operation(summary = "Verify OTP and complete hospital registration")
    public ResponseEntity<ApiResponse<AuthResponse>> verifySignupOTP(
            @RequestParam String phoneNumber,
            @RequestParam String otp,
            @Valid @RequestBody CreateHospitalRequest request) {
        try {
            // Validate OTP
            boolean isValidOTP = otpService.validateOTP(phoneNumber, otp);
            
            if (!isValidOTP) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid or expired OTP"));
            }
            
            // Ensure phone number matches
            if (!phoneNumber.equals(request.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Phone number mismatch"));
            }
            
            // Create hospital
            HospitalDTO hospitalDTO = hospitalService.createHospital(request);
            
            // Generate JWT token for automatic login as HOSPITAL_ADMIN
            String token = jwtUtil.generateToken(phoneNumber, "HOSPITAL_ADMIN", hospitalDTO.getId());
            
            AuthResponse authResponse = AuthResponse.success(token, "HOSPITAL_ADMIN", hospitalDTO.getId(), phoneNumber);
            
            return ResponseEntity.ok(
                ApiResponse.success("Hospital registered and logged in successfully", authResponse)
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Hospital registration failed: " + e.getMessage()));
        }
    }

    @PostMapping
    @Operation(summary = "Create new hospital - System Admin only (for staff use)")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')") // This would need a super admin role
    public ResponseEntity<ApiResponse<HospitalDTO>> createHospital(@Valid @RequestBody CreateHospitalRequest request) {
        // This endpoint is for System Admin to create hospitals directly (if implemented)
        HospitalDTO hospitalDTO = hospitalService.createHospital(request);
        return new ResponseEntity<>(ApiResponse.success("Hospital created successfully", hospitalDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update hospital - Hospital Admin can only update their own hospital")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<HospitalDTO>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHospitalRequest request,
            HttpServletRequest httpRequest) {
        
        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");
        
        // Hospital admin can only update their own hospital
        if ("HOSPITAL_ADMIN".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You can only update your own hospital"));
        }
        
        HospitalDTO hospitalDTO = hospitalService.updateHospital(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", hospitalDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalDTO>> getHospital(@PathVariable Long id) {
        HospitalDTO hospitalDTO = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.success(hospitalDTO));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HospitalDTO>>> getAllHospitals(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<HospitalDTO> response = hospitalService.getAllHospitals(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HospitalDTO>>> searchHospitals(@RequestParam String keyword) {
        List<HospitalDTO> hospitals = hospitalService.searchHospitals(keyword);
        return ResponseEntity.ok(ApiResponse.success(hospitals));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<HospitalDTO>> getHospitalByEmail(@PathVariable String email) {
        HospitalDTO hospitalDTO = hospitalService.getHospitalByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(hospitalDTO));
    }
}