package com.doc_app.booking.service;

/**
 * Service for OTP generation and validation
 */
public interface OTPService {
    
    /**
     * Generate and send OTP to phone number
     * @param phoneNumber Phone number to send OTP
     * @param role User role for context
     * @return Generated OTP (for testing purposes - remove in production)
     */
    String generateAndSendOTP(String phoneNumber, String role);
    
    /**
     * Validate OTP for phone number
     * @param phoneNumber Phone number
     * @param otp OTP to validate
     * @return true if valid, false otherwise
     */
    boolean validateOTP(String phoneNumber, String otp);
    
    /**
     * Clear expired OTPs
     */
    void clearExpiredOTPs();
}