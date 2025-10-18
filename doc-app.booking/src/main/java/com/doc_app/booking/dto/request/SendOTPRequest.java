package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendOTPRequest {
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(PATIENT|DOCTOR|HOSPITAL_ADMIN)$", message = "Role must be PATIENT, DOCTOR, or HOSPITAL_ADMIN")
    private String role;
}