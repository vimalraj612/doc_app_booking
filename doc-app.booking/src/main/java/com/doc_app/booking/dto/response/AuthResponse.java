package com.doc_app.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String phoneNumber;
    private String message;
    
    public static AuthResponse success(String token, String role, Long userId, String phoneNumber) {
        return new AuthResponse(token, role, userId, phoneNumber, "Login successful");
    }
    
    public static AuthResponse otpSent(String phoneNumber) {
        return new AuthResponse(null, null, null, phoneNumber, "OTP sent successfully");
    }
}