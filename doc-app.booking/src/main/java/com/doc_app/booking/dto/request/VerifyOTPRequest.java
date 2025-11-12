package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOTPRequest {
    
    @NotBlank(message = "{" + MessageKeys.PHONE_REQUIRED + "}")
    @ValidPhoneNumber
    private String phoneNumber;
    
    @NotBlank(message = "{" + MessageKeys.OTP_REQUIRED + "}")
    @Size(min = 6, max = 6, message = "{" + MessageKeys.OTP_SIZE + "}")
    @Pattern(regexp = "^\\d{6}$", message = "{" + MessageKeys.OTP_INVALID + "}")
    private String otp;
    
    @NotBlank(message = "{" + MessageKeys.ROLE_REQUIRED + "}")
    @Pattern(regexp = "^(PATIENT|DOCTOR|HOSPITAL_ADMIN)$", message = "{" + MessageKeys.ROLE_INVALID + "}")
    private String role;
}