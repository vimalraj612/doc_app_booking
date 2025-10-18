package com.doc_app.booking.controller;

import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.request.SendOTPRequest;
import com.doc_app.booking.dto.request.VerifyOTPRequest;
import com.doc_app.booking.dto.response.AuthResponse;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Hospital;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.model.Role;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.HospitalRepository;
import com.doc_app.booking.repository.PatientRepository;
import com.doc_app.booking.security.JwtUtil;
import com.doc_app.booking.service.OTPService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs for OTP-based login")
public class AuthController {

    private final OTPService otpService;
    private final JwtUtil jwtUtil;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    @Operation(summary = "Send OTP for login")
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendOTP(@Valid @RequestBody SendOTPRequest request) {
        try {
            // Validate phone number exists for the specified role
            boolean userExists = validateUserExists(request.getPhoneNumber(), request.getRole());
            
            if (!userExists) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No " + request.getRole().toLowerCase() + 
                                         " found with this phone number"));
            }
            
            // Generate and send OTP
            String otp = otpService.generateAndSendOTP(request.getPhoneNumber(), request.getRole());
            
            log.info("OTP sent to {} for role {}", request.getPhoneNumber(), request.getRole());
            
            return ResponseEntity.ok(
                ApiResponse.success(AuthResponse.otpSent(request.getPhoneNumber()))
            );

        } catch (Exception e) {
            log.error("Error sending OTP", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to send OTP"));
        }
    }

    @Operation(summary = "Verify OTP and login")
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        try {
            // Validate OTP
            boolean isValidOTP = otpService.validateOTP(request.getPhoneNumber(), request.getOtp());
            
            if (!isValidOTP) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid or expired OTP"));
            }
            
            // Find user and generate JWT token
            UserInfo userInfo = findUserByPhoneAndRole(request.getPhoneNumber(), request.getRole());
            
            if (userInfo == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User not found"));
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                request.getPhoneNumber(), 
                request.getRole(), 
                userInfo.getUserId()
            );
            
            AuthResponse response = AuthResponse.success(
                token, 
                request.getRole(), 
                userInfo.getUserId(), 
                request.getPhoneNumber()
            );
            
            log.info("User {} logged in successfully with role {}", request.getPhoneNumber(), request.getRole());
            
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error verifying OTP", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Login failed"));
        }
    }

    @Operation(summary = "Patient login with phone number and OTP")
    @PostMapping("/patient/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendPatientOTP(@RequestParam String phoneNumber) {
        SendOTPRequest request = new SendOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setRole("PATIENT");
        return sendOTP(request);
    }

    @Operation(summary = "Patient OTP verification")
    @PostMapping("/patient/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPatientOTP(
            @RequestParam String phoneNumber, 
            @RequestParam String otp) {
        VerifyOTPRequest request = new VerifyOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setOtp(otp);
        request.setRole("PATIENT");
        return verifyOTP(request);
    }

    @Operation(summary = "Doctor login with phone number and OTP")
    @PostMapping("/doctor/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendDoctorOTP(@RequestParam String phoneNumber) {
        SendOTPRequest request = new SendOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setRole("DOCTOR");
        return sendOTP(request);
    }

    @Operation(summary = "Doctor OTP verification")
    @PostMapping("/doctor/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyDoctorOTP(
            @RequestParam String phoneNumber, 
            @RequestParam String otp) {
        VerifyOTPRequest request = new VerifyOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setOtp(otp);
        request.setRole("DOCTOR");
        return verifyOTP(request);
    }

    @Operation(summary = "Hospital admin login with phone number and OTP")
    @PostMapping("/hospital-admin/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendHospitalAdminOTP(@RequestParam String phoneNumber) {
        SendOTPRequest request = new SendOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setRole("HOSPITAL_ADMIN");
        return sendOTP(request);
    }

    @Operation(summary = "Hospital admin OTP verification")
    @PostMapping("/hospital-admin/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyHospitalAdminOTP(
            @RequestParam String phoneNumber, 
            @RequestParam String otp) {
        VerifyOTPRequest request = new VerifyOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setOtp(otp);
        request.setRole("HOSPITAL_ADMIN");
        return verifyOTP(request);
    }

    private boolean validateUserExists(String phoneNumber, String role) {
        return switch (Role.fromString(role)) {
            case PATIENT -> patientRepository.findByPhoneNumber(phoneNumber).isPresent();
            case DOCTOR -> doctorRepository.findByContact(phoneNumber).isPresent();
            case HOSPITAL_ADMIN -> hospitalRepository.findByPhoneNumber(phoneNumber).isPresent();
        };
    }

    private UserInfo findUserByPhoneAndRole(String phoneNumber, String role) {
        return switch (Role.fromString(role)) {
            case PATIENT -> {
                Optional<Patient> patient = patientRepository.findByPhoneNumber(phoneNumber);
                yield patient.map(p -> new UserInfo(p.getId(), role)).orElse(null);
            }
            case DOCTOR -> {
                Optional<Doctor> doctor = doctorRepository.findByContact(phoneNumber);
                yield doctor.map(d -> new UserInfo(d.getId(), role)).orElse(null);
            }
            case HOSPITAL_ADMIN -> {
                Optional<Hospital> hospital = hospitalRepository.findByPhoneNumber(phoneNumber);
                yield hospital.map(h -> new UserInfo(h.getId(), role)).orElse(null);
            }
        };
    }

    // Helper class for user information
    private static class UserInfo {
        private final Long userId;
        private final String role;

        public UserInfo(Long userId, String role) {
            this.userId = userId;
            this.role = role;
        }

        public Long getUserId() {
            return userId;
        }

        public String getRole() {
            return role;
        }
    }
}