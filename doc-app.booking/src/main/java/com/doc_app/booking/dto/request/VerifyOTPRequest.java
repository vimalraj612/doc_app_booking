package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOTPRequest {
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must contain only digits")
    private String otp;
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(PATIENT|DOCTOR|HOSPITAL_ADMIN)$", message = "Role must be PATIENT, DOCTOR, or HOSPITAL_ADMIN")
    private String role;
}