package com.doc_app.booking.controller;

import org.springframework.beans.factory.annotation.Value;

import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.request.SendOTPRequest;
import com.doc_app.booking.dto.request.VerifyOTPRequest;
import com.doc_app.booking.dto.response.AuthResponse;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Hospital;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.model.Role;
import com.doc_app.booking.service.DoctorService;
import com.doc_app.booking.service.HospitalService;
import com.doc_app.booking.service.PatientService;
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

    // Superadmin config values
    @Value("${superadmin.phone}")
    private String superadminPhone;
    @Value("${superadmin.name}")
    private String superadminName;
    @Value("${superadmin.role}")
    private String superadminRole;
    @Value("${superadmin.id}")
    private Long superadminId;

    private final OTPService otpService;
    private final JwtUtil jwtUtil;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final HospitalService hospitalService;

    // In-memory OTP store for superadmin (for demo; replace with a real OTP service
    // in production)
    private String superadminOtp = null;

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

            // TODO: Re-enable OTP generation and sending
            // String otp = otpService.generateAndSendOTP(request.getPhoneNumber(),
            // request.getRole());

            log.info("OTP bypassed for {} with role {} (OTP verification disabled)", request.getPhoneNumber(),
                    request.getRole());

            return ResponseEntity.ok(
                    ApiResponse.success(AuthResponse.otpSent(request.getPhoneNumber())));

        } catch (Exception e) {
            log.error("Error in send OTP (OTP disabled)", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to process login request"));
        }
    }

    @Operation(summary = "Verify OTP and login")
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        try {
            // TODO: Re-enable OTP validation
            // boolean isValidOTP = otpService.validateOTP(request.getPhoneNumber(),
            // request.getOtp());
            //
            // if (!isValidOTP) {
            // return ResponseEntity.badRequest()
            // .body(ApiResponse.error("Invalid or expired OTP"));
            // }

            // TEMPORARY: Accept any OTP for development (bypass validation)
            log.info("OTP validation bypassed for {} (OTP verification disabled)", request.getPhoneNumber());

            // Special handling for SUPERADMIN: skip DB lookup, use config
            if ("SUPERADMIN".equalsIgnoreCase(request.getRole()) && superadminPhone.equals(request.getPhoneNumber())) {
                String token = jwtUtil.generateToken(superadminPhone, superadminRole, superadminId, superadminName);
                AuthResponse response = AuthResponse.success(token, superadminRole, superadminId, superadminPhone,
                        superadminName);
                log.info("Superadmin logged in successfully (OTP bypassed)");
                return ResponseEntity.ok(ApiResponse.success(response));
            }

            // Find user and generate JWT token
            UserInfo userInfo = findUserByPhoneAndRole(request.getPhoneNumber(), request.getRole());
            if (userInfo == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User not found"));
            }
            String token = jwtUtil.generateToken(
                    request.getPhoneNumber(),
                    request.getRole(),
                    userInfo.getUserId(),
                    userInfo.getName());
            AuthResponse response = AuthResponse.success(
                    token,
                    request.getRole(),
                    userInfo.getUserId(),
                    request.getPhoneNumber(),
                    userInfo.getName());

            log.info("User {} logged in successfully with role {} (OTP bypassed)", request.getPhoneNumber(),
                    request.getRole());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error in verify OTP (OTP disabled)", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Login failed"));
        }
    }

    @Operation(summary = "Send OTP for superadmin login")
    @PostMapping("/superadmin/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendSuperadminOTP(@RequestParam String phoneNumber) {
        if (!superadminPhone.equals(phoneNumber)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid superadmin phone number"));
        }
        SendOTPRequest request = new SendOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setRole("SUPERADMIN");
        return sendOTP(request);
    }

    @Operation(summary = "Verify OTP and login for superadmin")
    @PostMapping("/superadmin/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifySuperadminOTP(@RequestParam String phoneNumber,
            @RequestParam String otp) {
        if (!superadminPhone.equals(phoneNumber)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid superadmin phone number"));
        }
        VerifyOTPRequest request = new VerifyOTPRequest();
        request.setPhoneNumber(phoneNumber);
        request.setOtp(otp);
        request.setRole("SUPERADMIN");
        return verifyOTP(request);
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
            case PATIENT -> patientService.getPatientByPhoneNumber(phoneNumber) != null;
            case DOCTOR -> doctorService.existsByContact(phoneNumber);
            case HOSPITAL_ADMIN -> hospitalService.existsByPhoneNumber(phoneNumber);
            case SUPERADMIN -> true;
        };
    }

    private UserInfo findUserByPhoneAndRole(String phoneNumber, String role) {
        return switch (Role.fromString(role)) {
            case PATIENT -> {
                com.doc_app.booking.dto.UserInfoDTO dto = patientService.findUserInfoByPhoneNumber(phoneNumber);
                yield dto != null ? new UserInfo(dto.getUserId(), dto.getRole(), dto.getName()) : null;
            }
            case DOCTOR -> {
                com.doc_app.booking.dto.UserInfoDTO dto = doctorService.findUserInfoByContact(phoneNumber);
                yield dto != null ? new UserInfo(dto.getUserId(), dto.getRole(), dto.getName()) : null;
            }
            case HOSPITAL_ADMIN -> {
                com.doc_app.booking.dto.UserInfoDTO dto = hospitalService.findUserInfoByPhoneNumber(phoneNumber);
                yield dto != null ? new UserInfo(dto.getUserId(), dto.getRole(), dto.getName()) : null;
            }
            case SUPERADMIN -> new UserInfo(superadminId, superadminRole, superadminName);
        };
    }

    private String buildPatientName(Patient p) {
        if (p.getFirstName() != null && p.getLastName() != null) {
            return p.getFirstName() + " " + p.getLastName();
        }
        return p.getFirstName() != null ? p.getFirstName() : (p.getLastName() != null ? p.getLastName() : "");
    }

    private String buildDoctorName(Doctor d) {
        if (d.getFirstName() != null && d.getLastName() != null) {
            return d.getFirstName() + " " + d.getLastName();
        }
        return d.getFirstName() != null ? d.getFirstName() : (d.getLastName() != null ? d.getLastName() : "");
    }

    // Helper class for user information
    private static class UserInfo {
        private final Long userId;
        private final String role;
        private final String name;

        public UserInfo(Long userId, String role, String name) {
            this.userId = userId;
            this.role = role;
            this.name = name;
        }

        public Long getUserId() {
            return userId;
        }

        public String getRole() {
            return role;
        }

        public String getName() {
            return name;
        }
    }
}