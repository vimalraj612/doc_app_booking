package com.doc_app.booking.service.impl;

import com.doc_app.booking.service.OTPService;
import com.doc_app.booking.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements OTPService {

    private final WhatsAppService whatsAppService;
    
    // In-memory OTP storage (use Redis in production)
    private final ConcurrentHashMap<String, OTPData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    
    // OTP expires in 5 minutes
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    @Override
    public String generateAndSendOTP(String phoneNumber, String role) {
        // Generate 6-digit OTP
        String otp = generateOTP();
        
        // Store OTP with expiry
        OTPData otpData = new OTPData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES), role);
        otpStorage.put(phoneNumber, otpData);
        
        // Send OTP via WhatsApp
        sendOTPViaWhatsApp(phoneNumber, otp, role);
        
        log.info("OTP generated and sent to phone: {} for role: {}", phoneNumber, role);
        
        // Return OTP for testing purposes (remove in production)
        return otp;
    }

    @Override
    public boolean validateOTP(String phoneNumber, String otp) {
        OTPData otpData = otpStorage.get(phoneNumber);
        
        if (otpData == null) {
            log.warn("No OTP found for phone: {}", phoneNumber);
            return false;
        }
        
        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for phone: {}", phoneNumber);
            otpStorage.remove(phoneNumber);
            return false;
        }
        
        boolean isValid = otpData.getOtp().equals(otp);
        
        if (isValid) {
            // Remove OTP after successful validation
            otpStorage.remove(phoneNumber);
            log.info("OTP validated successfully for phone: {}", phoneNumber);
        } else {
            log.warn("Invalid OTP for phone: {}", phoneNumber);
        }
        
        return isValid;
    }

    @Override
    public void clearExpiredOTPs() {
        LocalDateTime now = LocalDateTime.now();
        otpStorage.entrySet().removeIf(entry -> entry.getValue().getExpiryTime().isBefore(now));
        log.info("Expired OTPs cleared");
    }

    private String generateOTP() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void sendOTPViaWhatsApp(String phoneNumber, String otp, String role) {
        String roleDisplayName = getRoleDisplayName(role);
        
        String message = String.format(
            "🔐 *Login OTP* 🔐\n\n" +
            "Your OTP for %s login is:\n\n" +
            "*%s*\n\n" +
            "⏰ Valid for %d minutes\n" +
            "🚫 Do not share this OTP with anyone\n\n" +
            "If you didn't request this, please ignore.",
            roleDisplayName, otp, OTP_EXPIRY_MINUTES);
            
        try {
            whatsAppService.sendWhatsAppMessage(phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send OTP via WhatsApp to: {}", phoneNumber, e);
            // In production, you might want to fall back to SMS
        }
    }

    private String getRoleDisplayName(String role) {
        return switch (role.toUpperCase()) {
            case "HOSPITAL_ADMIN" -> "Hospital Admin";
            case "DOCTOR" -> "Doctor";
            case "PATIENT" -> "Patient";
            default -> "User";
        };
    }

    // Inner class to store OTP data
    private static class OTPData {
        private final String otp;
        private final LocalDateTime expiryTime;
        private final String role;

        public OTPData(String otp, LocalDateTime expiryTime, String role) {
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.role = role;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }

        public String getRole() {
            return role;
        }
    }
}